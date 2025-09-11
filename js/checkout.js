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
    
    // Listen for storage changes (when cart is updated from other pages)
    window.addEventListener('storage', function(event) {
        if (event.key === 'cart') {
            loadCartFromStorage();
            displayCheckoutItems();
            updateCheckoutTotal();
            updateCartCounter();
        }
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
    
    // Initialize form validation
    initializeFormValidation();
    
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
    
    // Update global cart if it exists
    if (typeof cart !== 'undefined') {
        cart = [...checkoutCart];
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(checkoutCart));
    
    // Update displays
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

function initializeFormValidation() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearErrorStyle);
    });
    
    // Special validation for card number
    const cardInput = document.getElementById('cardNumber');
    if (cardInput) {
        cardInput.addEventListener('input', formatCardNumber);
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remove existing error styling
    clearErrorStyle(event);
    
    switch(input.type) {
        case 'email':
            if (!isValidEmail(value)) {
                showInputError(input, 'Please enter a valid email address');
            }
            break;
        case 'tel':
            if (!isValidPhone(value)) {
                showInputError(input, 'Please enter a valid phone number');
            }
            break;
        case 'text':
            if (input.id === 'cardNumber' && !isValidCardNumber(value)) {
                showInputError(input, 'Please enter a valid card number (16 digits)');
            }
            break;
    }
}

function clearErrorStyle(event) {
    const input = event.target;
    input.classList.remove('error');
    const errorMsg = input.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function showInputError(input, message) {
    input.classList.add('error');
    
    // Remove existing error message
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);
}

function formatCardNumber(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 16) value = value.substr(0, 16); // Limit to 16 digits
    
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    event.target.value = value;
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) value = value.substr(0, 10); // Limit to 10 digits
    
    // Format as (XXX) XXX-XXXX
    if (value.length >= 6) {
        value = `(${value.substr(0, 3)}) ${value.substr(3, 3)}-${value.substr(6)}`;
    } else if (value.length >= 3) {
        value = `(${value.substr(0, 3)}) ${value.substr(3)}`;
    }
    
    event.target.value = value;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
    return phoneRegex.test(phone);
}

function isValidCardNumber(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return cleanNumber.length === 16 && /^\d+$/.test(cleanNumber);
}

function handleFormSubmission(event) {
    event.preventDefault();
    
    // Validate all required fields
    const form = event.target;
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            showInputError(input, 'This field is required');
            isValid = false;
        } else {
            // Trigger validation
            validateInput({ target: input });
            if (input.classList.contains('error')) {
                isValid = false;
            }
        }
    });
    
    // Check if cart is empty
    if (checkoutCart.length === 0) {
        alert('Your cart is empty! Please add items before checkout.');
        return;
    }
    
    if (isValid) {
        processOrder();
    } else {
        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
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
        // Clear cart
        clearCart();
        
        // Show success modal
        showSuccessModal(orderId, deliveryDate);
        
        // Optional: Save order to localStorage for order history
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
    
    // Close modal when clicking outside
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
                <h2>Your cart is empty</h2>
                <p>Add some items to your cart before proceeding to checkout.</p>
                <button onclick="window.location.href='index.html'" class="return-home-btn">
                    Continue Shopping
                </button>
            </div>
        `;
    }
}

// Override the global placeOrder function if it exists
function placeOrder(event) {
    handleFormSubmission(event);
}

// Override the global showCart function if it exists
function showCart() {
    window.location.href = 'index.html';
}
