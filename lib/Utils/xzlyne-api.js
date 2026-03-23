/**
 * xzlyne-api.js
 * Client untuk API https://api.myxzlyn.my.id
 *
 * Pola URL:
 *   /{kategori}/{endpoint}?{param}={value}
 *   /{kategori}/{sub}/{endpoint}?{param}={value}
 *
 * Contoh:
 *   await xzlyne.get('/search/spotify?q=swim')
 *   await xzlyne.get('/search/youtube?q=hello')
 *   await xzlyne.get('/downloader/tiktok?url=https://...')
 *   await xzlyne.get('/manga/jagoanmanga/search?q=killer+peter')
 *   await xzlyne.get('/ai/gpt?text=hello')
 */

const BASE_URL = 'https://api.myxzlyn.my.id';

/**
 * Buat Xzlyne API client.
 *
 * @param {object} [options]
 * @param {string} [options.apiKey]         — API key jika diperlukan
 * @param {number} [options.timeout=15000]  — timeout dalam ms
 * @param {object} [options.headers]        — header tambahan
 *
 * @example
 * import { createXzlyneApi } from 'xzlynbailyes';
 * const xzlyne = createXzlyneApi();
 *
 * // Atau dengan API key:
 * const xzlyne = createXzlyneApi({ apiKey: 'your-key' });
 */
export function createXzlyneApi(options = {}) {
    const {
        apiKey,
        timeout = 15000,
        headers: extraHeaders = {}
    } = options;

    const baseHeaders = {
        'Accept': 'application/json',
        'User-Agent': 'xzlynbailyes/1.1.5-nl',
        ...extraHeaders
    };

    /**
     * Fetch dengan timeout.
     */
    /**
     * Fetch dengan timeout.
     */
    async function _fetch(url, opts = {}) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            if (apiKey) {
                const separator = url.includes('?') ? '&' : '?';
                url = `${url}${separator}apikey=${encodeURIComponent(apiKey)}`;
            }
            const res = await fetch(url, {
                ...opts,
                signal: controller.signal,
                headers: { ...baseHeaders, ...(opts.headers || {}) }
            });
            // Try parse JSON, fallback ke text
            let data;
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
                data = await res.json();
            }
            else {
                const text = await res.text();
                try {
                    data = JSON.parse(text);
                }
                catch (e) {
                    data = { result: text };
                }
            }
            if (!res.ok) {
                const errText = data?.message || data?.error || res.statusText;
                throw new Error(`Xzlyne API error ${res.status}: ${errText}`);
            }
            // Normalise response
            return _wrap(data, url);
        }
        finally {
            clearTimeout(timer);
        }
    }
    /**
     * response wrapper
     */
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
                if (r && typeof r === 'object')
                    return r[key];
                return undefined;
            }
        };
    }
    /**
     * Normalise path — pastikan leading slash ada.
     */
    function _url(path) {
        const p = path.startsWith('/') ? path : `/${path}`;
        return `${BASE_URL}${p}`;
    }
    // ── Public methods ──────────────────────────────────────────────────────
    /**
     * GET request ke Xzlyne API.
     *
     * @param {string} path  — path + query string, contoh: '/search/spotify?q=swim'
     * @returns {Promise<object|Buffer>}
     *
     * @example
     * const res = await xzlyne.get('/search/spotify?q=swim')
     * const res = await xzlyne.get('/manga/jagoanmanga/search?q=killer+peter')
     */
    async function get(path) {
        return _fetch(_url(path));
    }
    /**
     * GET dengan params object — otomatis di-encode ke query string.
     *
     * @param {string} path       — path tanpa query string
     * @param {object} [params]   — query params
     *
     * @example
     * const res = await xzlyne.fetch('/search/spotify', { q: 'swim' })
     * const res = await xzlyne.fetch('/manga/jagoanmanga/search', { q: 'killer peter' })
     * const res = await xzlyne.fetch('/downloader/tiktok', { url: 'https://...' })
     */
    async function fetchApi(path, params = {}) {
        const base = path.startsWith('/') ? path : `/${path}`;
        const qs = new URLSearchParams(Object.fromEntries(Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)]))).toString();
        const full = qs ? `${BASE_URL}${base}?${qs}` : `${BASE_URL}${base}`;
        return _fetch(full);
    }
    /**
     * POST request.
     *
     * @param {string} path
     * @param {object} [body]
     *
     * @example
     * const res = await xzlyne.post('/ai/gpt', { text: 'hello' })
     */
    async function post(path, body = {}) {
        return _fetch(_url(path), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }

    // ── Shorthand helpers ───────────────────────────────────────────────────

    /** Search wrapper — xzlyne.search('spotify', 'swim') */
    async function search(endpoint, query) {
        return fetchApi(`/search/${endpoint}`, { q: query });
    }

    /** Downloader wrapper — xzlyne.download('tiktok', url) */
    async function download(endpoint, url) {
        return fetchApi(`/downloader/${endpoint}`, { url });
    }

    /** AI wrapper — xzlyne.ai('gpt', text) */
    async function ai(endpoint, text, extra = {}) {
        return fetchApi(`/ai/${endpoint}`, { text, ...extra });
    }

    /** Sticker wrapper — xzlyne.sticker(endpoint, url) */
    async function sticker(endpoint, url) {
        return fetchApi(`/sticker/${endpoint}`, { url });
    }

    /** Manga wrapper — xzlyne.manga('jagoanmanga', 'search', { q: 'killer' }) */
    async function manga(site, endpoint, params = {}) {
        return fetchApi(`/manga/${site}/${endpoint}`, params);
    }

    /** Game wrapper — xzlyne.game(endpoint, params) */
    async function game(endpoint, params = {}) {
        return fetchApi(`/game/${endpoint}`, params);
    }

    return {
        // Core
        get,
        fetch: fetchApi,
        post,
        // Shorthands
        search,
        download,
        ai,
        sticker,
        manga,
        game,
        // Expose base URL
        BASE_URL,
    };
}

/**
 * Instance default tanpa API key — siap pakai langsung.
 *
 * @example
 * import { xzlyne } from 'xzlynbailyes';
 * const res = await xzlyne.get('/search/spotify?q=swim');
 */
export const xzlyne = createXzlyneApi();
