/**
 * xzlyne.js
 * HTTP client wrapper untuk https://api.xzlyne.web.id
 *
 * Usage:
 *   import { createXzlyne } from 'xzlynbailyes';
 *   const xzlyne = createXzlyne();
 *
 *   // GET sederhana
 *   const res = await xzlyne.get('/search/spotify?q=swim');
 *
 *   // GET dengan params object (auto-encode)
 *   const res = await xzlyne.get('/search/spotify', { q: 'swim' });
 *
 *   // Path dengan sub-kategori + params
 *   const res = await xzlyne.get('/manga/jagoanmanga/search', { q: 'killer+peter' });
 *
 *   // POST
 *   const res = await xzlyne.post('/ai/chatgpt', { text: 'halo' });
 *
 *   // Akses data
 *   console.log(res.result);   // data utama
 *   console.log(res.status);   // true/false
 *   console.log(res.raw);      // full response JSON
 */

const XZLYNE_BASE = 'https://api.myxzlyn.my.id';

/**
 * Buat instance Xzlyne API client.
 * @param {object} [config]
 * @param {string} [config.baseUrl]   — override base URL
 * @param {string} [config.apiKey]    — API key jika diperlukan (ditaruh di header)
 * @param {number} [config.timeout]   — timeout ms (default 30000)
 * @param {object} [config.headers]   — header tambahan
 */
exports.createXzlyne = function createXzlyne(config = {}) {
    const {
        baseUrl = XZLYNE_BASE,
        apiKey,
        timeout = 30_000,
        headers: extraHeaders = {}
    } = config;

    const _base = baseUrl.replace(/\/$/, '');

    // ── build URL ──────────────────────────────────────────────────────────
    function _buildUrl(path, params) {
        // path bisa sudah include query string atau tidak
        const hasQuery = path.includes('?');

        let url = _base + (path.startsWith('/') ? path : '/' + path);

        if (params && typeof params === 'object' && Object.keys(params).length > 0) {
            const qs = Object.entries(params)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
                .join('&');
            if (qs) url += (hasQuery ? '&' : '?') + qs;
        }

        return url;
    }

    // ── base fetch ─────────────────────────────────────────────────────────
    async function _fetch(method, path, params, body) {
        let url = _buildUrl(path, method === 'GET' ? params : undefined);

        if (apiKey) {
            const separator = url.includes('?') ? '&' : '?';
            url = `${url}${separator}apikey=${encodeURIComponent(apiKey)}`;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'xzlynbailyes/1.1.5',
            ...extraHeaders
        };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        let res;
        try {
            res = await fetch(url, {
                method,
                headers,
                signal: controller.signal,
                ...(method !== 'GET' && body !== undefined
                    ? { body: JSON.stringify(body ?? params) }
                    : {})
            });
        } finally {
            clearTimeout(timer);
        }

        // Try parse JSON, fallback ke text
        let data;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            try { data = JSON.parse(text); } catch { data = { result: text }; }
        }

        if (!res.ok) {
            const err = new Error(
                `[Xzlyne] ${method} ${url} → ${res.status} ${res.statusText}: ` +
                (data?.message || data?.error || JSON.stringify(data))
            );
            err.status = res.status;
            err.data = data;
            throw err;
        }

        // Normalise response
        return _wrap(data, url);
    }

    // ── response wrapper ───────────────────────────────────────────────────
    function _wrap(data, url) {
        return {
            /** Data utama (data.result / data.data / root jika tidak ada keduanya) */
            get result() {
                return data?.result ?? data?.data ?? data;
            },
            /** true jika API mengembalikan status sukses */
            get status() {
                return data?.status === true || data?.success === true || data?.status === 200;
            },
            /** Pesan dari API */
            get message() {
                return data?.message ?? data?.msg ?? '';
            },
            /** Full response JSON mentah */
            raw: data,
            /** URL yang dipanggil */
            url,
            /** Shortcut: ambil field tertentu dari result */
            get(key) {
                const r = this.result;
                if (r && typeof r === 'object') return r[key];
                return undefined;
            }
        };
    }

    // ── public API ─────────────────────────────────────────────────────────

    return {
        /**
         * GET request ke Xzlyne API.
         *
         * @param {string} path          — misal '/search/spotify' atau '/search/spotify?q=swim'
         * @param {object} [params]      — query params object { q: 'swim' }
         * @returns {Promise<XzlyneResponse>}
         *
         * @example
         * // Keduanya ekuivalen:
         * await xzlyne.get('/search/spotify?q=swim');
         * await xzlyne.get('/search/spotify', { q: 'swim' });
         *
         * // Sub-path
         * await xzlyne.get('/manga/jagoanmanga/search', { q: 'killer+peter' });
         *
         * // Akses result
         * const { result } = await xzlyne.get('/search/youtube', { q: 'lagu baru' });
         * console.log(result);
         */
        async get(path, params) {
            return _fetch('GET', path, params);
        },

        /**
         * POST request ke Xzlyne API.
         *
         * @param {string} path
         * @param {object} [body]   — body JSON
         * @param {object} [params] — query params opsional
         * @returns {Promise<XzlyneResponse>}
         */
        async post(path, body, params) {
            return _fetch('POST', path, params, body);
        },

        /**
         * Shortcut builder — buat caller untuk kategori tertentu.
         *
         * @param {string} category   — misal 'search', 'manga', 'ai'
         * @returns {{ get(endpoint, params): Promise, post(endpoint, body, params): Promise }}
         *
         * @example
         * const search = xzlyne.category('search');
         * await search.get('spotify', { q: 'swim' });
         * await search.get('youtube', { q: 'lagu baru' });
         *
         * const manga = xzlyne.category('manga/jagoanmanga');
         * await manga.get('search', { q: 'killer+peter' });
         */
        category(cat) {
            const prefix = '/' + cat.replace(/^\/|\/$/g, '');
            return {
                async get(endpoint, params) {
                    return _fetch('GET', `${prefix}/${endpoint}`, params);
                },
                async post(endpoint, body, params) {
                    return _fetch('POST', `${prefix}/${endpoint}`, params, body);
                }
            };
        },

        /** Base URL yang dipakai */
        baseUrl: _base,
    };
}

