let productsGrid; // The grid where products will be displayed
let allProducts = [];

// Wait for DOM to be ready before selecting elements and starting
document.addEventListener('DOMContentLoaded', function() {
    productsGrid = document.querySelector(".products-grid");
    if (productsGrid) {
        fetchProducts(); // Only fetch if grid exists
    } else {
        console.error("Products grid not found in HTML");
    }
});

async function fetchProducts() {
    try {
        const response = await fetch("https://v2.api.noroff.dev/rainy-days");
        const apiResponse = await response.json();
        allProducts = apiResponse.data; // Extract the data array from the response
        displayProducts(allProducts);
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

        const productPrice = document.createElement("p");
        productPrice.textContent = `Price: $${product.price}`;

        const addToCartButton = document.createElement("button");
        addToCartButton.className = "add-to-cart";
        addToCartButton.dataset.id = product.id;
        addToCartButton.textContent = "Add to Cart";

        const link = document.createElement("a");
        link.className = "product-link";
        link.href = `product.html?id=${product.id}`;

        content.appendChild(productTitle);
        content.appendChild(productPrice);
        content.appendChild(addToCartButton);

        createPriceElements(product, content);

        productBox.appendChild(productImage);
        productBox.appendChild(content);
        link.appendChild(productBox);
        productsGrid.appendChild(link);
    });
}