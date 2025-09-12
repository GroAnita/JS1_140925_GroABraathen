let productsGrid; // The grid where my products will be displayed..hopefully
let allProducts = []; // the array that hold all the API products
let cart = JSON.parse(localStorage.getItem('cart')) || []; // tries to load the cart from localStorage or initializing as an empty array

// Wait for DOM to be ready before selecting elements and starting
document.addEventListener('DOMContentLoaded', function() {
    productsGrid = document.querySelector(".products-grid");
    if (productsGrid) {
        fetchProducts(); // Only fetch if the products grid exists
    } else {
        console.error("Products grid not found in HTML");
    }
    
    // Initializing the shopping bag functionality
    initializeShoppingBag();
    updateCartCounter();
});

// my shoppingbag and cart functions
function initializeShoppingBag() {
    const shoppingBag = document.querySelector('.shopping_bag');
    if (shoppingBag) {
        shoppingBag.addEventListener('click', function() {
            openShoppingCart();
        });
    }
}

function updateCartCounter() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
}

function addToCart(product, selectedSize = '') {
    // Create a unique identifier that includes size for products with sizes
    const itemKey = selectedSize ? `${product.id}-${selectedSize}` : product.id;
    
    // Check if item with same product and size already exists in cart
    const existingItem = cart.find(item => {
        if (selectedSize) {
            return String(item.id) === String(product.id) && item.size === selectedSize;
        } else {
            return String(item.id) === String(product.id) && !item.size;
        }
    });
    
    if (existingItem) {
        // Increase quantity if item exists
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        // Add new item to cart
        const cartItem = {
            id: product.id,
            title: product.title,
            price: product.discountedPrice || product.price,
            image: product.image.url,
            quantity: 1
        };
        
        // Add size if selected
        if (selectedSize) {
            cartItem.size = selectedSize;
        }
        
        cart.push(cartItem);
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update counter
    updateCartCounter();
    
    // Update shopping cart sidebar if it's open
    if (document.body.classList.contains('show-cart')) {
        displayShoppingCartItems();
        updateShoppingCartTotal();
    }
    
    // Show brief feedback - no longer showing alert
    const sizeText = selectedSize ? ` (Size: ${selectedSize})` : '';
    console.log(`${product.title}${sizeText} added to cart!`);
}

async function fetchProducts() {
    try {
        const response = await fetch("https://v2.api.noroff.dev/rainy-days");
        const apiResponse = await response.json();
        allProducts = apiResponse.data; // Extract the data array from the response
        displayProducts(allProducts);
        
        // Initialize category filter after products are loaded
        initializeCategoryFilter(allProducts, displayProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        
    }
}
function displayProducts(products) {
    clearContainer(productsGrid);

    // Add debugging to see what we're getting
    console.log("Products received:", products);
    
    // Check if products is an array
    if (!Array.isArray(products)) {
        console.error("Products is not an array:", products);
        displayNoResults(productsGrid);
        return;
    }

    if(products.length === 0) {
        displayNoResults(productsGrid);
        return;
    }

    products.forEach((product) => {

        const productBox = document.createElement("div");
        productBox.className = "product_box";

        const productImage = document.createElement("img");
        productImage.src = product.image.url;
        productImage.alt = product.title;

        const content = document.createElement("div");
        content.className = "product-content";

        const productTitle = document.createElement("h3");
        productTitle.textContent = product.title;

   

        const addToCartButton = document.createElement("button");
        addToCartButton.className = "add-to-cart";
        addToCartButton.dataset.id = product.id;
        addToCartButton.textContent = "Add to Cart";
        
        // Add click event to add an item to cart
        addToCartButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent navigation
            
            // Get selected size from the dropdown in the same product box
            const productBox = this.closest('.product_box');
            const sizeDropdown = productBox.querySelector('.size-dropdown');
            const selectedSize = sizeDropdown ? sizeDropdown.value : '';
            
            // Check if size is selected or give an alert
            if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                alert('Please select a size before adding to cart');
                return;
            }
            
            addToCart(product, selectedSize);
        });

        content.appendChild(productTitle);
        
        createPriceElements(product, content);
        
        // Adding the size dropdown
        const sizeDropdown = createSizeDropdown(product.sizes);
        content.appendChild(sizeDropdown);
        
        // Adding the View Product button that goes to the product page
        const viewProductButton = document.createElement("button");
        viewProductButton.className = "view-product";
        viewProductButton.textContent = "View Product";
        viewProductButton.addEventListener('click', function() {
            window.location.href = `productpage.html?id=${product.id}`;
        });

        content.appendChild(viewProductButton);      
        content.appendChild(addToCartButton);

        productBox.appendChild(productImage);
        productBox.appendChild(content);
        productsGrid.appendChild(productBox); 
    });
}

