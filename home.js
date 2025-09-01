const API_URL = "https://v2.api.noroff.dev/rainy-days";

async function fetchProducts() {
    if (!API_URL) {
        console.error("API_URL is not defined");
        return;
    }
    try {
        const respons = await fetch (API_URL);
        const data = await respons.json();
        console.log(data);
        const produkter = data.data || data;
        if (produkter && produkter.length > 0) {
            // Display up to 3 products (one for each product box)
            for (let i = 0; i < Math.min(3, produkter.length); i++) {
                displayProduct(produkter[i], i);
            }
        }
    }
    catch (error) {
        console.error("klarer ikke hente produkter:", error);
    }
}
function displayProduct(product, index) {
    // Find the specific product box (0, 1, or 2)
    const productBoxes = document.querySelectorAll('.product_box');
    const currentBox = productBoxes[index];
    
    if (!currentBox) return; // No box found for this index
    
    // Find elements within this specific product box
    const titleElement = currentBox.querySelector('.product_info h3');
    const descriptionElement = currentBox.querySelector('.product_info p:first-of-type');
    const priceElement = currentBox.querySelector('.product_info p:last-of-type');
    const imageElement = currentBox.querySelector('.product_img img');

    if (titleElement) titleElement.textContent = product.title;
    if (descriptionElement) descriptionElement.textContent = product.description;
    if (priceElement) priceElement.textContent = `Price: $${product.price}`;
    if (imageElement && product.image) {
        imageElement.src = product.image.url;
        imageElement.alt = product.image.alt || product.title;
    }
}

fetchProducts();