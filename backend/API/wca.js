const express = require('express');
const axios = require('axios');
const router = express.Router();

// API endpoint to get WCA data
router.get('/api/wca/:wcaId/:event', async (req, res) => {
    const { wcaId, event } = req.params;
    const apiUrl = `https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${wcaId}.json`;

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        let allResults = [];
        for (const competition of Object.values(data.results)) {
            if (competition[event]) {
                allResults = allResults.concat(competition[event]);
            }
        }

        if (event == 'name') {
            return res.json({ name: data.name });
        }

        let solves = allResults
            .flatMap(result => result.solves)
            .filter(result => result > 0)
            .slice(0, 12);

        if (solves.length === 0) {
            return res.status(200).json({ average: null });
        }

        solves.sort((a, b) => a - b).slice(1, -1);
        const sum = solves.reduce((a, b) => a + b, 0);
        const avg = (sum / solves.length) / 100;

        res.status(200).json({ average: avg });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
