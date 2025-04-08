// Base URL for your API
const API_URL = 'https://backend-j.vercel.app/api/v1';

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
  
  // Check file type and size
  if (!imageFile.type.match('image.*')) {
    alert('Please select an image file (JPG, PNG, etc.)');
    return;
  }
  
  if (imageFile.size > 5 * 1024 * 1024) {
    alert('Image file is too large. Maximum size is 5MB.');
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
  
  // Prepare form data for upload - match server expectations
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('name', imageTitle); // Changed from 'title' to 'name' based on API requirements
  formData.append('description', document.getElementById('imageDescription').value || imageTitle);
  
  // Get access token
  const accessToken = localStorage.getItem('accessToken');
  
  // Send to server - DO NOT set Content-Type header when sending FormData
  fetch(`${API_URL}/crops/create`, {
    method: 'POST',
    body: formData,
    // Only set Authorization header, browser will set Content-Type with boundary
    headers: accessToken ? {
      'Authorization': `Bearer ${accessToken}`
    } : {}
  })
  .then(response => {
    // Update progress to 100%
    progressBar.style.width = '100%';
    
    // Check if response is OK
    if (!response.ok) {
      return response.text().then(text => {
        console.error('Server error response:', text);
        
        // Try to parse as JSON if possible
        try {
          const errData = JSON.parse(text);
          throw new Error(errData.message || `Server error: ${response.status}`);
        } catch (e) {
          // Not JSON or other parsing error
          throw new Error(`Server error: ${response.status}`);
        }
      });
    }
    
    // Return the response as text first
    return response.text();
  })
  .then(text => {
    // Try to parse as JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('Response is not valid JSON:', text);
      // Return a default structure
      return { 
        success: true, 
        message: text, 
        data: { 
          crop: { 
            diseaseIdentified: 'Response format error',
            image: null
          } 
        } 
      };
    }
  })
  .then(data => {
    // Reset button state
    uploadBtn.innerHTML = originalBtnText;
    uploadBtn.disabled = false;
    
    console.log('Response data:', data);
    
    // Match your API response structure
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
  
  resultContainer.style.display = 'block';
  const resultElem = document.querySelector('#analysisResult');

  try {
    // Now display the results - adjusted for your API response structure
    if (data && data.data && data.data.crop) {
      // Extract disease info from your API response
      const diseaseIdentified = data.data.crop.diseaseIdentified;
      
      // Show image from API if available
      if (data.data.crop.image) {
        resultElem.innerHTML = `
          <div class="mb-3 text-center">
            <img src="${data.data.crop.image}" alt="Uploaded crop image" 
                 class="img-fluid rounded" style="max-height: 200px;">
          </div>
        `;
      }
      
      // Add disease name
      resultElem.innerHTML += `<div class="mt-3">
        <span class="disease-name">Disease detected: ${diseaseIdentified}</span>
      </div>`;
      
      // Add AI response if different from disease name
      if (data.data.aiResponse && data.data.aiResponse !== diseaseIdentified) {
        resultElem.innerHTML += `<p class="mt-3">AI Analysis: ${data.data.aiResponse}</p>`;
      }
      
      // Add generic treatment recommendation based on disease
      addTreatmentRecommendation(resultElem, diseaseIdentified);
      
    } else if (data.statusCode === 201 && data.data && data.data.crop) {
      // Alternative success format
      const diseaseIdentified = data.data.crop.diseaseIdentified;
      
      // Show image from API if available
      if (data.data.crop.image) {
        resultElem.innerHTML = `
          <div class="mb-3 text-center">
            <img src="${data.data.crop.image}" alt="Uploaded crop image" 
                 class="img-fluid rounded" style="max-height: 200px;">
          </div>
        `;
      }
      
      // Add disease name
      resultElem.innerHTML += `<div class="mt-3">
        <span class="disease-name">Disease detected: ${diseaseIdentified}</span>
      </div>`;
      
      // Add AI response if different from disease name
      if (data.data.aiResponse) {
        resultElem.innerHTML += `<p class="mt-3">AI Analysis: ${data.data.aiResponse}</p>`;
      }
      
      // Add generic treatment recommendation based on disease
      addTreatmentRecommendation(resultElem, diseaseIdentified);
    } else {
      // Handle different response structures
      const message = data.message || data.msg || 'Response received';
      resultElem.innerHTML = `<div class="alert alert-info">${message}</div>
        <p>Unable to identify disease. Please try with a clearer image.</p>`;
      
      console.log('Unexpected response format:', data);
    }
  } catch (error) {
    console.error('Error displaying results:', error);
    resultElem.innerHTML = 'Error displaying results. Please try again.';
  }
}

function addTreatmentRecommendation(resultElem, diseaseIdentified) {
  const disease = diseaseIdentified.toLowerCase();
  
  if (disease.includes("rust")) {
    resultElem.innerHTML += `
      <div class="mt-3">
        <strong>Recommended Treatment:</strong>
        <ul class="mt-2">
          <li>Apply fungicides containing tebuconazole or propiconazole</li>
          <li>Improve air circulation around plants</li>
          <li>Remove and destroy infected plant parts</li>
          <li>Avoid overhead watering to reduce humidity</li>
        </ul>
      </div>`;
  } 
   else {
    resultElem.innerHTML += `
      <div class="mt-3">
        <strong>General Care Recommendations:</strong>
        <ul class="mt-2">
          <li>Monitor plant health regularly</li>
          <li>Remove any affected parts immediately</li>
          <li>Ensure proper watering and nutrition</li>
          <li>Consider consulting with a local agricultural extension service</li>
        </ul>
      </div>`;
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