// Function to update URL with form data (including event times)
function updateURLWithFormData() {
    const params = new URLSearchParams();

    // Get the main form values
    const pickupTime = document.getElementById('pickup').value;
    const solvecount = document.getElementById('solvecount').value;
    const competitor1Id = document.getElementById('c1-wca').value;
    const competitor2Id = document.getElementById('c2-wca').value;

    // Add main form values to the query parameters
    if (pickupTime) params.set('pickup', pickupTime);
    if (solvecount) params.set('solvecount', solvecount);
    if (competitor1Id) params.set('c1', competitor1Id);
    if (competitor2Id) params.set('c2', competitor2Id);

    // Add event times for Competitor 1
    const competitor1Events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    competitor1Events.forEach(event => {
        const time = document.getElementById(`c1-${event}`).value;
        if (time) params.set(`c1-${event}`, time);
    });

    // Add event times for Competitor 2
    const competitor2Events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    competitor2Events.forEach(event => {
        const time = document.getElementById(`c2-${event}`).value;
        if (time) params.set(`c2-${event}`, time);
    });

    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

// Function to populate form inputs from URL parameters
function populateFormFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Populate main form values
    if (params.has('pickup')) document.getElementById('pickup').value = params.get('pickup');
    if (params.has('solvecount')) document.getElementById('solvecount').value = params.get('solvecount');
    if (params.has('c1')) document.getElementById('c1-wca').value = params.get('c1');
    if (params.has('c2')) document.getElementById('c2-wca').value = params.get('c2');

    // Populate event times for Competitor 1
    const competitor1Events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    competitor1Events.forEach(event => {
        if (params.has(`c1-${event}`)) {
            document.getElementById(`c1-${event}`).value = params.get(`c1-${event}`);
        }
    });

    // Populate event times for Competitor 2
    const competitor2Events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    competitor2Events.forEach(event => {
        if (params.has(`c2-${event}`)) {
            document.getElementById(`c2-${event}`).value = params.get(`c2-${event}`);
        }
    });
}

// Call populateFormFromURL on page load to set inputs
document.addEventListener('DOMContentLoaded', populateFormFromURL);

// Get the pickup time
var pickupTime = parseFloat(document.getElementById('pickup').value) || 1.5;

// Get the solve count to process
var solvecount = parseInt(document.getElementById('solvecount').value) || 25;

// Attach event listener to the time form submit button
document.getElementById('timeForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Update URL with form data
    updateURLWithFormData();

    const competitor1Id = 'c1';
    const competitor2Id = 'c2';

    // Fetch WCA data for both competitors
    await getWCAData(competitor1Id);
    await getWCAData(competitor2Id);

    // Collect the times after they have been populated by WCA data
    const competitor1 = collectCompetitorTimes(competitor1Id);
    const competitor2 = collectCompetitorTimes(competitor2Id);

    showLoadingPopup(true);

    // Optimize Guildford challenge with the collected times
    const result = optimizeGuildford(competitor1, competitor2);

    // Display results
    displayResults(result, competitor1, competitor2);

    showLoadingPopup(false);
});

