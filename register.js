// Base URL for your API
const API_URL = 'https://backend-ju.vercel.app/api/v1';

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');
  
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Hide previous messages
    document.getElementById('error-message').classList.add('d-none');
    document.getElementById('success-message').classList.add('d-none');
    
    // Get form data
    const formData = new FormData(registerForm);
    
    // Register user
    registerUser(formData);
    
  });
});

function registerUser(formData) {
  fetch(`${API_URL}/users/register`, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Show success message
      const successMessage = document.getElementById('success-message');
      successMessage.textContent = 'Registration successful! Redirecting to login...';
      successMessage.classList.remove('d-none');
      
      // Redirect to login page after a delay
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      // Show error message
      const errorMessage = document.getElementById('error-message');
      errorMessage.textContent = data.message || 'Registration failed. Please try again.';
      errorMessage.classList.remove('d-none');
    }
  })
  .catch(error => {
    console.error('Registration error:', error);
    // Show error message
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = 'An error occurred during registration. Please try again.';
    errorMessage.classList.remove('d-none');
  });
}