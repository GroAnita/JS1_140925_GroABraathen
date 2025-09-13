const addToCartBtn = document.createElement("button");
  addToCartBtn.className = "add-to-cart";
 // adds text to the add to cart button, 
  addToCartBtn.textContent = "Add to Cart";
  const buyNowBtn = document.createElement("button");
  buyNowBtn.className = "buy-now-Btn";
  buyNowBtn.textContent = "Buy Now";
 //when the user clicks the button, an alert pops up
  addToCartBtn.addEventListener("click", function () {
    alert("Product added to cart!");
  });
  buyNowBtn.addEventListener("click", function () {
    alert("Proceeding to checkout!");
  });


  actionsDiv.appendChild(addToCartBtn);
  actionsDiv.appendChild(buyNowBtn);



   const sizesHeading = document.createElement("h3");
  sizesHeading.textContent = "Available Sizes";
  sizesContainer.appendChild(sizesHeading);


    // Add sizes
  const sizesContainer = document.createElement("div");
  sizesContainer.className = "product-sizes";

  // Create size options using utility function
  const sizeOptions = createSizeOptions(product.sizes);
  sizesContainer.appendChild(sizeOptions);
  productInfo.appendChild(sizesContainer);

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "product-actions";



    // Creates product detail container
  const productDetail = document.createElement("div");
  productDetail.className = "product-detail";

  // Creates product image
  const productImage = document.createElement("img");
  productImage.src = product.image.url;
  productImage.alt = product.image.alt;
  productImage.className = "product-image";

  // Creates product info container
  const productInfo = document.createElement("div");
  productInfo.className = "product-info";

  // Adding a title
  const title = document.createElement("h1");
  title.className = "product-title";
  title.textContent = product.title;
  productInfo.appendChild(title);


  // Adding a description
  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent = product.description;
  productInfo.appendChild(description);

  // Add pricing using something called a utility function
  const pricingDiv = document.createElement("div");
  pricingDiv.className = "product-pricing";
  createDetailedPricing(product, pricingDiv);
  productInfo.appendChild(pricingDiv);

  // making a div to put buttons in
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "product-actions";


  // Add image and info to product detail container
  productDetail.appendChild(productImage);
  productDetail.appendChild(productInfo);
  
  // Add the actions div (with button) to the bottom of product detail
  productDetail.appendChild(actionsDiv);

  // Add the complete product detail to the main container
  productContainer.appendChild(productDetail);