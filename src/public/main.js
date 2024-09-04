document.addEventListener('DOMContentLoaded', () => {
  const admin = JSON.parse(localStorage.getItem('admin'));

  // Fetch and display feedback (existing code)
  fetch(`http://localhost:3000/issues/feedback-by-admin/${admin.id}`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      const feedbackContainer = document.getElementById('feedbackContainer');

      data.forEach(item => {
          const feedbackCard = document.createElement('div');
          feedbackCard.classList.add('feedback-card');

          const likeButton = document.createElement('button');
          likeButton.textContent = `👍 ${item.likes || 0}`;
          likeButton.className = 'like-btn';
          likeButton.dataset.feedbackId = item.feedback_id;

          const dislikeButton = document.createElement('button');
          dislikeButton.textContent = `👎 ${item.dislikes || 0}`;
          dislikeButton.className = 'dislike-btn';
          dislikeButton.dataset.feedbackId = item.feedback_id;

          // Add event listeners for like and dislike
          likeButton.addEventListener('click', () => handleLikeDislike('like', item.feedback_id));
          dislikeButton.addEventListener('click', () => handleLikeDislike('dislike', item.feedback_id));

          feedbackCard.appendChild(likeButton);
          feedbackCard.appendChild(dislikeButton);

          feedbackContainer.appendChild(feedbackCard);
      });
  })
  .catch(error => {
      console.error('Error fetching feedback:', error);
      const feedbackContainer = document.getElementById('feedbackContainer');
      feedbackContainer.innerHTML = '<p>Feedback will be given soon.</p>';
  });

  function handleLikeDislike(action, feedbackId) {
      fetch('http://localhost:3000/issues/feedback-like', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              feedbackId: feedbackId,
              adminId: admin.id,
              action: action
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.message) {
              alert(data.message);
          } else {
              alert('Action completed successfully.');
              location.reload();  // Reload the page to update the like/dislike counts
          }
      })
      .catch(error => {
          console.error('Error liking/disliking feedback:', error);
          alert('An error occurred.');
      });
  }
});
