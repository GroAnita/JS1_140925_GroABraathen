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
            // viser inntil 12 produkter (1 for hver produkt boks)
            else if(isHomePage) {
                for (let i = 0; i < Math.min(12, produkter.length); i++) {
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
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
        buyNowBtn.onclick = () => buyNow();
    }
}




function displayProduct(product, index) {
    // Finne den spesifikke produkt boksen  
    const productBoxes = document.querySelectorAll('.product_box');
    const currentBox = productBoxes[index];

    if(currentBox) {
        currentBox.style.cursor = 'pointer';
        currentBox.addEventListener('click', () => {
            window.location.href = `productpage.html?id=${product.id}`;
        });
    }
    
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
    
    // oppdatering cart teller
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
        
//template literals : ${item.image}. tar image propertien og setter den som en src verdi : f.eks. https://rainydays.no/powerjacket.jpg og samme med item.title som da henter tittelen fra objektet og den blir alt tekst f.eks :  Rainjacket 

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
//funksjonen for å endre antall varer i handlekurven, basert på brukeren klikker + eller - for å legge til eller fjerne produkter. Når antallet kommer til 0 skal produktet fjernes helt fra kurven. 
function changeQuantity(itemAmount, change) {
    if (itemAmount >= 0 && itemAmount < cart.length) {
        cart[itemAmount].quantity += change;
//splice fjerner produktet når man kommer til 0
        if (cart[itemAmount].quantity <= 0) {
            cart.splice(itemAmount, 1);
        }
        //oppdaterer til localstorage og refresher kurven til nåværende resultat.
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

function buyNow(){ 
    const selectedProduct = getSelectedProduct();
    const sizeSelect = document.getElementById('sizeSelect');
    const selectedSize = sizeSelect ? sizeSelect.value : '';

    if (sizeSelect && !selectedSize) {
        showCustomAlert("Please choose a size before buying!", "Size Required");
        return;
    }

    selectedProduct.size = selectedSize;
    
    selectedProduct.id = getProductId();

    let existingItem = cart.find(item => item.id === selectedProduct.id);
    if(existingItem){
        existingItem.quantity += 1;
    } else {
        cart.push(selectedProduct);
    }
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCounter();

    // Redirect to checkout page
    window.location.href = 'checkout.html';
    }

function getSelectedProduct(){
    const productTitle = document.getElementById('productTitle').textContent;
    const priceText = document.getElementById('productPrice').textContent;
    const productPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    const productImage = document.getElementById('mainProductImage').src;

    return {
        title: productTitle,
        price: productPrice,
        image: productImage,
        quantity: 1
    };
}

//jeg har noen "tabs" på product sidene med reviews, shipping info etc.. denne funksjonen er for å aktivere disse sånn at de er aktive 1 om gangen så man jo da bare ser 1 fane om gangen. Og den fanen som er aktiv er da blå (satt i css som active class)
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

function initializeFilter() {
    const filterSelect = document.getElementById('categoryFilter');
    if (!filterSelect) return;
    
    filterSelect.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        if (selectedCategory === '') {
            // Show all products - reload the page
            location.reload();
        } else {
            filterProducts(selectedCategory);
        }
    });
}

function filterProducts(category) {
    if (!products || products.length === 0) return;

    let filteredProducts = products;

    if (category && category !== 'all') {
        filteredProducts = products.filter(product => {
            const productGender = product.gender ? product.gender.toLowerCase() : '';
            const productTitle = product.title ? product.title.toLowerCase() : '';
            const productTags = product.tags ? product.tags.join(', ').toLowerCase() : '';

            switch (category) {
                case "women":
                    return productGender.includes("female") || 
                           productTitle.includes('women') || 
                           productTitle.includes('female') ||
                           productTags.includes('women') ||
                           productTags.includes('female');
                           
                    //had to find a different way to write this code because 
                    //it also came back with the women clothes when i did as above
                case "men":
                     return productGender === "male" || 
                        /\bmen\b/i.test(productTitle) || 
                        /\bmale\b/i.test(productTitle) ||
                        /\bmen\b/i.test(productTags) ||
                        /\bmale\b/i.test(productTags);

                case 'accessories':
                    return productTitle.includes('accessory') ||
                           productTitle.includes('accessories') ||
                           productTags.includes('accessories');

                default:
                    return true;
            }
        });
    }
    
    // vise filtrerte produkter
    displayFilteredProducts(filteredProducts);
}

function displayFilteredProducts(filteredProducts) {
    const productBoxes = document.querySelectorAll('.product_box');
    
    // Hide all product boxes first
    productBoxes.forEach(box => {
        box.style.display = 'none';
    });

    // viser inntill 12 filtrerte produkter
    const maxProducts = Math.min(12, filteredProducts.length);

    for (let i = 0; i < maxProducts; i++) {
        if (productBoxes[i]) {
            displayProduct(filteredProducts[i], i);
            productBoxes[i].style.display = 'block';
        }
    }
}

function checkout(){
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // Saving cart to localStorage before redirecting (it's already saved, but just to be sure)
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// starte "appen"
fetchProducts().then(() => {
    updateCartCounter();
    
    // Add this for checkout page
    if (isCheckoutPage) {
        loadCheckoutCart();
    }
    
    //  event listeners for my cart
    const shoppingBag = document.querySelector('.shopping_bag');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    if (isProductPage) {
        initializeProductTabs();
    }
    if (isHomePage) {
        initializeFilter();
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
    
    // Initialize custom alert modal
    initializeCustomAlert();
    
});

// Checkout

const isCheckoutPage = window.location.pathname.includes('checkout.html');

function loadCheckoutCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    displayCheckoutItems();
    calculateCheckoutTotal();
}

function displayCheckoutItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {

        const itemHTML = `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-details">
                    <h3>${item.title}</h3>
                    <p>Size: ${item.size}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += itemHTML;
    
    });
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Update cart counter on all pages
    updateCartCounter();
    
    // If we're on checkout page, display items
    if (window.location.pathname.includes('checkout.html')) {
        displayCheckoutItems();
    }
});

function calculateCheckoutTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}


// Custom Alert Modal Functions testing
function showCustomAlert(message, title = "Alert") {
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('customAlert').style.display = 'block';
}

function closeCustomAlert() {
    document.getElementById('customAlert').style.display = 'none';
}

// Purchase Success Modal Functions
function showPurchaseSuccess() {
    // Generate random order ID
    const orderId = '#RD' + Math.floor(Math.random() * 1000000);
    
    // Calculate delivery date (7-14 days from now)
    const deliveryDays = Math.floor(Math.random() * 8) + 7; // 7-14 days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    const formattedDate = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update modal content
    document.getElementById('purchaseId').textContent = orderId;
    document.getElementById('deliveryDate').textContent = formattedDate;
    
    // Show modal
    document.getElementById('purchaseSuccessModal').style.display = 'block';
}

function closePurchaseSuccess() {
    document.getElementById('purchaseSuccessModal').style.display = 'none';
}

// Place Order function for checkout page
function placeOrder(event) {
    event.preventDefault(); // Prevent form submission
    
    // Validate that there are items in cart
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    // Clear the cart after successful order
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    
    // Show purchase success modal
    showPurchaseSuccess();
}

// Legacy function for backward compatibility
function showAlert(message) {
    showCustomAlert(message);
}

function closeAlert() {
    closeCustomAlert();
}

// Initialize Custom Alert confirmedPurchase Modal
function initializeCustomAlert() {
    const alertModal = document.getElementById('customAlert');
    const closeBtn = document.querySelector('.alert-close');
    const okBtn = document.getElementById('alertOkBtn');
    
    if (closeBtn) {
        closeBtn.onclick = closeCustomAlert;
    }
    
    if (okBtn) {
        okBtn.onclick = closeCustomAlert;
    }
    
    // Closing when clicking outside the modal
    if (alertModal) {
        alertModal.onclick = function(event) {
            if (event.target === alertModal) {
                closeCustomAlert();
            }
        }
    }
    
    // Initialize Purchase Success Modal (only on checkout page)
    if (isCheckoutPage) {
        const successModal = document.getElementById('purchaseSuccessModal');
        const successCloseBtn = document.querySelector('.success-close');
        const successOkBtn = document.getElementById('successOkBtn');
        
        if (successCloseBtn) {
            successCloseBtn.onclick = closePurchaseSuccess;
        }
        
        if (successOkBtn) {
            successOkBtn.onclick = function() {
                closePurchaseSuccess();
                // Redirect to home page for continued shopping
                window.location.href = 'index.html';
            };
        }
        
        // Close when clicking outside the success modal
        if (successModal) {
            successModal.onclick = function(event) {
                if (event.target === successModal) {
                    closePurchaseSuccess();
                }
            }
        }
    }
}

function displayCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart_items');
    const totalAmountElement = document.getElementById('totalAmount');
    
    // Check if we're on the checkout page
    if (!cartItemsContainer || !totalAmountElement) return;
    
    // If cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        totalAmountElement.textContent = '0.00';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    // Loop through each cart item
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Create HTML for each item
        const cartItemHTML = `
            <div class="checkout-item">
                <img src="${item.image}" alt="${item.title}" class="checkout-item-image">
                <div class="checkout-item-details">
                    <div class="checkout-item-title">${item.title}</div>
                    <div class="checkout-item-size">Size: ${item.size || 'Not specified'}</div>
                    <div class="checkout-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                    <div class="checkout-item-total">Total: $${itemTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
        
        cartItemsContainer.innerHTML += cartItemHTML;
    });
    
    // Update total amount
    totalAmountElement.textContent = total.toFixed(2);
}