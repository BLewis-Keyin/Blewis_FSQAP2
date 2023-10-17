//Import Modules
const http = require('http');
const events = require('events');
const fs = require('fs');
const path = require('path');
const console = require('console');


//eventEmitter
const eventEmitter = new events.EventEmitter();
eventEmitter.on('request', (req) => {
    logActivity(`Received request for: ${req.url}`);
})


//Activity Log
const logDirectory = './logs';

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
    logActivity(`Created log directory: ${logDirectory}`);
}

function logActivity(message) {
    const currentDate = new Date().toISOString().slice(0, 10);
    const logFile = `${logDirectory}/${currentDate}.log`;
    const timestamp = new Date().toUTCString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage); // Log to the console

    const fileStream = fs.createWriteStream(logFile, { flags: 'a' });
    fileStream.write(logMessage + '\n');
    fileStream.end();
}


//Server Setup
const server = http.createServer((req, res) => {
    const url = req.url;
    logActivity(`Received request for: ${url}`);

    if (url === '/navigation.js') {
        // Serve navigation.js
        const filePath = path.join(__dirname, 'views', 'navigation.js');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            }
        });
    } else {
        // Handle other routes
        const baseDirectory = path.join(__dirname, 'views');
        const filePath = path.join(baseDirectory, url === '/' ? 'index.html' : `${url}.html`);

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File does not exist
                if (url == "/styles.css") {
                    // Do nothing, not needed if the browser requests styles.css
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('URL Not Found');
                } else {
                    logActivity(`URL Not Found for: ${url}`);
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('URL Not Found');
                }
            } else {
                // File exists
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        // An error occurred while reading the file
                        logActivity(`Error reading file for: ${url}`);
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Internal Server Error');
                    } else {
                        // Successful, serve the HTML content
                        logActivity(`Served HTML file for: ${url}`);
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data);
                    }
                });
            }
        });
    }
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// switch (url) {
//     case '/':
//         console.log('Switch 1 : Root');
//         res.writeHead(200, { 'Content-Type': 'text/plain' });
//         res.end('Home page');
//         break;
//     case '/about':
//         console.log('Switch 2 : about');
//         res.writeHead(200, { 'Content-Type': 'text/plain' });
//         res.end('About page.');
//         break;
//     case '/contact':
//         console.log('Switch 3 : contact');
//         res.writeHead(200, { 'Content-Type': 'text/plain' });
//         res.end('Contact us');
//         break;
//     default:
//         console.log('Switch 4 : Not Found')
//         res.writeHead(404, { 'Content-Type': 'text/plain' });
//         res.end('Not Found');
// };