const productContainer = document.querySelector(".product-detail-container");
const searchParameters = new URLSearchParams(window.location.search);
const productId = searchParameters.get("id");

async function fetchProduct() {
    try {
        displayLoading(productContainer);
        const product = await fetchApi(`https://v2.api.noroff.dev/rainy-days/${productId}`);
        createProductDetail(product);
    } catch (error) {
        displayError(productContainer, "sorry we couldnt load this product");
    }
}

function createProductDetail(product) {

    clearContainer(productContainer);

 const productImages = document.createElement("div");
   productImages.className = "product-images";
   product.images.forEach((image) => {
       const img = document.createElement("img");
       img.src = image.url;
       img.alt = image.alt;
       productImages.appendChild(img);
   });
   productContainer.appendChild(productImages);
}

