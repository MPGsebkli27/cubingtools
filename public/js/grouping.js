const events = [
    { id: '333', name: '3x3x3 Cube', shortName: '3x3' },
    { id: '222', name: '2x2x2 Cube', shortName: '2x2' },
    { id: '444', name: '4x4x4 Cube', shortName: '4x4' },
    { id: '555', name: '5x5x5 Cube', shortName: '5x5' },
    { id: '666', name: '6x6x6 Cube', shortName: '6x6' },
    { id: '777', name: '7x7x7 Cube', shortName: '7x7' },
    { id: '888', name: '8x8x8 Cube', shortName: '8x8' },
    { id: '999', name: '9x9x9 Cube', shortName: '9x9' },

    { id: '333oh', name: '3x3x3 One-Handed', shortName: '3x3 OH' },
    { id: '222oh', name: '2x2x2 One-Handed', shortName: '2x2 OH' },

    { id: 'fto', name: 'Face-Turning Octahedron', shortName: 'FTO' },

    { id: '333tb', name: '3x3x3 Team-Blind', shortName: 'Team BLD' },
    { id: '333bf', name: '3x3x3 Blindfolded', shortName: '3x3 BLD' },
    { id: '222bf', name: '2x2x2 Blindfolded', shortName: '2x2 BLD' },
    { id: '444bf', name: '4x4x4 Blindfolded', shortName: '4x4 BLD' },
    { id: '555bf', name: '5x5x5 Blindfolded', shortName: '5x5 BLD' },

    { id: '333ft', name: '3x3x3 With Feet', shortName: '3x3 Feet' },
    { id: '444ft', name: '4x4x4 With Feet', shortName: '4x4 Feet' },

    { id: 'clock', name: 'Clock', shortName: 'Clock' },
    { id: '555clk', name: 'Pentagonal Clock', shortName: '5x5 Clock' },

    { id: 'pyra', name: 'Pyraminx', shortName: 'Pyra' },
    { id: 'maspyr', name: 'Master Pyraminx', shortName: 'Master Pyra' },

    { id: 'skewb', name: 'Skewb', shortName: 'Skewb' },
    { id: 'redi', name: 'Redi Cube', shortName: 'Redi' },

    { id: 'sq1', name: 'Square-1', shortName: 'Squan' },

    { id: '333fm', name: '3x3x3 Fewest Moves', shortName: 'FMC' },
    { id: '333lfm', name: '3x3x3 Linear Fewest Moves', shortName: '3x3 LFM' },
    { id: '333mts', name: '3x3x3 Match The Scramble', shortName: '3x3 MTS' },
    { id: '333tf', name: '3x3x3 Team-Factory', shortName: '3x3 Team Factory' },
    { id: '333ni', name: '3x3x3 No Inspection', shortName: '3x3 No Inspection' },
    { id: '333sc', name: '3x3x3 Scrambling', shortName: '3x3 Scrambling' },
    { id: '333on', name: '3x3x3 One Side', shortName: '3x3 One Side' },
    { id: '333doh', name: '3x3x3 Double One-Handed', shortName: '3x3 Double OH' },
    { id: '3333', name: 'Three 3x3x3 Cubes Relay', shortName: 'Three 3x3 Relay' },

    { id: 'mega', name: 'Megaminx', shortName: 'Mega' },
    { id: 'kilo', name: 'Kilominx', shortName: 'Kilo' },
    { id: 'giga', name: 'Gigaminx', shortName: 'Giga' },

    { id: 'mrb', name: '3x3x3 Mirror Blocks', shortName: 'Mirror Blocks' },
    { id: 'mrbbf', name: '3x3x3 Mirror Blocks Blindfolded', shortName: 'Mirror Blind' },

    { id: 'mag', name: 'Magic', shortName: 'Magic' },
    { id: 'masmag', name: 'Master Magic', shortName: 'Master Magic' },

    { id: 'guildford', name: '2-Man Mini Guildford', shortName: 'Mini Guildford' },
    { id: '24r', name: '2x2x2-4x4x4 Relay', shortName: '2 To 4 Relay' },
    { id: '25r', name: '2x2x2-5x5x5 Relay', shortName: '2 To 5 Relay' },
    { id: '27r', name: '2x2x2-7x7x7 Relay', shortName: '2 To 7 Relay' },

    { id: '223', name: '2x2x3 Cube', shortName: '2x2x3' },
    { id: 'gear', name: 'Gear Cube', shortName: 'Gear Cube' },
];

let selectedEvents = [];
let competitors = [];
let competitionData = {};

let includeRunners = false;
let includeJudges = false;

function selectAllEventCheckboxes() {
    var ele = document.getElementsByName('event-checkbox');
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].type == 'checkbox') {
            ele[i].checked = true;
        }
    }
}

function deselectAllEventCheckboxes() {
    var ele = document.getElementsByName('event-checkbox');
    for (var i = 0; i < ele.length; i++) {
        if (ele[i].type == 'checkbox') {
            ele[i].checked = false;
        }
    }
}

