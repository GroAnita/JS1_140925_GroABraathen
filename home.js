const API_URL = "https://v2.api.noroff.dev/rainy-days";

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const isProductPage = window.location.pathname.includes('productpage.html') || 
                     window.location.href.includes('productpage.html');
const isHomePage = window.location.pathname.includes('index.html') || 
                  window.location.href.includes('index.html') || 
                  window.location.pathname === '/' || 
                  window.location.pathname.endsWith('/');

async function fetchProducts() {
    if (!API_URL) {
        console.error("API_URL is not defined");
        return;
    }
    try {
        const respons = await fetch(API_URL);
        const data = await respons.json();
        console.log(data);
        const produkter = data.data || data;
        products = produkter; // lagre produkter globalt
        if (produkter && produkter.length > 0) {
            if(isProductPage) {
                const productId = getProductId() || produkter[0].id;
                const product = produkter.find(p => p.id === productId);
                if(product) {
                    displaySingleProduct(product);
                } 
            }
            // viser inntil 3 produkter (1 for hver produkt boks)
            else if(isHomePage) {
                for (let i = 0; i < Math.min(3, produkter.length); i++) {
                    displayProduct(produkter[i], i);
                }
            }
        }
    }
    catch (error) {
        console.error("klarer ikke hente produkter:", error);
    }
}

function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function displaySingleProduct(product){
    const titleElement = document.getElementById('productTitle');
    if (titleElement) titleElement.textContent = product.title;

    const imageElement = document.getElementById('mainProductImage');
    if (imageElement && product.image) {
        imageElement.src = product.image.url;
        imageElement.alt = product.image.alt || product.title;
    }
    const priceElement = document.getElementById('productPrice');
    if (priceElement) priceElement.textContent = `Price: $${product.price}`;
    
    const descriptionElement = document.getElementById('productDescription');
    if (descriptionElement) descriptionElement.textContent = product.description;
    
    // Add sizes to the dropdown
    const sizeSelect = document.getElementById('sizeSelect');
    if (sizeSelect && product.sizes && product.sizes.length > 0) {
        // Clear existing options except the first one
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        
        // Add each size as an option
        product.sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
    } else if (sizeSelect) {
        // If no sizes in API data, add default clothing sizes
        const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        sizeSelect.innerHTML = '<option value="">Select Size</option>';
        
        defaultSizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            sizeSelect.appendChild(option);
        });
    }
    
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.onclick = () => addToCart(product.id);
    }
}




function displayProduct(product, index) {
    // Finne den spesifikke produkt boksen  (0, 1, eller 2)
    const productBoxes = document.querySelectorAll('.product_box');
    const currentBox = productBoxes[index];
    
    if (!currentBox) return; // ingen boks funnet for denne indeksen
    
    //  product ID på box
    currentBox.dataset.productId = product.id;
    
    // Finne elementer innenfor denne spesifikke produkt boksen
    const titleElement = currentBox.querySelector('.product_info h3');
    const descriptionElement = currentBox.querySelector('.product_info p:first-of-type');
    const priceElement = currentBox.querySelector('.product_info p:last-of-type');
    const imageElement = currentBox.querySelector('.product_img img');
    const buttonElement = currentBox.querySelector('button');

    if (titleElement) titleElement.textContent = product.title;
    if (descriptionElement) descriptionElement.textContent = product.description;
    if (priceElement) priceElement.textContent = `Price: $${product.price}`;
    if (imageElement && product.image) {
        imageElement.src = product.image.url;
        imageElement.alt = product.image.alt || product.title;
    }

    // klikk hendelse til knappen
    if (buttonElement) {
        buttonElement.onclick = () => addToCart(product.id);
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error("Product not found");
        return;
    }
    
    // sjekk om produktet allerede finnes i kurven
    let existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            title: product.title,
            price: product.price,
            image: product.image.url,
            quantity: 1
        });
    }
    
    // Lagre til localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // oppdatere cart teller
    updateCartCounter();
    
    console.log("Product added to cart:", product.title);
    console.log("Cart:", cart);
}

function updateCartCounter() {
    const cartCounter = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

function displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="cart-item-quantity">
                    <div class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</div>
                    <div class="quantity-number">${item.quantity}</div>
                    <div class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</div>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += cartItemHTML;
    });
    
    cartTotal.textContent = total.toFixed(2);
}

function changeQuantity(itemIndex, change) {
    if (itemIndex >= 0 && itemIndex < cart.length) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();
        displayCartItems();
    }
}

function showCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.classList.add('show');
        displayCartItems();
    }
}

function hideCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.classList.remove('show');
    }
}

function initializeProductTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            button.classList.add('active');

            const tabName = button.getAttribute("data-tab");
            const tabPane = document.getElementById(tabName);
            if (tabPane) tabPane.classList.add('active');
        });
    });
}

// starte "appen"
fetchProducts().then(() => {
    updateCartCounter();
    
    //  event listeners for cart
    const shoppingBag = document.querySelector('.shopping_bag');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    if (isProductPage) {
        initializeProductTabs();
    }
    if (shoppingBag) {
        shoppingBag.addEventListener('click', showCart);
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', hideCart);
    }
    
    // Lukk cart når man klikker utenfor
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                hideCart();
            }
        });
    }
    
});