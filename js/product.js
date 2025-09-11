const productContainer = document.querySelector(".container-products");
const searchParameters = new URLSearchParams(window.location.search);
const productId = searchParameters.get("id");

async function fetchProduct() {
    try {
        displayLoading(productContainer);

        const product = await fetchApi(`https://v2.api.noroff.dev/rainy-days/${productId}`);
        createProductDetail(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        displayError(productContainer, "sorry we couldnt load this product");
    }
}

function createProductDetail(product) {

    clearContainer(productContainer);

     // Create product detail container
  const productDetail = document.createElement("div");
  productDetail.className = "product-detail";

  // Create product image
  const productImage = document.createElement("img");
  productImage.src = product.image.url;
  productImage.alt = product.image.alt;
  productImage.className = "product-image";

  // Create product info container
  const productInfo = document.createElement("div");
  productInfo.className = "product-info";

  // Add title
  const title = document.createElement("h1");
  title.className = "product-title";
  title.textContent = product.title;
  productInfo.appendChild(title);


  // Add description
  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent = product.description;
  productInfo.appendChild(description);

  // Add pricing using utility function
  const pricingDiv = document.createElement("div");
  pricingDiv.className = "product-pricing";
  createDetailedPricing(product, pricingDiv);
  productInfo.appendChild(pricingDiv);

  // Add sizes
  const sizesContainer = document.createElement("div");
  sizesContainer.className = "product-sizes";

  const sizesHeading = document.createElement("h3");
  sizesHeading.textContent = "Available Sizes";
  sizesContainer.appendChild(sizesHeading);

  // Create size options using utility function
  const sizeOptions = createSizeOptions(product.sizes);
  sizesContainer.appendChild(sizeOptions);
  productInfo.appendChild(sizesContainer);

  // Add action buttons
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "product-actions";

  const addToCartBtn = document.createElement("button");
  addToCartBtn.className = "add-to-cart";

  const cartText = document.createTextNode(" Add to Cart");
  addToCartBtn.appendChild(cartText);

  addToCartBtn.addEventListener("click", function () {
    alert("Product added to cart!");
  });

  // Add button to actions container
  actionsDiv.appendChild(addToCartBtn);

  // Add image and info to product detail container
  productDetail.appendChild(productImage);
  productDetail.appendChild(productInfo);
  
  // Add the actions div (with button) to the bottom of product detail
  productDetail.appendChild(actionsDiv);

  // Add the complete product detail to the main container
  productContainer.appendChild(productDetail);
}