function selectAllUnderLabel(labelId) {
    // Get all checkboxes in the container
    const checkboxes = document.querySelectorAll(`#${labelId} ~ input[type='checkbox']`);

    // Check all checkboxes
    checkboxes.forEach(checkbox => checkbox.checked = true);
}


function setupCompetition() {
    const competitionName = document.getElementById('competition-name').value;
    const maxCompetitors = document.getElementById('max-competitors').value;

    // Get checkbox states
    includeRunners = document.getElementById('do-runners').checked;
    includeJudges = document.getElementById('do-judges').checked;

    if (competitionName && maxCompetitors) {
        competitionData.name = competitionName;
        competitionData.maxCompetitors = parseInt(maxCompetitors);
        competitionData.includeRunners = includeRunners;
        competitionData.includeJudges = includeJudges;

        document.getElementById('competition-setup').style.display = 'none';
        document.getElementById('event-selection').style.display = 'block';

        const eventCheckboxes = document.getElementById('event-checkboxes');
        eventCheckboxes.innerHTML = ''; // Clear previous checkboxes if any

        // Add titles before each section of events
        let currentTitle = '';
        events.forEach(event => {
            let newTitle = '';

            // Determine the title based on the event's id
            if (event.id === '333') newTitle = 'NxNxN Cube';
            else if (event.id === '333oh') newTitle = 'One-Handed';
            else if (event.id === 'fto') newTitle = 'FTO';
            else if (event.id === '333tb') newTitle = 'Blindfolded';
            else if (event.id === '333ft') newTitle = 'Feet';
            else if (event.id === 'clock') newTitle = 'Clock';
            else if (event.id === 'pyra') newTitle = 'Pyraminx';
            else if (event.id === 'skewb') newTitle = 'Skewb';
            else if (event.id === 'sq1') newTitle = 'Square-1';
            else if (event.id === '333fm') newTitle = '3x3 Variations';
            else if (event.id === 'mega') newTitle = 'Minx';
            else if (event.id === 'mrb') newTitle = 'Mirror Blocks';
            else if (event.id === 'mag') newTitle = 'Magic';
            else if (event.id === 'guildford') newTitle = 'Relays';
            else if (event.id === '223') newTitle = 'Other Cubes';

            // If the title changes, add a heading before the next section
            if (newTitle && newTitle !== currentTitle) {
                const titleDiv = document.createElement('div');
                titleDiv.className = 'event-section-title';
                titleDiv.textContent = newTitle;
                eventCheckboxes.appendChild(titleDiv);
                currentTitle = newTitle;
            }

            // Create the checkbox and label for the event
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = event.id;
            checkbox.value = event.id;
            checkbox.name = 'event-checkbox';

            const label = document.createElement('label');
            label.htmlFor = event.id;
            label.textContent = event.name;

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
            div.classList.add('inline');

            eventCheckboxes.appendChild(div);
        });
    }
}


function addCustomEvent() {
    const newEventName = prompt('What is the events\' name?', '');
    if (newEventName == null || newEventName == '') return;

    const newEventId = newEventName.substring(0, 3);
    events.push({ id: newEventId, name: newEventName, shortName: newEventName });

    const eventCheckboxes = document.getElementById('event-checkboxes');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = newEventId;
    checkbox.value = newEventId;
    checkbox.name = 'event-checkbox'

    const label = document.createElement('label');
    label.htmlFor = newEventId;
    label.textContent = newEventName;

    const div = document.createElement('div');
    div.appendChild(checkbox);
    div.appendChild(label);
    div.classList += 'inline'

    eventCheckboxes.appendChild(div);
}

function goToSetupCompetition() {
    document.getElementById('event-selection').style.display = 'none';
    document.getElementById('competition-setup').style.display = 'block';
}

function goToEventSelection() {
    document.getElementById('competitor-setup').style.display = 'none';
    document.getElementById('event-selection').style.display = 'block';
}

function selectEvents() {
    const checkboxes = document.querySelectorAll('#event-checkboxes input:checked');
    selectedEvents = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (selectedEvents.length > 0) {
        competitionData.events = selectedEvents;

        document.getElementById('event-selection').style.display = 'none';
        document.getElementById('competitor-setup').style.display = 'block';
        updateCompetitorForm();
    }
}

function updateCompetitorForm() {
    const competitorForm = document.getElementById('competitor-form');
    competitorForm.innerHTML = '';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'competitor-name';
    nameInput.placeholder = 'Competitor Name';

    competitorForm.appendChild(nameInput);

    selectedEvents.forEach(eventId => {
        const event = events.find(e => e.id === eventId);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `event-${event.id}`;
        checkbox.value = event.id;
        checkbox.name = 'event-checkbox'

        const label = document.createElement('label');
        label.htmlFor = `event-${event.id}`;
        label.textContent = event.shortName;

        const div = document.createElement('div');
        div.appendChild(checkbox);
        div.appendChild(label);
        div.className += 'inline';

        competitorForm.appendChild(div);
    });
}

