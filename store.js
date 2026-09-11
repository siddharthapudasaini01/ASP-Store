// store.js

// 1. DATA ENGINE: Dynamic Generation of 1,000+ Products
const categories = ['Electronics', 'Home & Kitchen', 'Fashion', 'Fitness', 'Accessories'];
const totalProductCount = 1050;

const products = Array.from({ length: totalProductCount }, (_, i) => {
  const id = i + 1;
  const category = categories[i % categories.length];
  return {
    id: id,
    name: `${category} Premium Item #${id}`,
    price: parseFloat((10 + (i * 3.7) % 300).toFixed(2)),
    image: `https://picsum.photos/seed/${id}/300/300`,
    category: category,
    description: `High-quality ${category.toLowerCase()} item #${id} designed for maximum utility, durability, and modern aesthetics.`,
    qualities: [
      'Durable, high-grade materials',
      '1-Year Comprehensive Warranty',
      'Eco-friendly packaging',
      'Free Express Shipping Eligible'
    ]
  };
});

// State variables
let currentCategory = 'All';
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 24;

// 2. STATE MANAGEMENT & LOCAL STORAGE
function getCart() {
  return JSON.parse(localStorage.getItem('mystore_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('mystore_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = totalCount;
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart(cart);
  alert('Item added to cart!');
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function updateQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
  }
  saveCart(cart);
  renderCartPage();
}

// 3. AUTHENTICATION MANAGEMENT
function checkAuthState() {
  const user = JSON.parse(localStorage.getItem('mystore_user'));
  const navAccount = document.getElementById('nav-account');
  const loginSection = document.getElementById('login-section');
  const profileSection = document.getElementById('profile-section');

  if (user) {
    if (navAccount) navAccount.textContent = `Hello, ${user.email.split('@')[0]}`;
    if (loginSection) loginSection.style.display = 'none';
    if (profileSection) {
      profileSection.style.display = 'block';
      const emailDisplay = document.getElementById('user-email-display');
      if (emailDisplay) emailDisplay.textContent = user.email;
    }
  } else {
    if (navAccount) navAccount.textContent = 'Account & Login';
    if (loginSection) loginSection.style.display = 'block';
    if (profileSection) profileSection.style.display = 'none';
  }
}

// 4. FILTERING & PAGINATION ENGINE
function getFilteredProducts() {
  return products.filter(product => {
    const matchesCategory = (currentCategory === 'All') || (product.category === currentCategory);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function renderCatalog() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = getFilteredProducts();
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  
  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageProducts = filtered.slice(startIndex, startIndex + itemsPerPage);

  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    resultsCount.textContent = `Showing ${filtered.length} product(s) ${currentCategory !== 'All' ? 'in ' + currentCategory : ''}`;
  }

  if (pageProducts.length === 0) {
    grid.innerHTML = '<p class="no-products">No products found matching your criteria.</p>';
    renderPagination(0);
    return;
  }

  grid.innerHTML = pageProducts.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div>
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="price">$${product.price.toFixed(2)}</p>
      </div>
      <div class="actions">
        <a href="product.html?id=${product.id}" class="btn btn-secondary">View Details</a>
        <button onclick="addToCart(${product.id})" class="btn btn-primary">Add to Cart</button>
      </div>
    </div>
  `).join('');

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;

  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let html = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">&laquo; Prev</button>`;
  
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next &raquo;</button>`;

  paginationContainer.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  renderCatalog();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleSearch() {
  const input = document.getElementById('search-input');
  if (input) {
    searchQuery = input.value.trim();
    currentPage = 1;
    renderCatalog();
  }
}

// 5. PAGE RENDERERS
function renderProductDetail() {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);

  if (!product) {
    container.innerHTML = '<p>Product not found.</p>';
    return;
  }

  container.innerHTML = `
    <div>
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div>
      <span class="category-tag">${product.category}</span>
      <h1 style="margin-top: 5px;">${product.name}</h1>
      <p class="price" style="font-size: 24px; color: #B12704; margin: 10px 0;">$${product.price.toFixed(2)}</p>
      <p>${product.description}</p>

      <div class="qualities-box">
        <h3>Key Features & Qualities</h3>
        <ul>
          ${product.qualities.map(q => `<li>${q}</li>`).join('')}
        </ul>
      </div>

      <button onclick="addToCart(${product.id})" class="btn btn-primary" style="padding: 12px 24px;">Add to Cart</button>
    </div>
  `;
}

function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('cart-subtotal').textContent = '$0.00';
    document.getElementById('cart-total').textContent = '$0.00';
    return;
  }

  let subtotal = 0;
  container.innerHTML = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return '';
    
    const itemTotal = product.price * cartItem.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-row">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <p>$${product.price.toFixed(2)} each</p>
        </div>
        <div class="cart-controls">
          <button class="btn btn-secondary btn-sm" onclick="updateQuantity(${product.id}, -1)">-</button>
          <span>${cartItem.quantity}</span>
          <button class="btn btn-secondary btn-sm" onclick="updateQuantity(${product.id}, 1)">+</button>
        </div>
        <div>
          <strong>$${itemTotal.toFixed(2)}</strong>
        </div>
        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${product.id})">Remove</button>
      </div>
    `;
  }).join('');

  document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${subtotal.toFixed(2)}`;
}

// Dynamic Checkout Renderer (Displays Products on Checkout Page)
function renderCheckoutPage() {
  const summaryContainer = document.getElementById('checkout-summary-items');
  if (!summaryContainer) return;

  const cart = getCart();
  if (cart.length === 0) {
    summaryContainer.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('checkout-subtotal').textContent = '$0.00';
    document.getElementById('checkout-total').textContent = '$0.00';
    return;
  }

  let subtotal = 0;
  summaryContainer.innerHTML = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return '';

    const itemTotal = product.price * cartItem.quantity;
    subtotal += itemTotal;

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
        <img src="${product.image}" alt="${product.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
        <div style="flex-grow: 1;">
          <p style="font-size: 13px; font-weight: bold; margin: 0;">${product.name}</p>
          <p style="font-size: 12px; color: #555; margin: 0;">Qty: ${cartItem.quantity} &times; $${product.price.toFixed(2)}</p>
        </div>
        <strong style="font-size: 14px;">$${itemTotal.toFixed(2)}</strong>
      </div>
    `;
  }).join('');

  document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('checkout-total').textContent = `$${subtotal.toFixed(2)}`;

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Order successfully placed! Thank you for your purchase.');
      localStorage.removeItem('mystore_cart');
      window.location.href = 'orders.html';
    });
  }
}

// 6. INITIALIZATION & EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  checkAuthState();
  renderCatalog();
  renderProductDetail();
  renderCartPage();
  renderCheckoutPage();

  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  if (searchBtn) searchBtn.addEventListener('click', handleSearch);
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      handleSearch();
    });
  }

  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      categoryLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      currentCategory = link.getAttribute('data-category');
      currentPage = 1;
      renderCatalog();
    });
  });

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      localStorage.setItem('mystore_user', JSON.stringify({ email: email }));
      checkAuthState();
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('mystore_user');
      checkAuthState();
    });
  }
});