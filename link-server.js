import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LINK_PORT = Number(process.env.LINK_PORT) || 3000;
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
        if (err) {
            if (fs.existsSync(filePath + '.html')) {
                filePath += '.html';
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
        } else if (stats.isDirectory()) {
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
