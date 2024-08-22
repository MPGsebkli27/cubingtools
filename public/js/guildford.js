document.getElementById('timeForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const competitor1 = collectCompetitorTimes('c1');
    const competitor2 = collectCompetitorTimes('c2');
    showLoadingPopup(true);
    const result = optimizeGuildford(competitor1, competitor2);
    displayResults(result);

});


async function getCurrentAverage(wcaId, event) {
    const apiUrl = `/api/wca/${wcaId}/${event}`;

    try {
        // Fetch the average from the backend
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();

        // Return the average
        return data.average;

    } catch (error) {
        console.error(`Error fetching average for event ${event}: ${error.message}`);
        return null;
    }
}

async function fetchWCAData(competitorId) {
    const wcaId = document.getElementById(`${competitorId}-wca`).value.toUpperCase().trim();

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

// Input WCA Information in input fields

function fillCompetitorTimes(competitorId, times) {
    Object.keys(times).forEach(event => {
        const input = document.getElementById(`${competitorId}-${event}`);
        if (times[event] !== null) {
            input.value = times[event].toFixed(2);
        } else {
            input.value = 'DNF'; // Leave empty if no results
        }
    });
}

// Collect all Competitor times

function collectCompetitorTimes(competitorId) {
    const events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    const times = {};

    events.forEach(event => {
        const value = document.getElementById(`${competitorId}-${event}`).value;
        if (value === null || isNaN(value)) {
            times[event] = 600; // Unable to solve
        } else {
            times[event] = parseFloat(value);
        }
    });

    return times;
}

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

function calculateMaxTime(combination, competitor1, competitor2, pickupTime) {
    const time1 = combination[0].reduce((sum, event) => sum + (competitor1[event] || 0) + pickupTime, 0) - pickupTime;
    const time2 = combination[1].reduce((sum, event) => sum + (competitor2[event] || 0) + pickupTime, 0) - pickupTime;
    return Math.max(time1, time2);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs.toFixed(2)}s`;
}

function optimizeGuildford(competitor1, competitor2) {
    const events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    const combinations = generateCombinations(events);
    let bestCombination = null;
    let bestTime = Infinity;

    const pickupTime = parseFloat(document.getElementById('pickup').value) || 0;

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

function displayResults(result) {
    const bestCombinationDiv = document.getElementById('bestCombination');
    const allCombinationsDiv = document.getElementById('allCombinations');

    bestCombinationDiv.innerHTML =
        `<h3>Best Combination</h3>
        <p>Competitor 1: ${result.bestCombination.combination[0].join(', ')}</p>
        <p>Competitor 2: ${result.bestCombination.combination[1].join(', ')}</p>
        <p>Time: ${result.bestCombination.formattedMaxTime}</p>`;

    allCombinationsDiv.innerHTML = '<h3>All Combinations (Ordered by Speed)</h3>';
    result.allCombinations.forEach(combination => {

        // If the time is greater than 10 minutes, do not add it to the list. (Cannot solve)
        if (combination.maxTime < 600) {
            allCombinationsDiv.innerHTML +=
                `<div>
                    <p>Competitor 1: ${combination.combination[0].join(', ')}</p>
                    <p>Competitor 2: ${combination.combination[1].join(', ')}</p>
                    <p>Time: ${combination.formattedMaxTime}</p>
                </div>`;
        }
    });
    showLoadingPopup(false);
}

function showLoadingPopup(show) {
    const popup = document.getElementById('loadingPopup');
    popup.style.display = show ? 'flex' : 'none';
}
