// Base URL for your API
const API_URL = 'https://backend-ju.vercel.app/api/v1';

document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  setupImageHandlers();
});

function setupImageHandlers() {
  // Preview image when file is selected
  document.getElementById('imageInput').addEventListener('change', handleImagePreview);
  
  // Form submission
  document.getElementById('imageUploadForm').addEventListener('submit', handleImageUpload);
  
  // Reset form
  document.getElementById('resetBtn').addEventListener('click', resetForm);
}

function handleImagePreview(event) {
  const file = event.target.files[0];
  const previewContainer = document.getElementById('imagePreview');
  
  // Clear previous preview
  previewContainer.innerHTML = '';
  
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      previewContainer.appendChild(img);
    }
    reader.readAsDataURL(file);
  } else {
    previewContainer.innerHTML = '<span class="preview-placeholder">Please select a valid image file</span>';
  }
}

function handleImageUpload(e) {
  e.preventDefault();
  
  // Hide any previous results
  if (document.getElementById('resultContainer')) {
    document.getElementById('resultContainer').style.display = 'none';
  }
  
  // Get form values
  const imageFile = document.getElementById('imageInput').files[0];
  const imageTitle = document.getElementById('imageTitle').value;
  
  // Validate
  if (!imageFile) {
    alert('Please select an image file');
    return;
  }
  
  if (!imageTitle.trim()) {
    alert('Please enter an image title');
    return;
  }
  
  // Show progress bar
  const progressBar = document.querySelector('.progress-bar');
  const progressContainer = document.getElementById('uploadProgress');
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';
  
  // Disable submit button and show loading state
  const uploadBtn = document.getElementById('uploadBtn');
  const originalBtnText = uploadBtn.innerHTML;
  uploadBtn.innerHTML = '<span class="loader"></span> Analyzing...';
  uploadBtn.disabled = true;
  
  // Prepare form data for upload
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('title', imageTitle);
  formData.append('description', document.getElementById('imageDescription').value);
  
  // Send to server
  fetch(`${API_URL}/crops/create`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    }
  })
  .then(response => {
    // Update progress to 100%
    progressBar.style.width = '100%';
    
    if (!response.ok) {
      throw new Error('Server error: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    // Reset button state
    uploadBtn.innerHTML = originalBtnText;
    uploadBtn.disabled = false;
    
    displayAnalysisResults(data);
  })
  .catch(error => {
    console.error('Upload error:', error);
    
    // Reset button state
    uploadBtn.innerHTML = originalBtnText;
    uploadBtn.disabled = false;
    
    // Show error message
    if (document.getElementById('resultContainer')) {
      document.getElementById('resultContainer').style.display = 'block';
      document.querySelector('#analysisResult').innerHTML = 
        `<div class="alert alert-danger">Error uploading image: ${error.message}</div>`;
    } else {
      alert('Error uploading image: ' + error.message);
    }
  })
  .finally(() => {
    // Hide progress bar after a delay
    setTimeout(() => {
      progressContainer.style.display = 'none';
    }, 500);
  });
}

function displayAnalysisResults(data) {
  // Check if result container exists
  let resultContainer = document.getElementById('resultContainer');
  
  // If it doesn't exist, create it
  if (!resultContainer) {
    resultContainer = document.createElement('div');
    resultContainer.id = 'resultContainer';
    resultContainer.className = 'result-container';
    
    const title = document.createElement('div');
    title.className = 'result-title';
    title.innerHTML = '<i class="fas fa-microscope me-2"></i>Disease Analysis Result';
    
    const resultPara = document.createElement('p');
    resultPara.id = 'analysisResult';
    
    resultContainer.appendChild(title);
    resultContainer.appendChild(resultPara);
    
    // Insert before the button group
    const buttonGroup = document.querySelector('.mt-4.d-grid');
    buttonGroup.parentNode.insertBefore(resultContainer, buttonGroup);
  }
  
  // Now display the results
  if (data.success && data.diseaseIdentified) {
    resultContainer.style.display = 'block';
    const resultElem = document.querySelector('#analysisResult');
    resultElem.innerHTML = `<span class="disease-name">${data.diseaseIdentified}</span>`;
    
    // Additional disease info if available
    if (data.diseaseInfo) {
      resultElem.innerHTML += `<p class="mt-3">${data.diseaseInfo}</p>`;
    }
    
    // Treatment recommendations if available
    if (data.treatment) {
      resultElem.innerHTML += `<p class="mt-2"><strong>Recommended Treatment:</strong> ${data.treatment}</p>`;
    }
  } else {
    // If analysis failed but API called successfully
    resultContainer.style.display = 'block';
    document.querySelector('#analysisResult').innerHTML = 
      'Unable to identify disease. Please try with a clearer image.';
  }
}

function resetForm() {
  document.getElementById('imageUploadForm').reset();
  document.getElementById('imagePreview').innerHTML = '<span class="preview-placeholder">Image preview will appear here</span>';
  document.getElementById('uploadProgress').style.display = 'none';
  document.querySelector('.progress-bar').style.width = '0%';
  
  // Hide result container if it exists
  if (document.getElementById('resultContainer')) {
    document.getElementById('resultContainer').style.display = 'none';
  }
}