// ── Global mutable instance ────────────────────────────────────────────────
// Config yang bisa diubah kapanpun via xzlyne.setKey() / xzlyne.setConfig()
let _globalConfig = {};

function _makeGlobal() {
    // Proxy yang selalu pakai _globalConfig terbaru saat dipanggil
    const handler = {
        get(_, prop) {
            if (prop === 'setKey') {
                /**
                 * Set API key untuk global xzlyne instance.
                 * Cukup tulis SEKALI di bot.js setelah require baileys.
                 *
                 * @param {string} key
                 * @example
                 * xzlyne.setKey('API_KEY_KAMU')
                 */
                return function setKey(key) {
                    _globalConfig = { ..._globalConfig, apiKey: key };
                };
            }
            if (prop === 'setConfig') {
                /**
                 * Set konfigurasi lengkap untuk global xzlyne instance.
                 *
                 * @param {object} config  { apiKey, baseUrl, timeout, headers }
                 * @example
                 * xzlyne.setConfig({ apiKey: 'xxx', timeout: 15000 })
                 */
                return function setConfig(config) {
                    _globalConfig = { ..._globalConfig, ...config };
                };
            }
            // Delegate ke instance baru yang dibuat dengan config terkini
            const instance = exports.createXzlyne(_globalConfig);
            const val = instance[prop];
            return typeof val === 'function' ? val.bind(instance) : val;
        }
    };
    return new Proxy({}, handler);
}

/**
 * Instance default global siap pakai.
 * Tersedia tanpa import apapun setelah require('xzlynbailyes').
 *
 * Tanpa API key:
 * @example
 * await xzlyne.get('/search/spotify', { q: 'swim' })
 *
 * Set API key sekali di bot.js:
 * @example
 * xzlyne.setKey('API_KEY_KAMU')
 * // setelah ini semua request otomatis pakai key tersebut
 * await xzlyne.get('/premium/endpoint', { q: 'test' })
 *
 * Set config lengkap:
 * @example
 * xzlyne.setConfig({ apiKey: 'xxx', timeout: 15000 })
 */
exports.xzlyne = _makeGlobal();
