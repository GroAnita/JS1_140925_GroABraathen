// Checkout Page JavaScript
let checkoutCart = [];

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Initialize cart functionality
    initializeShoppingBag();
    updateCartCounter();
    
    // Initialize checkout specific functionality
    initializeCheckout();
    
    // Display checkout items
    displayCheckoutItems();
    updateCheckoutTotal();
    
    // Initialize success modal
    initializeSuccessModal();
    
    // Listen for storage changes (other tabs) and custom cartUpdated event (same tab)
    window.addEventListener('storage', function(event) {
        if (event.key === 'cart') {
            loadCartFromStorage();
            displayCheckoutItems();
            updateCheckoutTotal();
            updateCartCounter();
        }
    });
    window.addEventListener('cartUpdated', function() {
        loadCartFromStorage();
        displayCheckoutItems();
        updateCheckoutTotal();
        updateCartCounter();
    });
});

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        checkoutCart = JSON.parse(savedCart);
        // Also update the global cart variable if it exists
        if (typeof cart !== 'undefined') {
            cart = [...checkoutCart];
        }
    }
}

function initializeCheckout() {
    // Initialize form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Initialize return to cart button
    const returnButton = document.getElementById('returnToCartButton');
    if (returnButton) {
        returnButton.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Add basic form validation
    initializeBasicValidation();
    
    // Check if cart is empty
    if (checkoutCart.length === 0) {
        showEmptyCartMessage();
    }
}

function displayCheckoutItems() {
    const cartItemsContainer = document.querySelector('.cart_items');
    
    if (!cartItemsContainer) return;
    
    // Clear existing items
    cartItemsContainer.innerHTML = '';
    
    if (checkoutCart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        updateCheckoutTotal();
        showEmptyCartMessage();
        return;
    }
    
    checkoutCart.forEach((item, index) => {
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.setAttribute('data-index', index);
        
        checkoutItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <h3>${item.title}</h3>
                <p>Price: $${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
                ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                <p><strong>Subtotal: $${(item.price * item.quantity).toFixed(2)}</strong></p>
            </div>
            <div class="item-actions">
                <button class="remove-checkout-item" data-index="${index}" title="Remove item">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(checkoutItem);
    });
    
    // Add event listeners for remove buttons
    addCheckoutItemEventListeners();
}

function addCheckoutItemEventListeners() {
    // Remove item buttons
    document.querySelectorAll('.remove-checkout-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeCheckoutItem(index);
        });
    });
}

function removeCheckoutItem(index) {
    // Remove item from checkout cart
    checkoutCart.splice(index, 1);
    
    // Updating global cart if it exists
    if (typeof cart !== 'undefined') {
        cart = [...checkoutCart];
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(checkoutCart));
    
    // Update the displays
    displayCheckoutItems();
    updateCheckoutTotal();
    updateCartCounter();
    
    // Update shopping cart sidebar if it exists and is open
    if (typeof displayShoppingCartItems === 'function' && document.body.classList.contains('show-cart')) {
        displayShoppingCartItems();
        updateShoppingCartTotal();
    }
}

function updateCheckoutTotal() {
    const totalElement = document.getElementById('totalAmount');
    if (!totalElement) return;
    
    const total = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = total.toFixed(2);
}

function initializeBasicValidation() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    
    form.addEventListener('submit', function(event) {
        const isValid = validateForm();
        if (!isValid) {
            event.preventDefault();
        }
    });
}

function validateForm() {
    const form = document.getElementById('checkoutForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#28a745';
        }
    });
    
    // Email validation
    const emailField = form.querySelector('[type="email"]');
    if (emailField && emailField.value && !emailField.value.includes('@')) {
        emailField.style.borderColor = '#dc3545';
        isValid = false;
    }
    return isValid;
}

function handleFormSubmission(event) {
    event.preventDefault();
    
    // Check if cart is empty
    if (checkoutCart.length === 0) {
        alert('Your cart is empty! Please add items before checkout.');
        return;
    }
    processOrder();
}

function processOrder() {
    // Generate order ID
    const orderId = generateOrderId();
    
    // Calculate delivery date (7-10 business days)
    const deliveryDate = calculateDeliveryDate();
    
    // Get customer details
    const customerData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        orderId: orderId,
        items: checkoutCart,
        total: checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString(),
        deliveryDate: deliveryDate
    };
    
    // Simulate order processing
    showOrderProcessing();
    
    setTimeout(() => {
        clearCart();
        
        // Show success modal
        showSuccessModal(orderId, deliveryDate);
        
        saveOrderHistory(customerData);
    }, 2000);
}

function generateOrderId() {
    return '#RD' + Date.now().toString().substr(-6);
}

function calculateDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 10); // Add 10 days
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function showOrderProcessing() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Processing Order...';
        submitButton.disabled = true;
    }
}

function clearCart() {
    checkoutCart = [];
    cart = [];
    localStorage.removeItem('cart');
    updateCartCounter();
    displayCheckoutItems();
    updateCheckoutTotal();
    window.location.reload();
}

function saveOrderHistory(orderData) {
    let orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.push(orderData);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}

function showSuccessModal(orderId, deliveryDate) {
    const modal = document.getElementById('purchaseSuccessModal');
    const orderIdSpan = document.getElementById('purchaseId');
    const deliveryDateSpan = document.getElementById('deliveryDate');
    
    if (orderIdSpan) orderIdSpan.textContent = orderId;
    if (deliveryDateSpan) deliveryDateSpan.textContent = deliveryDate;
    
    if (modal) {
        modal.style.display = 'block';
    }
}

function initializeSuccessModal() {
    const modal = document.getElementById('purchaseSuccessModal');
    const closeBtn = document.querySelector('.success-close');
    const okBtn = document.getElementById('successOkBtn');
    
    function closeModal() {
        modal.style.display = 'none';
        // Redirect to home page
        window.location.href = 'index.html';
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (okBtn) okBtn.addEventListener('click', closeModal);
    
    // Closing modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function showEmptyCartMessage() {
    const checkoutLayout = document.querySelector('.checkoutlayout');
    if (checkoutLayout) {
        checkoutLayout.innerHTML = `
            <div class="empty-checkout">
                <h2>Your cart is very empty</h2>
                <p>Add some Rainyday items to your cart before proceeding to checkout.</p>
                <button onclick="window.location.href='index.html'" class="return-home-btn">
                    Continue Shopping
                </button>
            </div>
        `;
    }
}

function placeOrder(event) {
    handleFormSubmission(event);
}

function showCart() {
    window.location.href = 'index.html';
}