// Function to fetch average times from the API for a given WCA ID and event
async function getCurrentAverage(wcaId, event) {
    solvecount = parseInt(document.getElementById('solvecount').value) || 25;
    const apiUrl = `/api/wca/${wcaId}/${event}?num=${solvecount}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data.average;
    } catch (error) {
        console.error(`Error fetching average for event ${event}: ${error.message}`);
        return null;
    }
}

// Function to get WCA data for all events for a given competitor
async function getWCAData(competitorId) {
    const wcaId = document.getElementById(`${competitorId}-wca`).value.toUpperCase().trim();

    // Test if a WCA ID was given
    if (!/\d{4}[a-zA-Z]{4}\d{2}/.test(wcaId)) return;

    showLoadingPopup(true);

    try {
        const events = {
            '2x2': '222',
            '3x3': '333',
            '4x4': '444',
            '5x5': '555',
            'OH': '333oh',
            'Pyraminx': 'pyram',
            'Clock': 'clock',
            'Skewb': 'skewb',
            'Megaminx': 'minx',
            'Square-1': 'sq1'
        };

        const times = {};

        for (const [eventName, eventId] of Object.entries(events)) {
            const average = await getCurrentAverage(wcaId, eventId);

            if (average !== null) {
                times[eventName] = average; // Already in seconds
            } else {
                times[eventName] = null; // Mark as unable to solve if no valid average
            }
        }

        fillCompetitorTimes(competitorId, times);
    } catch (error) {
        alert(`Error fetching data: ${error.message}`);
    } finally {
        showLoadingPopup(false);
    }
}

// Function to populate competitor times in the form
function fillCompetitorTimes(competitorId, times) {
    Object.keys(times).forEach(event => {
        const input = document.getElementById(`${competitorId}-${event}`);
        if (times[event] !== null) {
            input.value = times[event].toFixed(2); // Populate with average time
        } else {
            input.value = 'DNF'; // Mark as DNF if no average available
        }
    });
}

// Existing function to collect times from the form fields
function collectCompetitorTimes(competitorId) {
    const events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    const times = {};

    events.forEach(event => {
        const value = document.getElementById(`${competitorId}-${event}`).value;
        if (value === 'DNF' || isNaN(value)) {
            times[event] = 600; // Use 600 seconds for DNF (did not finish)
        } else {
            times[event] = parseFloat(value);
        }
    });

    return times;
}

// Function to generate all possible combinations of events split between two competitors
function generateCombinations(events) {
    const combinations = [];
    const totalCombinations = 1 << events.length;

    for (let i = 0; i < totalCombinations; i++) {
        const comb1 = [];
        const comb2 = [];
        for (let j = 0; j < events.length; j++) {
            if (i & (1 << j)) {
                comb1.push(events[j]);
            } else {
                comb2.push(events[j]);
            }
        }
        combinations.push([comb1, comb2]);
    }

    return combinations;
}

// Function to calculate the maximum time taken between two competitors for a combination of events
function calculateMaxTime(combination, competitor1, competitor2, pickup) {
    const time1 = combination[0].reduce((sum, event) => sum + (competitor1[event] || 0) + pickup, 0) - pickup;
    const time2 = combination[1].reduce((sum, event) => sum + (competitor2[event] || 0) + pickup, 0) - pickup;
    return Math.max(time1, time2);
}

// Function to format time in seconds to "Xm Ys" format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(2)}s`;
}

// Function to find the best combination of events split between two competitors based on minimum total time
function optimizeGuildford(competitor1, competitor2) {
    const events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    const combinations = generateCombinations(events);
    let bestCombination = null;
    let bestTime = Infinity;

    pickupTime = parseFloat(document.getElementById('pickup').value) || 0;

    const results = combinations.map(combination => {
        const maxTime = calculateMaxTime(combination, competitor1, competitor2, pickupTime);

        if (maxTime < bestTime) {
            bestTime = maxTime;
            bestCombination = combination;
        }
        return {
            combination,
            maxTime,
            formattedMaxTime: formatTime(maxTime)
        };
    });

    results.sort((a, b) => a.maxTime - b.maxTime);

    return {
        allCombinations: results,
        bestCombination: {
            combination: bestCombination,
            formattedMaxTime: formatTime(bestTime)
        }
    };
}

// Function to display the results in the HTML, including predicted times for each competitor
function displayResults(result, competitor1, competitor2) {
    const bestCombinationDiv = document.getElementById('bestCombination');
    const allCombinationsDiv = document.getElementById('allCombinations');

    // Calculate individual competitor times for the best combination
    const competitor1Events = result.bestCombination.combination[0];
    const competitor2Events = result.bestCombination.combination[1];

    const competitor1Time = competitor1Events.reduce((sum, event) => sum + (competitor1[event] || 0) + pickupTime, 0) - pickupTime;
    const competitor2Time = competitor2Events.reduce((sum, event) => sum + (competitor2[event] || 0) + pickupTime, 0) - pickupTime;

    bestCombinationDiv.innerHTML =
        `
            <h3>Best Combination</h3>
            <p>Competitor 1 (${formatTime(competitor1Time)}): ${competitor1Events.join(', ')}</p>
            <p>Competitor 2 (${formatTime(competitor2Time)}): ${competitor2Events.join(', ')}</p>
            <p>Total Time: ${result.bestCombination.formattedMaxTime}</p>
        `;

    allCombinationsDiv.innerHTML = '<h3>All Combinations (Ordered by Speed)</h3>';
    result.allCombinations.forEach(combination => {
        if (combination.maxTime < 600) {
            const comb1Time = combination.combination[0].reduce((sum, event) => sum + (competitor1[event] || 0) + pickupTime, 0) - pickupTime;
            const comb2Time = combination.combination[1].reduce((sum, event) => sum + (competitor2[event] || 0) + pickupTime, 0) - pickupTime;

            allCombinationsDiv.innerHTML +=
                `<div>
                        <p>Competitor 1 (${formatTime(comb1Time)}): ${combination.combination[0].join(', ')}</p>
                        <p>Competitor 2 (${formatTime(comb2Time)}): ${combination.combination[1].join(', ')}</p>
                        <p>Total Time: ${combination.formattedMaxTime}</p>
                 </div>`;
        }
    });
}

// Function to show or hide the loading popup
function showLoadingPopup(show) {
    const popup = document.getElementById('loadingPopup');
    popup.style.display = show ? 'flex' : 'none';
}
