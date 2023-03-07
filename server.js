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
    // CHECK FILE EXTENSION
    if (file_ext === '.css') {
        content_type = 'text/css';
    } else if (file_ext === '.js') {
        content_type = 'text/javascript';
    } else if (file_ext === '.json') {
        content_type = 'application/json';
    } else if (file_ext === '.png') {
        content_type = 'image/png';
    } else if (file_ext === '.jpg') {
        content_type = 'image/jpg';
    } else if (file_ext === '.jpeg') {
        content_type = 'image/jpeg';
    } else if (file_ext === '.txt') {
        content_type = 'text/plain';
    } else {
        content_type = 'text/html';
    }
    // CHECK REQUESTED PATH
    if (content_type === 'text/html' && req.url === '/') {
        file_path = path.join(__dirname, 'views', 'index.html');
    } else if (content_type === 'text/html' && req.url.slice(-1) === '/') {
        file_path = path.join(__dirname, 'views', req.url, 'index.html');
    } else if (content_type === 'text/html') {
        file_path = path.join(__dirname, 'views', req.url, 'index.html');
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
