const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 800;

let visitorCount = 0;

app.use((req, res, next) => {

    if (req.path === '/') {
        visitorCount++;
        console.log(`CubingTools has been opened ${visitorCount} times`);
    }

    next();
})

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

// Serve the main page
app.get('/', (req, res) => {
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
    console.log(`Server is running on http://localhost:${port}`);
});
