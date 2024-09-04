const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const postsContainer = document.getElementById('postsContainer'); // Get the posts container

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  const searchTerm = searchInput.value;

  try {
    const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(searchTerm)}`);
    const results = await response.json(); // Parse the JSON response

    // Update the content section with the search results
    postsContainer.innerHTML = ''; // Clear previous content

    // Logic to display results: you'll need to iterate over results and create HTML elements for each result
    results.forEach(result => {
      // Create a new div element for each search result
      const postElement = document.createElement('div');
      postElement.className = 'post';
      // Add the necessary HTML structure for each result
      postElement.innerHTML = `
        <h2>${result.title}</h2>
        <p>Sector: ${result.type}, Category: ${result.category}</p> 
        <p>${result.content}</p>
      `;

      // If there is an image URL, add an image to the post element
      if (result.imageUrl) {
        const postImage = document.createElement('img');
        postImage.src = `http://localhost:3000${result.imageUrl}`;
        postImage.alt = 'Post image';
        postElement.appendChild(postImage);
      }

      // Add the post element to the container
      postsContainer.appendChild(postElement);
    });

  } catch (error) {
    console.error('Error searching:', error);
    // Display an error message to the user
    // ...
  }
});