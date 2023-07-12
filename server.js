require('dotenv').config();
const log = console.log;
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const http = require('http');
const server = http.createServer;
const HOST = process.env.HOST;
const PORT = process.env.PORT;
const EventEmitter = require('events');
const Emitter = new EventEmitter();
Emitter.on('log', (message, file_name) => logger(message, file_name));
server((req, res) => {
    Emitter.emit('log', `${req.url}\t${req.method}`, 'requests');

    let file_ext = path.extname(req.url), content_type, file_path;
    const contentTypeMap = {
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.txt': 'text/plain',
    };

    content_type = contentTypeMap[file_ext] || 'text/html';

    // CHECK REQUESTED PATH
    if (content_type === 'text/html') {
        file_path = req.url === '/' ? path.join(__dirname, 'views', 'index.html') : path.join(__dirname, 'views', req.url, 'index.html');
    } else {
        file_path = path.join(__dirname, req.url);
    }

    if (!file_ext && req.url.slice(-1) !== '/') file_path += '.html';

    if (fs.existsSync(file_path)) {
        // CHECK FOR IMAGES FIRST
        if (content_type.includes('image')) {
            fs.readFile(file_path, '', (err, data) => {
                if (err) console.error(`${err.name}\t${err.message}`);
                res.writeHead(200, { 'Content-Type': content_type });
                res.end(data);
                return;
            });
        } else {
            // RENDER HTML DOCUMENT
            fs.readFile(file_path, 'utf-8', (err, data) => {
                if (err) console.error(`${err.name}\t${err.message}`);
                res.writeHead(200, { 'Content-Type': content_type });
                res.end(data);
                return;
            });
        }
    } else {
        // RENDER 404.HTML PAGE IF PATH DOES NOT EXIST
        fs.readFile(path.join(__dirname, 'views', '404.html'), 'utf-8', (err, data) => {
            if (err) console.error(`${err.name}\t${err.message}`);
            res.writeHead(404, { 'Content-Type': content_type });
            res.end(data);
            return;
        });
    }
}).listen(PORT, () => { log(`Server is running on host : ${HOST}:${PORT}`) });
