// Product Page JavaScript
let currentProduct = null;

// Get product ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Initialize product page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (productId) {
        fetchAndDisplayProduct(productId);
    } else {
        showError('No product ID provided');
    }
    
    // Initialize cart functionality
    initializeShoppingBag();
    updateCartCounter();
    
    // Initialize tab functionality
    initializeTabs();
    
    // Initialize product page specific functionality
    initializeProductPage();
});

async function fetchAndDisplayProduct(id) {
    try {
        displayLoading();
        
        const response = await fetch(`https://v2.api.noroff.dev/rainy-days/${id}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        const product = await response.json();
        currentProduct = product.data;
        displayProduct(currentProduct);
        
    } catch (error) {
        console.error('Error fetching product:', error);
        showError('Failed to load product. Please try again.');
    }
}

function displayProduct(product) {
    // Update page title
    document.title = `RainyDays - ${product.title}`;
    
    // Update main product image
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = product.image.url;
    mainImage.alt = product.image.alt;
    
    // Update product title
    document.getElementById('productTitle').textContent = product.title;
    
    // Update product description
    document.getElementById('productDescription').textContent = product.description;
    
    // Update pricing
    updateProductPricing(product);
    
    // Update sizes if available
    updateSizeOptions(product);
    
    // Update product specifications
    updateProductSpecs(product);
    
    // Initialize add to cart functionality
    initializeAddToCart(product);
}

function updateProductPricing(product) {
    const priceElement = document.getElementById('productPrice');
    const originalPriceElement = document.getElementById('originalPrice');
    
    if (product.onSale) {
        priceElement.textContent = `$${product.discountedPrice}`;
        priceElement.classList.add('sale-price');
        originalPriceElement.textContent = `$${product.price}`;
        originalPriceElement.style.display = 'inline';
    } else {
        priceElement.textContent = `$${product.price}`;
        priceElement.classList.remove('sale-price');
        originalPriceElement.style.display = 'none';
    }
}

function updateSizeOptions(product) {
    const sizeSelect = document.getElementById('sizeSelect');
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    
    if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
        document.querySelector('.size-selector').style.display = 'block';
    } else {
        document.querySelector('.size-selector').style.display = 'none';
    }
}

function updateProductSpecs(product) {
    const specsContainer = document.getElementById('productSpecs');
    specsContainer.innerHTML = '';
    
    // Add basic specs
    const specs = [
        { label: 'Brand', value: 'RainyDays' },
        { label: 'Material', value: product.material || 'High-quality materials' },
        { label: 'Gender', value: product.gender || 'Unisex' },
        { label: 'Tags', value: product.tags ? product.tags.join(', ') : 'Outdoor, Waterproof' }
    ];
    
    specs.forEach(spec => {
        const specItem = document.createElement('div');
        specItem.className = 'spec-item';
        specItem.innerHTML = `<strong>${spec.label}:</strong> ${spec.value}`;
        specsContainer.appendChild(specItem);
    });
}

function initializeAddToCart(product) {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const quantityInput = document.getElementById('quantity');
    const sizeSelect = document.getElementById('sizeSelect');
    
    addToCartBtn.addEventListener('click', function() {
        const quantity = parseInt(quantityInput.value) || 1;
        const selectedSize = sizeSelect.value;
        
        // Check if size is required but not selected
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            showCustomAlert('Please select a size', 'Size Required');
            return;
        }
        
        // Add multiple quantities to cart
        for (let i = 0; i < quantity; i++) {
            addToCart(product, selectedSize);
        }
        
        showCustomAlert(
            `${product.title}${selectedSize ? ` (Size: ${selectedSize})` : ''} added to cart!`,
            'Added to Cart'
        );
    });
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

function initializeProductPage() {
    // Initialize quantity input
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('change', function() {
        if (this.value < 1) this.value = 1;
        if (this.value > 10) this.value = 10;
    });
    
    // Initialize custom alert modal
    initializeCustomAlert();
}

function displayLoading() {
    document.getElementById('productTitle').textContent = 'Loading...';
    document.getElementById('productDescription').textContent = 'Loading product information...';
    document.getElementById('productPrice').textContent = '$0.00';
}

function showError(message) {
    document.getElementById('productTitle').textContent = 'Error';
    document.getElementById('productDescription').textContent = message;
    document.getElementById('productPrice').textContent = '';
}

function initializeCustomAlert() {
    const modal = document.getElementById('customAlert');
    const closeBtn = document.querySelector('.alert-close');
    const okBtn = document.getElementById('alertOkBtn');
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    closeBtn.addEventListener('click', closeModal);
    okBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function showCustomAlert(message, title = 'Alert') {
    const modal = document.getElementById('customAlert');
    const titleElement = document.getElementById('alertTitle');
    const messageElement = document.getElementById('alertMessage');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    modal.style.display = 'block';
}
