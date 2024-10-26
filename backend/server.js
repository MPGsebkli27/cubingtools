const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const httpPort = 80; // Default http port
const httpsPort = 443; // Default https port

const http = require('http');
const https = require('https');

const privateKey = fs.readFileSync('./backend/credentials/cubingtools_private_key.key');
const certificate = fs.readFileSync('./backend/credentials/cubingtools_ssl_certificate.cer');

const credentials = { key: privateKey, cert: certificate };

const logFilePath = path.join(__dirname, 'log.txt');

let requests = 0;

// Function to initialize or read the visitor count
function initializerequests() {
    if (fs.existsSync(logFilePath)) {
        const data = fs.readFileSync(logFilePath, 'utf8');
        const lines = data.split('\n');
        const firstLine = lines[0].trim();
        requests = parseInt(firstLine, 10) || 0;
    } else {
        requests = 0;
    }
}

// Function to update the log file with the new visitor count
function updateLogFile(logEntry) {
    requests++;
    const data = fs.existsSync(logFilePath) ? fs.readFileSync(logFilePath, 'utf8') : '';
    const lines = data.split('\n').slice(1);
    const newContent = `${requests}\n${logEntry}${lines.join('\n')}`;
    fs.writeFileSync(logFilePath, newContent, 'utf8');
}

initializerequests();

app.use((req, res, next) => {
    if (req.secure) {
        const logMessage = `Request to ${req.path}`;
        const now = new Date();
        const timestamp = now.toISOString();
        const logEntry = `${timestamp} - ${logMessage}\n`;

        updateLogFile(logEntry);
        next();
    } else {
        // Redirect to the HTTPS version of the URL
        res.redirect(`https://${req.headers.host}${req.url}`);
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Import and use the API routes
const toolsRoutes = require('./API/tools');
const wcaRoutes = require('./API/wca');
const pagesRoutes = require('./API/pages');

app.use(toolsRoutes);
app.use(wcaRoutes);
app.use(pagesRoutes);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(httpsPort, () => {
    console.log('Listening for https://')
});

http.createServer((req, res) => {
    res.writeHead(301, { 'Location': `https://${req.headers.host}${req.url}` });
    res.end();
}).listen(httpPort, () => {
    console.log('HTTP server running on port 80 and redirecting to HTTPS');
});


// const nodeMailer = require('nodemailer');

// const html = `
//     <h1>Hello Human</h1>
// `;

// async function main() {
//     const transporter = nodeMailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: 587,
//         secure: false,
//         auth: {
//             user: 'info@cubingtools.de',
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });

//     const info = await transporter.sendMail({
//         from: 'Info <info@cubingtools.de>',
//         to: 'sebastiankling@me.com',
//         subject: 'Test',
//         html: html
//     })

//     console.log(info.messageId);
// }

// main().catch(e => console.log(e));