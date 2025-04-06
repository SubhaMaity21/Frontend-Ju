// Base URL for your API
const API_URL = 'https://backend-ju.vercel.app/api/v1';

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status and update UI accordingly
  checkAuthStatus();
  
  // Set up event listeners
  setupEventListeners();
});

function checkAuthStatus() {
  // Check if user is logged in
  const accessToken = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');
  
  if (accessToken && username) {
    // User is logged in
    document.getElementById('login-nav-item').classList.add('d-none');
    document.getElementById('register-nav-item').classList.add('d-none');
    document.getElementById('profile-nav-item').classList.remove('d-none');
    document.getElementById('logout-nav-item').classList.remove('d-none');
    
    console.log('User is logged in as:', username);
  } else {
    // User is not logged in
    document.getElementById('login-nav-item').classList.remove('d-none');
    document.getElementById('register-nav-item').classList.remove('d-none');
    document.getElementById('profile-nav-item').classList.add('d-none');
    document.getElementById('logout-nav-item').classList.add('d-none');
    
    console.log('User is not logged in');
  }
}

function setupEventListeners() {
  // Set up logout handler
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  }
}

function handleLogout() {
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('username');
  
  // Update UI
  checkAuthStatus();
  
  // Show logout success message (optional)
  alert('You have been logged out successfully.');
  
  // Redirect to home page
  window.location.href = 'index.html';
}

// Function to validate token (you can expand this to actually verify with your backend)
function validateToken(token) {
  if (!token) return false;
  
  // You could add more validation here, like checking if token is expired
  // This is a simple check that the token exists and has a reasonable format
  return token.length > 20;
}