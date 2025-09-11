


function clearContainer(container) {
  if (!container) {
    console.warn("Cannot clear container - element not found");
    return;
  }
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

/**
 * Displays an error message in a container
 * @param {HTMLElement} container - The container to display the error in
 * @param {string} message - The error message to display
 */
function displayError(container, message) {
  clearContainer(container);
  const errorElement = document.createElement("p");
  errorElement.className = "error-message";
  errorElement.textContent = message;
  container.appendChild(errorElement);
}

/**
 * Displays a "no results" message in a container
 * @param {HTMLElement} container - The container to display the message in
 * @param {string} message - The message to display (defaults to "No products match your filter criteria")
 */
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

/**
 * Creates price elements based on product sale status
 * @param {Object} product - The product object
 * @param {HTMLElement} contentContainer - The container to append price elements to
 * @returns {HTMLElement} - The price container element
 */
function createPriceElements(product, contentContainer) {
  if (product.onSale) {
    // Create price container to hold both prices and badge
    const priceContainer = document.createElement("div");
    priceContainer.className = "price-container";

    // Discounted price
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

    // Add elements to price container in order: price, badge, original price
    priceContainer.appendChild(price);
    priceContainer.appendChild(saleBadge);
    priceContainer.appendChild(originalPrice);
    
    contentContainer.appendChild(priceContainer);

    return priceContainer;
  } else {
    // Regular price display - also use price container for consistency
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

/**
 * Creates a loading indicator
 * @param {HTMLElement} container - The container to display the loading indicator in
 */
function displayLoading(container) {
  clearContainer(container);
  const loadingElem = document.createElement("div");
  loadingElem.className = "loading";
  loadingElem.textContent = "Loading...";
  container.appendChild(loadingElem);
}

/**
 * Creates size selection options
 * @param {Array} sizes - Array of available sizes
 * @returns {HTMLElement} - The size options container
 */
function createSizeOptions(sizes) {
  const sizeOptions = document.createElement("div");
  sizeOptions.className = "size-options";

  sizes.forEach((size) => {
    const sizeOption = document.createElement("div");
    sizeOption.className = "size-option";
    sizeOption.textContent = size;
    sizeOption.addEventListener("click", function () {
      // Remove selection from all sizes
      document.querySelectorAll(".size-option").forEach((el) => {
        el.style.borderColor = "#e0e0e0";
        el.style.backgroundColor = "";
      });
      // Highlight selected size
      this.style.borderColor = "#2ecc71";
      this.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
    });
    sizeOptions.appendChild(sizeOption);
  });

  return sizeOptions;
}

/**
 * Creates a size dropdown selection
 * @param {Array} sizes - Array of available sizes
 * @returns {HTMLElement} - The size dropdown container
 */
function createSizeDropdown(sizes) {
  const sizeContainer = document.createElement("div");
  sizeContainer.className = "size-dropdown-container";

  const sizeLabel = document.createElement("label");
  sizeLabel.textContent = "Size:";
  sizeLabel.className = "size-label";

  const sizeSelect = document.createElement("select");
  sizeSelect.className = "size-dropdown";
  
  // Add default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Size";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  sizeSelect.appendChild(defaultOption);

  // Add size options
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

/**
 * Handles API fetch and provides error handling
 * @param {string} url - The API URL to fetch from
 * @returns {Promise} - Resolves with data or rejects with error
 */
async function fetchApi(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Filters products based on category
 * @param {Array} products - Array of all products
 * @param {string} category - Category to filter by (empty string shows all)
 * @returns {Array} - Filtered products array
 */
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

/**
 * Initializes the category filter functionality
 * @param {Array} allProducts - All products array
 * @param {Function} displayCallback - Function to call when filter changes
 */
function initializeCategoryFilter(allProducts, displayCallback) {
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (!categoryFilter) {
    console.warn('Category filter element not found');
    return;
  }
  
  categoryFilter.addEventListener('change', function() {
    const selectedCategory = this.value;
    console.log('Filter changed to:', selectedCategory);
    
    const filteredProducts = filterProductsByCategory(allProducts, selectedCategory);
    console.log('Filtered products:', filteredProducts.length);
    
    // Call the display function with filtered products
    if (typeof displayCallback === 'function') {
      displayCallback(filteredProducts);
    }
  });
}
