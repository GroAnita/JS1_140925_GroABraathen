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
    console.log("i can see this function running")
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

   const productDetails = document.createElement("div");
   productDetails.className = "product-details";

   const title = document.createElement("h1");
   title.textContent = product.title;
   productDetails.appendChild(title);

   const price = document.createElement("div");
   price.className = "product-price";
   price.textContent = product.price ? `$${product.price}` : '';
   productDetails.appendChild(price);
   
   const descriptionHeading = document.createElement("h3");
   descriptionHeading.textContent = "Description";
   productDetails.appendChild(descriptionHeading);

   const description = document.createElement("p");
   description.textContent = product.description;
   productDetails.appendChild(description);

   const specsHeading = document.createElement("h3");
   specsHeading.textContent = "Specifications";
   productDetails.appendChild(specsHeading);

   const specs = document.createElement("div");
   specs.id = "productSpecs";
   if (product.specifications) {
       for (const [key, value] of Object.entries(product.specifications)) {
           const specItem = document.createElement("p");
           specItem.textContent = `${key}: ${value}`;
           specs.appendChild(specItem);
       }
   const productOptions = document.createElement("div");
   productOptions.className = "product-options";

   const sizeSelector = document.createElement("div");
   sizeSelector.className = "size-selector";
   if (product.sizes && product.sizes.length > 0) {
       const sizeLabel = document.createElement("label");
       sizeLabel.textContent = "Size:";
       sizeSelector.appendChild(sizeLabel);

       const sizeSelect = document.createElement("select");
       sizeSelect.id = "sizeSelect";
       sizeSelect.innerHTML = '<option value="">Select Size</option>';
       product.sizes.forEach((size) => {
           const option = document.createElement("option");
           option.value = size;
           option.textContent = size;
           sizeSelect.appendChild(option);
       });
       sizeSelector.appendChild(sizeSelect);
       productOptions.appendChild(sizeSelector);
   }

   const colorSelector = document.createElement("div");
   colorSelector.className = "color-selector";

   const colorLabel = document.createElement("label");
   colorLabel.textContent = "Color:";
   colorSelector.appendChild(colorLabel);

   const colorSelect = document.createElement("select");
   colorSelect.id = "colorSelect";
   colorSelect.innerHTML = '<option value="">Select Color</option>';
   if (product.colors && product.colors.length > 0) {
       product.colors.forEach((color) => {
           const option = document.createElement("option");
           option.value = color;
           option.textContent = color;
           colorSelect.appendChild(option);
       });
   }
   colorSelector.appendChild(colorSelect);
   productOptions.appendChild(colorSelector);

   const quantitySelector = document.createElement("div");
   quantitySelector.className = "quantity-selector";

   const quantityLabel = document.createElement("label");
   quantityLabel.textContent = "Quantity:";
   quantitySelector.appendChild(quantityLabel);

   const quantityInput = document.createElement("input");
   quantityInput.type = "number";
   quantityInput.id = "quantityInput";
   quantityInput.value = 1;
   quantityInput.min = 1;
   quantityInput.max = 10;
   quantitySelector.appendChild(quantityInput);
   productOptions.appendChild(quantitySelector);

   const productActions = document.createElement("div");
   productActions.className = "product-actions";

   const addToCartButton = document.createElement("button");
   addToCartButton.id = "addToCartBtn";
   addToCartButton.textContent = "Add to Cart";
   productActions.appendChild(addToCartButton);

   const buyNowButton = document.createElement("button");
   buyNowButton.id = "buyNowBtn";
   buyNowButton.textContent = "Buy Now";
   productActions.appendChild(buyNowButton);

   productDetails.appendChild(productOptions);
   productDetails.appendChild(productActions);
   productContainer.appendChild(productDetails);

   updateSizeOptions(product);
   updateProductSpecs(product);
   initializeAddToCart(product);

}
    productContainer.appendChild(specs);
    productContainer.appendChild(productDetails);   
}

fetchProduct();

async function fetchProduct() {
    try {
        displayLoading(productContainer);
        const product = await fetchApi(`https://v2.api.noroff.dev/rainy-days/${productId}`);
        createProductDetail(product);
    } catch (error) {
        displayError(productContainer, "sorry we couldnt load this product");
    }
}


