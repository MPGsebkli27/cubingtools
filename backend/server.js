const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 80;

const logFilePath = path.join(__dirname, 'log.txt');

let requests = 0;

// Function to initialize or read the visitor count
function initializerequests() {
    if (fs.existsSync(logFilePath)) {
        // Read the first line to get the current visitor count
        const data = fs.readFileSync(logFilePath, 'utf8');
        const lines = data.split('\n');
        const firstLine = lines[0].trim();

        // Parse the first line as a number
        requests = parseInt(firstLine, 10) || 0;
    } else {
        // If the log file doesn't exist, start with visitor count 0
        requests = 0;
    }
}

// Function to update the log file with the new visitor count
function updateLogFile(logEntry) {
    // Increment the visitor count
    requests++;

    // Read the current contents of the log file (if any)
    const data = fs.existsSync(logFilePath) ? fs.readFileSync(logFilePath, 'utf8') : '';
    const lines = data.split('\n').slice(1); // Skip the first line (current visitor count)

    // Prepare the new content
    const newContent = `${requests}\n${logEntry}${lines.join('\n')}`;

    // Write the updated content back to the file
    fs.writeFileSync(logFilePath, newContent, 'utf8');
}

// Initialize the visitor count on startup
initializerequests();

app.use((req, res, next) => {
    const logMessage = `Request to ${req.path}`;

    // Get current date and time
    const now = new Date();
    const timestamp = now.toISOString();

    // Create log entry
    const logEntry = `${timestamp} - ${logMessage}\n`;

    // Update the log file with the new visitor count and log entry
    updateLogFile(logEntry);

    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Function to extract metadata from an HTML file
function extractMetadata(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const titleMatch = fileContent.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'No title';

    const descriptionMatch = fileContent.match(/<meta name="description" content="(.*?)">/);
    const description = descriptionMatch ? descriptionMatch[1] : 'No description';

    return { title, description };
}

// API endpoint to get the list of HTML files with metadata
app.get('/api/tools', (req, res) => {
    const toolsDir = path.join(__dirname, '../public/html/tools');

    fs.readdir(toolsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }

        const htmlFiles = files.filter(file => file.endsWith('.html')).map(file => {
            const filePath = path.join(toolsDir, file);
            const metadata = extractMetadata(filePath);
            return {
                filename: file,
                title: metadata.title,
                description: metadata.description
            };
        });

        res.json(htmlFiles);
    });
});

// API endpoint to get WCA data
app.get('/api/wca/:wcaId/:event', async (req, res) => {
    const { wcaId, event } = req.params;
    const apiUrl = `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${wcaId}.json`;

    try {
        // Fetch the person's data
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Extract results for the specified event
        let allResults = [];
        for (const competition of Object.values(data.results)) {
            if (competition[event]) {
                allResults = allResults.concat(competition[event]);
            }
        }

        // Extract times and filter out DNFs
        let solves = allResults
            .flatMap(result => result.solves) // Flatten the solves array
            .slice(0, 12) // Get the first 12 solves for the average
            .filter(result => result > 0); // Remove any DNFs, DNS', or missed cutoffs

        // Handle insufficient results
        if (solves.length === 0) {
            return res.json({ average: null });
        }

        solves
            .sort((a, b) => a - b) // Sort in ascending order
            .slice(1, -1); // Remove best and worst results
        const sum = solves.reduce((a, b) => a + b, 0);
        const avg = (sum / solves.length) / 100;

        res.json({ average: avg });

    } catch (error) {
        console.error(`Error fetching average for event ${event}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '..', 'public/html', 'index.html'));
})

// Serve the main page
app.get('/tools', (req, res) => {
    return res.sendFile(path.join(__dirname, '..', 'public/html', 'index.html'));
})

// Serve the about page
app.get('/about', (req, res) => {
    return res.sendFile(path.join(__dirname, '..', 'public/html', 'about.html'));
});

app.get('/tools/:toolName', (req, res) => {
    const toolName = req.params.toolName;  // Extract the tool name from the URL
    const filePath = path.join(__dirname, '../public/html/tools', `${toolName}.html`);

    // Send the HTML file if it exists
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Tool not found');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running`);
});
