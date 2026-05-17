import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow an explicit public port via LINK_PORT, then PUBLIC_PORT, then PORT.
// In Codespaces preview, prefer port 8443 by default if no explicit port is provided.
const ENV_PORT = Number(process.env.PORT) || 0;
const PUBLIC_PORT = Number(process.env.PUBLIC_PORT) || 0;
const LINK_PORT = Number(process.env.LINK_PORT) || 0;
const CODESPACE_NAME = process.env.CODESPACE_NAME || '';
const DEFAULT_PORT = CODESPACE_NAME ? 8443 : 3000;
const INITIAL_PORT = LINK_PORT || PUBLIC_PORT || ENV_PORT || DEFAULT_PORT;
const HOST = process.env.HOST || '0.0.0.0';

const defaultPublicDirs = ['dist', 'public'];
const PUBLIC_DIR =
    defaultPublicDirs.map(dir => path.join(__dirname, dir)).find(dirPath => fs.existsSync(dirPath)) ||
    path.join(__dirname, 'dist');

if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`❌ No public directory found. Checked: ${defaultPublicDirs.join(', ')}`);
    process.exit(1);
}

const FALLBACK_PORTS = [INITIAL_PORT, 8443, 3000, 3001, 3002, 8080, 8081, 8888, 9000].filter(
    (port, index, self) => port > 0 && self.indexOf(port) === index
);

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
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Check if path is a directory and look for index.html
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // Try with .html extension if file not found
            if (fs.existsSync(filePath + '.html')) {
                filePath = filePath + '.html';
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
        } else if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }

        // Read and serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
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

function startServer(portIndex = 0) {
    if (portIndex >= FALLBACK_PORTS.length) {
        console.error('❌ Could not find an available port to bind to!');
        process.exit(1);
    }

    const PORT = FALLBACK_PORTS[portIndex];

    server
        .listen(PORT, HOST, () => {
            const url = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
            const publicUrl = process.env.CODESPACE_NAME
                ? `https://${PORT}-${process.env.CODESPACE_NAME}.preview.app.github.dev`
                : url;
            const legacyUrl = process.env.CODESPACE_NAME
                ? `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`
                : url;

            console.log(`\n✅ Static server running on port ${PORT}!`);
            console.log(`📍 Local:  ${url}`);
            console.log(`🌐 Preview: ${publicUrl}`);
            console.log(`🌐 Legacy:  ${legacyUrl}\n`);
            console.log(`📁 Serving files from: ${PUBLIC_DIR}`);

            // Auto-open browser (only if not in Codespaces)
            if (!process.env.CODESPACE_NAME) {
                openBrowser(url);
            }
        })
        .on('error', err => {
            if (err.code === 'EADDRINUSE') {
                console.log(`⚠️  Port ${PORT} is busy, trying next port...`);
                startServer(portIndex + 1);
            } else {
                throw err;
            }
        });
}

function openBrowser(url) {
    const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(command, [url]).catch(() => {
        // Silently fail if browser opening doesn't work
    });
}

startServer();
