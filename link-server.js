import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LINK_PORT = Number(process.env.LINK_PORT) || 3000;
// Auto-detect the dev server port. Prefer explicit `DEV_PORT`, then `PORT` (common in dev tools),
// then `PUBLIC_PORT`, and finally fall back to the Codespaces preview default 8443.
const DEV_PORT =
    Number(process.env.DEV_PORT) || Number(process.env.PORT) || Number(process.env.PUBLIC_PORT) || 8443;
const HOST = process.env.HOST || '0.0.0.0';

const publicPaths = ['dist', 'public'];
const PUBLIC_DIR = publicPaths.map(dir => path.join(__dirname, dir)).find(dirPath => fs.existsSync(dirPath));

if (!PUBLIC_DIR) {
    console.error(`❌ No public directory found. Checked: ${publicPaths.join(', ')}`);
    process.exit(1);
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
    const requestPath = req.url === '/' ? 'index.html' : req.url.replace(/^(\/)+/, '');
    let filePath = path.join(PUBLIC_DIR, requestPath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        // If static file exists, serve it
        if (!err) {
            if (stats.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }

            fs.readFile(filePath, (readErr, data) => {
                if (readErr) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                    return;
                }

                const ext = path.extname(filePath).toLowerCase();
                const contentType = MIME_TYPES[ext] || 'application/octet-stream';

                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=3600',
                });
                res.end(data);
            });
            return;
        }

        // Static file not found: proxy request to the dev server.
        const devHost = '127.0.0.1';
        const proxyOptions = {
            hostname: devHost,
            port: DEV_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers,
        };

        const proxyReq = http.request(proxyOptions, proxyRes => {
            // Forward status and headers
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', () => {
            // If dev server is not available, try serving preview.html fallback
            const previewFallback = path.join(PUBLIC_DIR, 'preview.html');
            if (fs.existsSync(previewFallback)) {
                fs.readFile(previewFallback, (readErr, data) => {
                    if (readErr) {
                        res.writeHead(502, { 'Content-Type': 'text/plain' });
                        res.end('Bad Gateway');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data);
                });
                return;
            }

            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Bad Gateway');
        });

        // Pipe request body to dev server
        req.pipe(proxyReq, { end: true });
    });
});

server.listen(LINK_PORT, HOST, () => {
    const localHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
    const localUrl = `http://${localHost}:${LINK_PORT}`;
    const previewUrl = process.env.CODESPACE_NAME
        ? `https://${LINK_PORT}-${process.env.CODESPACE_NAME}.preview.app.github.dev`
        : localUrl;

    console.log(`\n✅ Link server running on port ${LINK_PORT}!`);
    console.log(`📍 Local:  ${localUrl}`);
    console.log(`🌐 Preview: ${previewUrl}`);
    console.log(`📁 Serving files from: ${PUBLIC_DIR}\n`);

    if (!process.env.CODESPACE_NAME) {
        openBrowser(localUrl);
    }
});

server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${LINK_PORT} is already in use. Set LINK_PORT to a free port and retry.`);
        process.exit(1);
    }

    throw err;
});

function openBrowser(url) {
    const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(command, [url]).catch(() => {
        // Ignore browser launch failures.
    });
}
