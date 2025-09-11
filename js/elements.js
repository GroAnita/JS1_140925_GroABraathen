


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
    // Create price container to hold both prices
    const priceContainer = document.createElement("div");
    priceContainer.className = "price-container";

    // Discounted price
    const price = document.createElement("p");
    price.textContent = `$${product.discountedPrice}`;
    price.className = "card-price sale-price";

    // Original price (strikethrough)
    const originalPrice = document.createElement("span");
    originalPrice.className = "card-original-price";
    originalPrice.textContent = `$${product.price}`;

    // Sale badge
    const saleBadge = document.createElement("span");
    saleBadge.className = "card-sale-badge";
    saleBadge.textContent = "Sale";

    priceContainer.appendChild(price);
    priceContainer.appendChild(originalPrice);
    contentContainer.appendChild(priceContainer);
    contentContainer.appendChild(saleBadge);

    return priceContainer;
  } else {
    // Regular price display
    const price = document.createElement("p");
    price.className = "card-price";
    price.textContent = `$${product.price}`;
    contentContainer.appendChild(price);

    return price;
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
