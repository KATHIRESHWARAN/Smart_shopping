document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const productInput = document.getElementById('productInput');
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('results');
    const errorElement = document.getElementById('error');
    
    searchBtn.addEventListener('click', getRecommendations);
    productInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getRecommendations();
        }
    });
    
    function getRecommendations() {
        const productName = productInput.value.trim();
        
        if (!productName) {
            showError('Please enter a product name');
            return;
        }
        
        // Show loading, hide results and error
        loadingElement.classList.remove('hidden');
        resultsElement.classList.add('hidden');
        errorElement.classList.add('hidden');
        
        // Make API request
        fetch('/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_name: productName })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            loadingElement.classList.add('hidden');
            displayResults(data);
        })
        .catch(error => {
            loadingElement.classList.add('hidden');
            showError(error.error || 'Failed to get recommendations. Please try again.');
        });
    }
    
    function displayResults(data) {
        const originalProductElement = document.getElementById('originalProduct');
        const recommendationGrid = document.getElementById('recommendationGrid');
        
        // Clear previous results
        originalProductElement.innerHTML = '';
        recommendationGrid.innerHTML = '';
        
        // Display original product
        originalProductElement.innerHTML = `
            <h4 class="product-name">${data.product}</h4>
            <span class="product-category">${data.category}</span>
        `;
        
        // Display recommendations
        data.recommendations.forEach(product => {
            const card = document.createElement('div');
            card.className = 'recommendation-card';
            card.innerHTML = `
                <h4 class="product-name">${product}</h4>
                <span class="product-category">${data.category}</span>
            `;
            recommendationGrid.appendChild(card);
        });
        
        resultsElement.classList.remove('hidden');
    }
    
    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
});