
function clearContainer(container) {
  if (!container) {
    return;
  }
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function displayError(container, message) {
  clearContainer(container);
  const errorElement = document.createElement("p");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  container.appendChild(errorElement);
}

function displayNoResults(
  container,
  message = "No products match your filter criteria."
) {
  clearContainer(container);
  const noResultsDiv = document.createElement("div");
  noResultsDiv.className = "no-results";
  noResultsDiv.textContent = message;
  container.appendChild(noResultsDiv);
}

function createPriceElements(product, contentContainer) {
  if (product.onSale) {
   
    const priceContainer = document.createElement("div");
    priceContainer.className = "price-container";

    // Discount price
    const price = document.createElement("p");
    price.textContent = `$${product.discountedPrice}`;
    price.className = "card-price sale-price";

    // Sale badge (in the middle)
    const saleBadge = document.createElement("div");
    saleBadge.className = "card-sale-badge";
    saleBadge.textContent = "Sale";

    // Original price (strikethrough)
    const originalPrice = document.createElement("span");
    originalPrice.className = "card-original-price";
    originalPrice.textContent = `$${product.price}`;

    // Adding elements to price container in order: price, badge, original price
    priceContainer.appendChild(price);
    priceContainer.appendChild(saleBadge);
    priceContainer.appendChild(originalPrice);
    
    contentContainer.appendChild(priceContainer);

    return priceContainer;
  } else {
    
    const priceContainer = document.createElement("div");
    priceContainer.className = "price-container";
    
    const price = document.createElement("p");
    price.className = "card-price";
    price.textContent = `$${product.price}`;
    
    priceContainer.appendChild(price);
    contentContainer.appendChild(priceContainer);

    return priceContainer;
  }
}


function displayLoading(container) {
  clearContainer(container);
  const loadingElem = document.createElement("div");
  loadingElem.className = "loading";
  loadingElem.textContent = "Loading...";
  container.appendChild(loadingElem);
}


function createSizeDropdown(sizes) {
  const sizeContainer = document.createElement("div");
  sizeContainer.className = "size-dropdown-container";

  const sizeLabel = document.createElement("label");
  sizeLabel.textContent = "Size:";
  sizeLabel.className = "size-label";

  const sizeSelect = document.createElement("select");
  sizeSelect.className = "size-dropdown";
  
  // Adding default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Size";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  sizeSelect.appendChild(defaultOption);

  // Adding size options
  if (sizes && sizes.length > 0) {
    sizes.forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });
  } else {
    // If no sizes available, add "One Size" option
    const oneSizeOption = document.createElement("option");
    oneSizeOption.value = "one-size";
    oneSizeOption.textContent = "One Size";
    sizeSelect.appendChild(oneSizeOption);
  }

  sizeContainer.appendChild(sizeLabel);
  sizeContainer.appendChild(sizeSelect);

  return sizeContainer;
}


async function fetchApi(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}


function filterProductsByCategory(products, category) {
  if (!products || products.length === 0) return [];

  let filteredProducts = products;

  if (category && category !== 'all' && category !== '') {
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

  return filteredProducts;
}


function initializeCategoryFilter(allProducts, displayCallback) {
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (!categoryFilter) {
    return;
  }
  
  categoryFilter.addEventListener('change', function() {
    const selectedCategory = this.value;
   
    
    const filteredProducts = filterProductsByCategory(allProducts, selectedCategory);
   
    
    // Call the display function with filtered products
    if (typeof displayCallback === 'function') {
      displayCallback(filteredProducts);
    }
  });
}
