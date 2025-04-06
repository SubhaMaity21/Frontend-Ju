// Base URL for your API
const API_URL = 'https://backend-ju.vercel.app/api/v1';

document.addEventListener('DOMContentLoaded', function() {
  // Check if logged in
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  // Get user profile
  fetchUserProfile(token);
  
  // Add event listener for logout
  document.getElementById('logout-link').addEventListener('click', logout);
});

function fetchUserProfile(token) {
  fetch(`${API_URL}/users/current-user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      displayUserProfile(data.data);
    } else {
      showError(data.message || 'Failed to load profile');
    }
  })
  .catch(error => {
    console.error('Profile error:', error);
    showError('An error occurred while loading your profile');
  });
}

function displayUserProfile(user) {
  // Update profile image
  if (user.avatar) {
    document.getElementById('avatar-img').src = user.avatar;
  }
  
  // Update text fields
  document.getElementById('profile-fullname').textContent = user.fullName;
  document.getElementById('profile-username').textContent = `@${user.username}`;
  document.getElementById('profile-email').textContent = user.email;
}

function logout(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('accessToken');
  
  fetch(`${API_URL}/users/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      
      // Redirect to login page
      window.location.href = 'login.html';
    } else {
      throw new Error('Logout failed');
    }
  })
  .catch(error => {
    console.error('Logout error:', error);
    // If API call fails, still clear storage and redirect
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
  });
}

function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.classList.remove('d-none');
}