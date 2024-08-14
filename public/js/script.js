document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch tools and add them to the DOM
    async function loadTools() {
        try {
            const response = await fetch('/api/tools');
            const tools = await response.json();

            console.log('Tools:', tools); // Debugging line

            if (Array.isArray(tools)) {
                console.log(Array.isArray(tools));

                const toolsGrid = document.getElementById('tools-grid');
                console.log(toolsGrid);

                tools.forEach(tool => {
                    const toolElement = document.createElement('a');
                    toolElement.className = 'tag';
                    toolElement.href = `/tools/${tool.filename.replace('.html', '')}`;
                    toolElement.rel = 'noopener noreferrer';

                    toolElement.innerHTML = `
                        <div class="icon">🔧</div>
                        <h3 class="title">${tool.title}</h3>
                        <p class="description">${tool.description}</p>
                    `;

                    toolsGrid.appendChild(toolElement);
                });
            } else {
                console.error('Expected an array but received:', tools);
            }
        } catch (error) {
            console.error('Error loading tools:', error);
        }
    }

    // Load tools on page load
    loadTools();
});
