//Import Modules
const http = require('http');
const events = require('events');
const fs = require('fs');
const path = require('path');
const console = require('console');
const socketIo = require('socket.io');

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
    } else if (url === '/styles.css') {
        // Serve styles.css
        const filePath = path.join(__dirname, 'views', 'styles.css');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
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


const chatRooms = {
    room1: ['This is an example chat room feature', 'Messages are stored into a room array, and displayed here', 'Each chat room has its own array, and switching between chat rooms will update the chat box to reflect the new room'],
    room2: [],
    room3: [],
};

// Socket Setup
const io = socketIo(server);

io.on('connection', (socket) => {
    logActivity('A user connected to ' + socket.id);

    // Join a chat room
    socket.on('join room', (room) => {
        socket.join(room); // Join the specified room
        // Send the chat history for the joined room to the user
        socket.emit('chat history', chatRooms[room]);
        console.log('Chat History for room', room, chatRooms[room]);
    });

    // Handle chat messages
    socket.on('chat message', (data) => {
        const { room, message } = data;
        chatRooms[room].push(message);
        io.to(room).emit('chat message', { room, message });
        console.log('Message:', message); // Log each message
    });

    // Create a new chat room
    socket.on('create room', (room) => {
        // Check if the room already exists
        if (!chatRooms[room]) {
            io.emit('room created', room); // Notify all clients about the new room
        }
    });

    socket.on('disconnect', () => {
        logActivity('User disconnected from ' + socket.id);
    });
});

server.listen(3000, () => {
    logActivity('Server is running on http://localhost:3000');
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