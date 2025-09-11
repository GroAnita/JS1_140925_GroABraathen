const API_URL = 'https://v2.api.noroff.dev/rainy-days';

async function fetchrainydayproduct() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        return null;
    }
}

async function loadProducts() {
    const products = await fetchrainydayproduct();
    if (products && products.data) {
        displayProducts(products.data);
    }
}

function displayProducts(products) {
    const container = document.querySelector('.test-product-grid');
    if(!container) return;

    container.innerHTML = '';

    products.forEach(product => {
        const productHTML = `<div class="test-product-item">
            <img src="${product.image.url}" alt="${product.title}" class="test-product-image">
            <h2 class="test-product-title">${product.title}</h2>
            <p class="test-product-description">${product.description}</p>
            <p class="test-price">$${product.price}</p>
            <button class="test-add-to-cart">Add to Cart</button>
        </div>`;
        container.innerHTML += productHTML;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});