// Base URL for your API
const API_URL = 'https://backend-j.vercel.app/api/v1';

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  
  // Check if already logged in
  if (localStorage.getItem('accessToken')) {
    window.location.href = 'index.html';
  }
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Hide previous error
    document.getElementById('error-message').classList.add('d-none');
    
    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Login user
    loginUser(username, password);
  });
});

function loginUser(username, password) {
  // Show loading state
  const submitBtn = document.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  submitBtn.disabled = true;

  fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  })
  .then(response => response.json())
  .then(data => {
    // Reset button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    
    if (data.success) {
      // Store tokens in local storage
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('username', data.data.user.username);
      
      // Redirect to home page
      window.location.href = 'index.html';
    } else {
      // Show error message
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = data.message || 'Login failed. Please check your credentials.';
      errorMessage.classList.remove('d-none');
    }
  })
  .catch(error => {
    // Reset button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    
    console.error('Login error:', error);
    // Show error message
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = 'An error occurred during login. Please try again.';
    errorMessage.classList.remove('d-none');
  });
}