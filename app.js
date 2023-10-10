//Import Modules
const http = require('http');
const events = require('events');
const fs = require('fs');
const path = require('path');
const console = require('console');

//Set up eventEmitter
const eventEmitter = new events.EventEmitter();

//Set up server
const server = http.createServer((req, res) => {
    const url = req.url;
    const baseDirectory = path.join(__dirname, 'views');
    const filePath = path.join(baseDirectory, url === '/' ? 'index.html' : `${url}.html`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('URL Not Found');
            console.log('URL Not Found');
        } else {
            console.log('URL Found (Success)');
            // File exists
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.log('Error with server');
                    // An error occurred
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                } else {
                    console.log('File Read (Success)');
                    // Successful
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data)
                    res.end();
                }
            });
        }
    });
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

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


function serveHTMLFile(filename, res) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
}
eventEmitter.on('request', (req) => {
    console.log(`Received request for: ${req.url}`);
});



function logRequest(req, res) {
    console.log(`Received request for: ${req.url}`);
}

function logResponse(req, res) {
    console.log(`Sent response for: ${req.url}`);
}