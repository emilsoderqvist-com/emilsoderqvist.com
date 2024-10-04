// Fetch content for the left side
fetch('left-content.txt')
    .then(response => response.text())
    .then(data => {
        document.getElementById('left-container').innerHTML = data;
    })
    .catch(error => console.error('Error fetching left content:', error));

// Fetch content for the right side
fetch('right-content.txt')
    .then(response => response.text())
    .then(data => {
        document.getElementById('right-container').innerHTML = data;
    })
    .catch(error => console.error('Error fetching right content:', error));
