// sessionManagement.js

function checkSessionTimeout() {
    const sessionStart = localStorage.getItem('sessionStart');
    const sessionDuration = 10 * 60 * 1000; // 30 minutes in milliseconds
  
    // Client-side timeout check (optional but recommended)
    console.log('mmmmmmmmmmmmmm',sessionStart);
    if (sessionStart) {
      const currentTime = Date.now();
      console.log('mmmmmmmmmmmmmm',currentTime,sessionStart);
      
      if (currentTime - sessionStart > sessionDuration) {
        handleSessionExpiration();
        return false;
      }
    }
  
    // Server-side session validation
    return fetch('/api/auth/checkSession', { // Replace with your actual API endpoint
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Session invalid'); 
      }
      return response.json(); // If your server sends data back
    })
    .then(data => {
      // Optional: Update session start time if server provides it
      // if (data.newSessionStart) {
      //   localStorage.setItem('sessionStart', data.newSessionStart);
      // }
      return true; // Session is valid
    })
    .catch(error => {
      console.error('Session check failed:', error);
      handleSessionExpiration();
      return false; // Session is invalid or check failed
    });
  }
  
  function handleSessionExpiration() {
      localStorage.clear();
      alert('Your session has expired. Please log in again.');
      window.location.href = 'AdminLogin.html'; // Redirect to login 
  }
  
  // Check immediately on page load
  (function() {
    if (!checkSessionTimeout()) {
      window.stop(); 
      // window.location.href = 'AdminLogin.html'; // Redirect is handled in checkSessionTimeout
    }
  })();
  
  // Periodic checks (can be adjusted or removed)
  setInterval(checkSessionTimeout,  10 * 60 * 1000); 