function addCompetitor() {
    const name = document.getElementById('competitor-name').value;
    if (!name) return;

    const eventCheckboxes = document.querySelectorAll('#competitor-form input[type="checkbox"]:checked');
    const events = Array.from(eventCheckboxes).map(checkbox => checkbox.value);

    const competitor = {
        id: competitors.length + 1,
        name,
        events,
        groupAssignments: {} // Initialize group assignments for each event
    };

    competitors.push(competitor);
    displayCompetitors();
}

function displayCompetitors() {
    const competitorListBody = document.querySelector('#competitor-list tbody');
    competitorListBody.innerHTML = '';

    competitors.forEach((competitor, index) => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = index + 1;

        const nameCell = document.createElement('td');
        nameCell.textContent = competitor.name;

        const eventsCell = document.createElement('td');
        eventsCell.textContent = competitor.events.join(', ');

        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteCompetitor(index);
        deleteButton.classList.add('delete-btn');
        actionsCell.appendChild(deleteButton);

        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(eventsCell);
        row.appendChild(actionsCell);

        competitorListBody.appendChild(row);
    });

    updateCompetitorForm();
}

function deleteCompetitor(index) {
    competitors.splice(index, 1);
    displayCompetitors();
}

function finalizeCompetitors() {
    competitionData.competitors = competitors;

    document.getElementById('competitor-setup').style.display = 'none';
    document.getElementById('grouping-results').style.display = 'block';

    generateGroups();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateGroups() {
    const maxCompetitors = competitionData.maxCompetitors;
    const groupingOutput = document.getElementById('grouping-output');
    groupingOutput.innerHTML = '';

    competitionData.groups = {};

    selectedEvents.forEach(eventId => {
        const eventCompetitors = competitors.filter(c => c.events.includes(eventId));
        shuffleArray(eventCompetitors);

        // Determine the number of groups
        const numGroups = Math.ceil(eventCompetitors.length / Math.ceil(maxCompetitors / 2));
        const eventGroups = [];

        // Initialize empty groups
        for (let i = 0; i < numGroups; i++) {
            eventGroups.push({
                competitors: [],
                judges: [],
                scramblers: [],
                runners: []
            });
        }

        // Distribute competitors evenly among the groups using a round-robin approach
        eventCompetitors.forEach((competitor, index) => {
            const groupIndex = index % numGroups;
            eventGroups[groupIndex].competitors.push(competitor);

            // Assign the competitor to this group for this event
            competitor.groupAssignments[eventId] = groupIndex + 1; // Groups are 1-indexed
        });

        // Assign runners, judges, and scramblers ensuring no overlap
        eventGroups.forEach((group, groupIndex) => {
            // Assign scramblers: competitors not in this group but in the event
            const availableScramblers = eventCompetitors.filter(c =>
                c.groupAssignments[eventId] !== (groupIndex + 1)
            );

            if (availableScramblers.length > 0) {
                group.scramblers = [availableScramblers[0]]; // Only 1 scrambler per group
            }

            // Assign judges if applicable
            if (includeJudges) {
                const availableJudges = eventCompetitors.filter(c =>
                    c.groupAssignments[eventId] !== (groupIndex + 1) &&
                    !group.judges.includes(c) && !group.scramblers.includes(c)
                );

                group.judges = availableJudges.slice(0, group.competitors.length);
            }

            // Assign runners if applicable
            if (includeRunners) {
                const availableRunners = eventCompetitors.filter(c =>
                    c.groupAssignments[eventId] !== (groupIndex + 1) &&
                    !group.judges.includes(c) && !group.scramblers.includes(c)
                );

                if (availableRunners.length > 0) {
                    group.runners = availableRunners.slice(0, 1); // Only 1 runner per group
                }
            }
        });

        competitionData.groups[eventId] = eventGroups;

        const event = events.find(e => e.id === eventId);
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-group';

        const eventTitle = document.createElement('h3');
        eventTitle.textContent = event.name;

        eventDiv.appendChild(eventTitle);

        eventGroups.forEach((group, groupIndex) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';

            const groupTitle = document.createElement('h4');
            groupTitle.textContent = `Group ${groupIndex + 1}`;

            groupDiv.appendChild(groupTitle);

            group.competitors.forEach(competitor => {
                const competitorDiv = document.createElement('div');
                competitorDiv.textContent = `${competitor.id} ${competitor.name}`;

                groupDiv.appendChild(competitorDiv);
            });

            if (includeJudges) {
                const judgesDiv = document.createElement('div');
                judgesDiv.textContent = `Judges: ${group.judges.map(j => j.name).join(', ')}`;
                groupDiv.appendChild(judgesDiv);
            }

            if (includeRunners) {
                const runnersDiv = document.createElement('div');
                runnersDiv.textContent = `Runners: ${group.runners.map(r => r.name).join(', ')}`;
                groupDiv.appendChild(runnersDiv);
            }

            const scramblersDiv = document.createElement('div');
            scramblersDiv.textContent = `Scramblers: ${group.scramblers.map(s => s.name).join(', ')}`;

            groupDiv.appendChild(scramblersDiv);

            eventDiv.appendChild(groupDiv);
        });

        groupingOutput.appendChild(eventDiv);
    });
}
