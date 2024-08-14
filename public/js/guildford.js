document.getElementById('timeForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const competitor1 = {
        '2x2': parseFloat(document.getElementById('c1-2x2').value),
        '3x3': parseFloat(document.getElementById('c1-3x3').value),
        '4x4': parseFloat(document.getElementById('c1-4x4').value),
        '5x5': parseFloat(document.getElementById('c1-5x5').value),
        'OH': parseFloat(document.getElementById('c1-OH').value),
        'Pyraminx': parseFloat(document.getElementById('c1-Pyraminx').value),
        'Clock': parseFloat(document.getElementById('c1-Clock').value),
        'Skewb': parseFloat(document.getElementById('c1-Skewb').value),
        'Megaminx': parseFloat(document.getElementById('c1-Megaminx').value),
        'Square-1': parseFloat(document.getElementById('c1-Square-1').value)
    };
    const competitor2 = {
        '2x2': parseFloat(document.getElementById('c2-2x2').value),
        '3x3': parseFloat(document.getElementById('c2-3x3').value),
        '4x4': parseFloat(document.getElementById('c2-4x4').value),
        '5x5': parseFloat(document.getElementById('c2-5x5').value),
        'OH': parseFloat(document.getElementById('c2-OH').value),
        'Pyraminx': parseFloat(document.getElementById('c2-Pyraminx').value),
        'Clock': parseFloat(document.getElementById('c2-Clock').value),
        'Skewb': parseFloat(document.getElementById('c2-Skewb').value),
        'Megaminx': parseFloat(document.getElementById('c2-Megaminx').value),
        'Square-1': parseFloat(document.getElementById('c2-Square-1').value)
    };
    const result = optimizeGuildford(competitor1, competitor2);
    displayResults(result);
});

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

function calculateMaxTime(combination, competitor1, competitor2) {
    const time1 = combination[0].reduce((sum, event) => sum + competitor1[event], 0);
    const time2 = combination[1].reduce((sum, event) => sum + competitor2[event], 0);
    return Math.max(time1, time2);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

function optimizeGuildford(competitor1, competitor2) {
    const events = ['2x2', '3x3', '4x4', '5x5', 'OH', 'Pyraminx', 'Clock', 'Skewb', 'Megaminx', 'Square-1'];
    const combinations = generateCombinations(events);
    let bestCombination = null;
    let bestTime = Infinity;

    const results = combinations.map(combination => {
        const maxTime = calculateMaxTime(combination, competitor1, competitor2);
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
            maxTime: bestTime,
            formattedMaxTime: formatTime(bestTime)
        }
    };
}

function displayResults(result) {
    const bestCombinationDiv = document.getElementById('bestCombination');
    const allCombinationsDiv = document.getElementById('allCombinations');

    bestCombinationDiv.innerHTML = `
        <h3>Best Combination</h3>
        <p>Competitor 1: ${result.bestCombination.combination[0].join(', ')}</p>
        <p>Competitor 2: ${result.bestCombination.combination[1].join(', ')}</p>
        <p>Time: ${result.bestCombination.formattedMaxTime}</p>
    `;

    allCombinationsDiv.innerHTML = '<h3>All Combinations (Ordered by Speed)</h3>';
    result.allCombinations.forEach(combination => {
        allCombinationsDiv.innerHTML += `
        <div data-aos="fade-up">
            <p>Competitor 1: ${combination.combination[0].join(', ')} \n, 
            Competitor 2: ${combination.combination[1].join(', ')} \n, 
            Time: ${combination.formattedMaxTime}</p>
        </div>
        `;
    });
}
