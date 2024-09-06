const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 443; // Default https port

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
    const logMessage = `Request to ${req.path}`;
    const now = new Date();
    const timestamp = now.toISOString();
    const logEntry = `${timestamp} - ${logMessage}\n`;

    updateLogFile(logEntry);
    next();
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

httpsServer.listen(port, () => {
    console.log('Server is running')
});