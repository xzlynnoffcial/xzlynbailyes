"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const chalk = require("chalk").default || require("chalk");
const axios = require("axios");

// URL Server Membership (Bisa diganti via Env Variable XZLYNN_SERVER)
const FORWARDER_URL = process.env.XZLYNN_SERVER || "https://xzlynn-api-forwarder-netlify.netlify.app";
const CACHE_FILE = path.join(process.cwd(), ".xzlynn_key");


var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function (m, exports) {
    for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
            __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.proto = exports.makeWASocket = exports.xzlyne = exports.createXzlyneApi = void 0;
const WAProto_1 = require("../WAProto");
Object.defineProperty(exports, "proto", {
    enumerable: true,
    get: function () {
        return WAProto_1.proto;
    }
});
const Socket_1 = __importDefault(require("./Socket"));
const xzlyne_api_1 = require("./Utils/xzlyne-api");
Object.defineProperty(exports, "createXzlyneApi", { enumerable: true, get: function () { return xzlyne_api_1.createXzlyneApi; } });
Object.defineProperty(exports, "xzlyne", { enumerable: true, get: function () { return xzlyne_api_1.xzlyne; } });
// ── Global API Injection ──────────────────────────────────────────────────────
if (typeof globalThis.xzlyne === 'undefined') {
    globalThis.xzlyne = xzlyne_api_1.xzlyne;
}
if (typeof globalThis.createXzlyneApi === 'undefined') {
    globalThis.createXzlyneApi = xzlyne_api_1.createXzlyneApi;
}
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Xzlynn Membership Security Check
 */
async function validateMembership(key) {
    if (!key)
        return { status: false, msg: "Auth Key / Serial MD diperlukan!" };
    try {
        const response = await axios.post(`${FORWARDER_URL}/membership/check`, {
            key: key,
            timestamp: Date.now()
        });
        return response.data;
    }
    catch (e) {
        return {
            status: false,
            msg: "Gagal terhubung ke sistem keamanan Xzlynn. Periksa koneksi internet Anda."
        };
    }
}
/**
 * Terminal Interactive Input
 */
function askAuthKey() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        console.log(chalk.yellow("\n[ AKTIVASI PREMIUM ]"));
        console.log(chalk.white("Auth Key tidak ditemukan di config atau cache."));
        rl.question(chalk.cyan("Masukkan Auth Key Premium Anda: "), (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
// ── Xzlyne Bailyes Banner ───────────────────────────────────────────────────
const _banner = {
    line: chalk.hex('#10B981')('━'.repeat(60)),
    title: chalk.bold.hex('#34D399')('⬡  Baileys Mod  ') + chalk.hex('#059669')('| Beta Edition v0.0.12'),
    pair: chalk.hex('#10B981')('⌘  Membership : ') + chalk.bold.white('ACTIVE'),
    repo: chalk.hex('#10B981')('❖  Security : ') + chalk.bold.cyan('VERIFIED'),
    note: chalk.dim.hex('#6EE7B7')('   Powered by Xzlynn Official - Self-Message Fix & Feature Sync'),
};
// Banner & IIFE Security Check
(async () => {
    console.log(_banner.line);
    console.log(_banner.title);
    console.log(_banner.note);
    console.log(_banner.line);
    // Delay 250ms agar variabel global dari file eksternal (config.js) siap
    setTimeout(async () => {
        let authKey = global.authKeymd || process.env.XZLYNN_AUTH;
        // 1. Cek Cache File di Root Project jika di config/env kosong
        if (!authKey && fs.existsSync(CACHE_FILE)) {
            try {
                authKey = fs.readFileSync(CACHE_FILE, "utf8").trim();
            }
            catch (e) { }
        }
        // 2. Jika masih kosong, minta input interaktif via terminal
        if (!authKey) {
            authKey = await askAuthKey();
        }
        process.stdout.write(chalk.cyan("Checking membership status... "));
        const check = await validateMembership(authKey);
        if (check.status === true) {
            console.log(chalk.green("Verified! Welcome back.\n"));
            // Simpan ke Cache File di Root agar tidak perlu isi lagi
            if (authKey) {
                fs.writeFileSync(CACHE_FILE, authKey, "utf8");
            }
        }
        else {
            console.log(chalk.red("Failed!"));
            console.log(chalk.red.bold("\n[ AKSES DITOLAK ]"));
            console.log(chalk.yellow(`Keterangan: ${check.msg || "Membership tidak ditemukan atau sudah kadaluarsa."}`));
            console.log(chalk.white("Silakan registrasi atau perpanjang membership di:"));
            console.log(chalk.blue.underline("https://register.xzlynnofficial.biz.id\n"));
            // Hapus cache jika isinya ternyata tidak valid (key hangus)
            if (fs.existsSync(CACHE_FILE))
                fs.unlinkSync(CACHE_FILE);
            process.exit(1);
        }
    }, 250);
})();
/**
 * Wrapper makeWASocket (Clean Version)
 */
exports.makeWASocket = (config) => {
    return (0, Socket_1.default)(config);
};
__exportStar(require("../WAProto"), exports);
__exportStar(require("./Utils"), exports);
__exportStar(require("./Types"), exports);
__exportStar(require("./Store"), exports);
__exportStar(require("./Defaults"), exports);
__exportStar(require("./WABinary"), exports);
__exportStar(require("./WAM"), exports);
__exportStar(require("./WAUSync"), exports);
exports.default = Socket_1.default;