// Cart Overlay Functions

function addCartItemEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.dataset.id;
            const itemSize = this.dataset.size;
            decreaseQuantity(itemId, itemSize);
        });
    });
    
    // Increase quantity buttons
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.dataset.id;
            const itemSize = this.dataset.size;
            increaseQuantity(itemId, itemSize);
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.dataset.id;
            const itemSize = this.dataset.size;
            removeFromCart(itemId, itemSize);
        });
    });
}

function increaseQuantity(itemId, itemSize = '') {
    const item = cart.find(item => {
        if (itemSize) {
            return String(item.id) === String(itemId) && item.size === itemSize;
        } else {
            return String(item.id) === String(itemId) && !item.size;
        }
    });
    if (item) {
        item.quantity++;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
    displayShoppingCartItems();
        updateCartTotal();
    }
}

function decreaseQuantity(itemId, itemSize = '') {
    
    const item = cart.find(item => {
        if (itemSize) {
            return String(item.id) === String(itemId) && item.size === itemSize;
        } else {
            return String(item.id) === String(itemId) && !item.size;
        }
    });
    
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart = cart.filter(cartItem => {
                if (itemSize) {
                    return !(String(cartItem.id) === String(itemId) && cartItem.size === itemSize);
                } else {
                    return !(String(cartItem.id) === String(itemId) && !cartItem.size);
                }
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
    displayShoppingCartItems();
        updateCartTotal();
    } else {
    }
}

function removeFromCart(itemId, itemSize = '') {
    console.log('Removing item with ID:', itemId, 'size:', itemSize);
    console.log('Cart before removal:', cart);
    cart = cart.filter(item => {
        if (itemSize) {
            return !(String(item.id) === String(itemId) && item.size === itemSize);
        } else {
            return !(String(item.id) === String(itemId) && !item.size);
        }
    });
    console.log('Cart after removal:', cart);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    displayShoppingCartItems();
    updateCartTotal();
    
    // Update shopping cart sidebar if open
    if (document.body.classList.contains('show-cart')) {
        displayShoppingCartItems();
        updateShoppingCartTotal();
    }
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartTotal() {
    const cartTotalElement = document.getElementById('cartTotal');
    if (!cartTotalElement) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Save cart to localStorage before redirecting to checkout
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Shopping Cart Sidebar Functions
function openShoppingCart() {
    document.body.classList.add('show-cart');
    displayShoppingCartItems();
    updateShoppingCartTotal();
}

function closeShoppingCart() {
    document.body.classList.remove('show-cart');
}

function displayShoppingCartItems() {
    const cartItemsContainer = document.getElementById('shoppingCartItems');
    
    if (!cartItemsContainer) return;
    
    // Clear existing items
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}${item.size ? ` - Size: ${item.size}` : ''}</div>
                <div class="cart-item-price">$${item.price}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease-btn" data-id="${item.id}" data-size="${item.size || ''}">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn increase-btn" data-id="${item.id}" data-size="${item.size || ''}">+</button>
            </div>
            <span class="remove-item" data-id="${item.id}" data-size="${item.size || ''}">&times;</span>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Add event listeners for quantity buttons and remove buttons
    addShoppingCartEventListeners();
}

function addShoppingCartEventListeners() {
    // Decrease quantity buttons
    document.querySelectorAll('#shoppingCartItems .decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            const itemIndex = cart.findIndex(item => item.id == id && (item.size || '') === size);
            if (itemIndex > -1 && cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
                updateCartCounter();
                displayShoppingCartItems();
                updateShoppingCartTotal();
                saveCartToStorage();
            }
        });
    });
    
    // Increase quantity buttons
    document.querySelectorAll('#shoppingCartItems .increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            const itemIndex = cart.findIndex(item => item.id == id && (item.size || '') === size);
            if (itemIndex > -1) {
                cart[itemIndex].quantity++;
                updateCartCounter();
                displayShoppingCartItems();
                updateShoppingCartTotal();
                saveCartToStorage();
            }
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('#shoppingCartItems .remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const size = this.getAttribute('data-size') || '';
            
            // Use the main removeFromCart function to ensure all systems stay in sync
            removeFromCart(id, size);
            
            // Update shopping cart sidebar displays
            displayShoppingCartItems();
            updateShoppingCartTotal();
        });
    });
}

function updateShoppingCartTotal() {
    const cartTotalElement = document.getElementById('shoppingCartTotal');
    if (!cartTotalElement) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = total.toFixed(2);
}