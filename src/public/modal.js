function openUpdateModal(post) {
    document.getElementById('postId').value = post.id;
    document.getElementById('postIdField').value = post.id; // Display post ID
    document.getElementById('title').value = post.title;
    document.getElementById('content').value = post.content;

    // Set hidden fields for type and adminId
    document.getElementById('postType').value = post.type; // Assuming `type` is in the `post` object
    document.getElementById('adminId').value = post.adminId; // Assuming `adminId` is in the `post` object

    // Update image preview
    const imageUrl = post.imageUrl ? `http://localhost:3000${post.imageUrl}` : '';
    const imagePreview = document.getElementById('imagePreview');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    
    if (imageUrl) {
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block'; // Show image preview
    } else {
        imagePreview.style.display = 'none'; // Hide image preview if no image
    }

    imagePreviewContainer.style.display = 'block'; // Ensure container is visible
    document.getElementById('updateModal').style.display = 'block';
}


// Function to close the modal
function closeModal() {
    document.getElementById('updateModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    if (event.target === document.getElementById('updateModal')) {
        closeModal();
    }
}

// Handle form submission for updating the post
document.getElementById('updateForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    try {
        const response = await fetch(`http://localhost:3000/api/post/update/${formData.get('id')}`, {
            method: 'PUT',
            body: formData,
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            closeModal();
            location.reload(); // Refresh the page to reflect the changes
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error updating post:', error);
    }
});
