document.addEventListener('DOMContentLoaded', () => {
    // Initialize data
    initData();
    loadCategories();
    loadProducts();
    checkLoginState();

    // Populate modal categories
    populateModalCategories();
});

let cartTotalItems = 0;
const productQuantities = { 999: 1 };
const cartItems = {};
let activeProducts = [];
let activeCategories = [];
let activeNeighborhoods = [];
let isAdmin = false;

function initData() {
    // Load products
    const stored = localStorage.getItem('ducervejaria_products');
    if (stored) {
        activeProducts = JSON.parse(stored);
    } else {
        activeProducts = [...products];
        localStorage.setItem('ducervejaria_products', JSON.stringify(activeProducts));
    }

    // Load categories
    const storedCats = localStorage.getItem('ducervejaria_categories');
    if (storedCats) {
        activeCategories = JSON.parse(storedCats);
    } else {
        if (typeof categories !== 'undefined') {
            activeCategories = [...categories];
        } else {
            activeCategories = [];
        }
        localStorage.setItem('ducervejaria_categories', JSON.stringify(activeCategories));
    }

    // Load neighborhoods
    const storedNeighbors = localStorage.getItem('ducervejaria_neighborhoods');
    if (storedNeighbors) {
        activeNeighborhoods = JSON.parse(storedNeighbors);
    } else {
        activeNeighborhoods = [];
    }

    // Load Admin Auth
    const storedAuth = localStorage.getItem('ducervejaria_admin_auth');
    if (!storedAuth) {
        localStorage.setItem('ducervejaria_admin_auth', JSON.stringify({ u: 'ducervejariaadmin', p: 'ducervejariaadmin' }));
    }
}

function checkLoginState() {
    const logged = localStorage.getItem('isAdmin') === 'true';
    isAdmin = logged;

    // We do not show any admin UI on the main site anymore.
    // Dashboard is handled separately.

    // Reload products just to ensure data is fresh, but no admin controls are rendered.
    loadProducts();
}

function openLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function login() {
    const u = document.getElementById('admin-user').value;
    const p = document.getElementById('admin-pass').value;
    const auth = JSON.parse(localStorage.getItem('ducervejaria_admin_auth') || '{"u":"ducervejariaadmin","p":"ducervejariaadmin"}');

    if (u === auth.u && p === auth.p) {
        alert('Login realizado com sucesso!');
        localStorage.setItem('isAdmin', 'true');
        closeModal('login-modal');

        // Open Dashboard in new tab
        window.open('dashboard.html', '_blank');

        // Also update current page state just in case
        checkLoginState();
    } else {
        alert('Dados incorretos!');
    }
}

function logout() {
    if (confirm('Deseja sair do modo admin?')) {
        localStorage.setItem('isAdmin', 'false');
        checkLoginState();
        window.location.reload();
    }
}

// Product Management
let currentImageBase64 = '';

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgPreview = document.getElementById('img-preview');
            const uploadText = document.getElementById('upload-text');
            if (imgPreview) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = 'block';
            }
            if (uploadText) uploadText.style.display = 'none';
            // Update hidden input used by save
            document.getElementById('prod-img').value = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function openProductModal(mode, productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');

    // Clear fields
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-old-price').value = '';
    document.getElementById('prod-img').value = '';
    document.getElementById('prod-category').value = '';

    const fileInput = document.getElementById('prod-img-file');
    if (fileInput) fileInput.value = '';

    // Reset Preview
    const imgPreview = document.getElementById('img-preview');
    const uploadText = document.getElementById('upload-text');
    if (imgPreview) {
        imgPreview.style.display = 'none';
        imgPreview.src = '';
    }
    if (uploadText) uploadText.style.display = 'block';

    if (mode === 'edit' && productId) {
        title.innerText = 'Editar Produto';
        const p = activeProducts.find(x => x.id === productId);
        if (p) {
            document.getElementById('prod-id').value = p.id;
            document.getElementById('prod-name').value = p.name;
            document.getElementById('prod-price').value = p.price;
            document.getElementById('prod-old-price').value = p.originalPrice;
            document.getElementById('prod-category').value = p.category;

            // Handle Image - preload preview if existing image
            if (p.image) {
                document.getElementById('prod-img').value = p.image;
                if (imgPreview) {
                    imgPreview.src = p.image;
                    imgPreview.style.display = 'block';
                }
                if (uploadText) uploadText.style.display = 'none';
            }
        }
    } else {
        title.innerText = 'Adicionar Produto';
    }

    modal.classList.add('active');
}

function saveProduct() {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const originalPrice = parseFloat(document.getElementById('prod-old-price').value);
    const image = document.getElementById('prod-img').value || 'https://via.placeholder.com/200x200';
    const category = document.getElementById('prod-category').value;

    if (!name || isNaN(price) || !category) {
        alert('Preencha os campos obrigatórios (Nome, Preço, Categoria)');
        return;
    }

    if (id) {
        // Edit
        const idx = activeProducts.findIndex(p => p.id == id);
        if (idx > -1) {
            activeProducts[idx] = { ...activeProducts[idx], name, price, originalPrice, image, category };
        }
    } else {
        // Add
        const newId = Date.now(); // Simple ID generation
        const newProd = {
            id: newId,
            name,
            price,
            originalPrice,
            image,
            category,
            rating: 5.0
        };
        activeProducts.push(newProd);
    }

    // Save
    localStorage.setItem('ducervejaria_products', JSON.stringify(activeProducts));
    closeModal('product-modal');
    loadProducts();
    alert('Produto salvo com sucesso!');
}

function deleteProduct(productId) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        activeProducts = activeProducts.filter(p => p.id !== productId);
        localStorage.setItem('ducervejaria_products', JSON.stringify(activeProducts));
        loadProducts();
    }
}

function populateModalCategories() {
    const sel = document.getElementById('prod-category');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione a Categoria</option>';

    const sorted = [...activeCategories].sort();
    sorted.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        sel.appendChild(opt);
    });
}


function loadCategories() {
    const categoriesDropdown = document.getElementById('categories-dropdown');
    const footerCategories = document.getElementById('footer-categories');
    if (!categoriesDropdown || !footerCategories) return;

    categoriesDropdown.innerHTML = '';
    footerCategories.innerHTML = '';

    const sortedCategories = [...activeCategories].sort();

    sortedCategories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="javascript:void(0)" onclick="filterCategory('${cat}')">${cat}</a>`;
        categoriesDropdown.appendChild(li);

        if (footerCategories.children.length < 6) {
            const footerLi = document.createElement('li');
            footerLi.innerHTML = `<a href="javascript:void(0)" onclick="filterCategory('${cat}')">${cat}</a>`;
            footerCategories.appendChild(footerLi);
        }
    });

    const viewAllLi = document.createElement('li');
    viewAllLi.innerHTML = `<a href="javascript:void(0)" onclick="filterCategory('Todas')" style="color: var(--primary-color); font-weight: bold;">Ver todas as categorias</a>`;
    footerCategories.appendChild(viewAllLi);
}

let isGroupedView = false;

function loadProducts() {
    isGroupedView = false;
    const btn = document.getElementById('toggle-view-btn');
    if (btn) btn.innerHTML = 'Ver Todos <i class="fa-solid fa-arrow-right"></i>';

    // Update section "Ofertas do Dia"
    const diaContainer = document.querySelector('#ofertas-dia .products-grid');
    if (diaContainer) {
        diaContainer.innerHTML = '';
        const diaProducts = activeProducts.filter(p => p.category === 'Ofertas do Dia');

        diaProducts.forEach(product => {
            diaContainer.appendChild(createProductCard(product, true));
        });

        if (diaProducts.length === 0) {
            document.getElementById('ofertas-dia').style.display = 'none';
        }
    }

    // Update section "Ofertas Imperdíveis"
    const imperdiveisContainer = document.querySelector('#ofertas-imperdiveis .products-grid');
    if (imperdiveisContainer) {
        imperdiveisContainer.innerHTML = '';
        const imperdiveisProducts = activeProducts.filter(p => p.category === 'Ofertas Imperdíveis');

        imperdiveisProducts.forEach(product => {
            imperdiveisContainer.appendChild(createProductCard(product, true));
        });

        if (imperdiveisProducts.length === 0) {
            document.getElementById('ofertas-imperdiveis').style.display = 'none';
        }
    }

    // Restore Title
    const title = document.getElementById('main-section-title');
    if (title) title.style.display = 'block';

    // Clean main list: don't show specific offers here if they are already above
    const mainProducts = activeProducts.filter(p => p.category !== 'Ofertas Imperdíveis' && p.category !== 'Ofertas do Dia');

    // Initial load of all products with sorting
    const sorted = [...mainProducts].sort((a, b) => {
        const aBest = a.isBestSeller === true || a.category === 'Mais Vendidos';
        const bBest = b.isBestSeller === true || b.category === 'Mais Vendidos';
        if (aBest && !bBest) return -1;
        if (!aBest && bBest) return 1;
        return 0;
    });
    displayProducts(sorted);
}

function toggleMainView() {
    if (isGroupedView) {
        loadProducts();
    } else {
        displayProductsGrouped();
    }
}

function toggleCategory(groupElement) {
    const isExpanded = groupElement.classList.contains('active');
    // Close all others (optional, but cleaner)
    document.querySelectorAll('.category-group').forEach(group => group.classList.remove('active'));

    if (!isExpanded) {
        groupElement.classList.add('active');
    }
}

function filterCategory(categoryName) {
    // If we are filtering, we should ensure we are not in grouped view
    isGroupedView = false;
    const btn = document.getElementById('toggle-view-btn');
    if (btn) btn.innerHTML = 'Ver Todos <i class="fa-solid fa-arrow-right"></i>';

    const title = document.getElementById('main-section-title');
    if (title) title.style.display = 'block';

    let filtered;
    if (categoryName === 'Todas') {
        filtered = activeProducts;
    } else {
        filtered = activeProducts.filter(p => p.category === categoryName);
    }

    // Sort logic (Mais Vendidos first) applies to filtered list too
    filtered.sort((a, b) => {
        const aBest = a.isBestSeller === true || a.category === 'Mais Vendidos';
        const bBest = b.isBestSeller === true || b.category === 'Mais Vendidos';
        if (aBest && !bBest) return -1;
        if (!aBest && bBest) return 1;
        return 0;
    });

    displayProducts(filtered);

    // Optional: Scroll to products
    document.getElementById('products-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function searchProducts(event) {
    // Search on Enter key
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();

    // Reset view mode
    isGroupedView = false;
    const btn = document.getElementById('toggle-view-btn');
    if (btn) btn.innerHTML = 'Ver Todos <i class="fa-solid fa-arrow-right"></i>';

    const title = document.getElementById('main-section-title');
    if (title) {
        if (searchTerm) {
            title.textContent = `Resultados para: "${searchInput.value.trim()}"`;
            title.style.display = 'block';
        } else {
            title.textContent = 'Mais Vendidos';
            title.style.display = 'block';
        }
    }

    // Filter products excluding offer categories from main display
    const mainProducts = activeProducts.filter(p => p.category !== 'Ofertas Imperdíveis' && p.category !== 'Ofertas do Dia');

    let filtered;
    if (!searchTerm) {
        // If empty, show all products sorted
        filtered = [...mainProducts].sort((a, b) => {
            const aBest = a.isBestSeller === true || a.category === 'Mais Vendidos';
            const bBest = b.isBestSeller === true || b.category === 'Mais Vendidos';
            if (aBest && !bBest) return -1;
            if (!aBest && bBest) return 1;
            return 0;
        });
    } else {
        // Search in name and category
        filtered = mainProducts.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(searchTerm);
            const categoryMatch = p.category.toLowerCase().includes(searchTerm);
            return nameMatch || categoryMatch;
        });
    }

    displayProducts(filtered);

    // Scroll to results
    const container = document.getElementById('products-container');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function displayProducts(productList) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if (productList.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    productList.forEach(product => {
        container.appendChild(createProductCard(product));
    });
}

function displayProductsGrouped() {
    isGroupedView = true;
    const btn = document.getElementById('toggle-view-btn');
    if (btn) btn.innerHTML = 'Voltar aos Mais Vendidos <i class="fa-solid fa-arrow-left"></i>';

    // Hide Main Title
    const title = document.getElementById('main-section-title');
    if (title) title.style.display = 'none';

    const container = document.getElementById('products-container');
    container.innerHTML = '';

    // Get unique categories except "Mais Vendidos"
    const usedCategories = [...new Set(activeProducts.map(p => p.category))]
        .filter(cat => cat !== 'Mais Vendidos')
        .sort();

    usedCategories.forEach(cat => {
        const catProducts = activeProducts.filter(p => p.category === cat);
        if (catProducts.length > 0) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'category-group';

            const header = document.createElement('div');
            header.className = 'category-header-toggle';
            header.innerHTML = `<h3>${cat}</h3> <i class="fa-solid fa-chevron-down"></i>`;
            header.onclick = () => toggleCategory(groupDiv);

            const productScroll = document.createElement('div');
            productScroll.className = 'category-product-scroll';

            catProducts.forEach(product => {
                productScroll.appendChild(createProductCard(product));
            });

            groupDiv.appendChild(header);
            groupDiv.appendChild(productScroll);
            container.appendChild(groupDiv);
        }
    });

    // Scroll to products
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createProductCard(product, isOffer = false) {
    productQuantities[product.id] = 1;

    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const badgeColor = isOffer ? '#d32f2f' : 'var(--primary-color)';
    const btnColor = isOffer ? '#d32f2f' : 'var(--primary-color)';
    const priceColor = isOffer ? '#d32f2f' : 'var(--primary-color)';

    const discountBadge = discount > 0 ? `<div class="card-badge" style="background-color: ${badgeColor};">-${discount}%</div>` : '';
    const oldPriceHtml = product.originalPrice ? `<div class="price-old">R$ ${formatPrice(product.originalPrice)}</div>` : '';

    const card = document.createElement('div');
    card.classList.add('product-card');

    card.innerHTML = `
        ${discountBadge}
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="rating">
            ${getStars(product.rating)}
            <span>(${product.rating})</span>
        </div>
        <div class="price-box">
            ${oldPriceHtml}
            <div class="price-new" style="color: ${priceColor};">R$ ${formatPrice(product.price)}</div>
        </div>
        
        <div class="quantity-controls">
            <button onclick="changeQuantity(${product.id}, -1)">-</button>
            <span id="qty-${product.id}">1</span>
            <button onclick="changeQuantity(${product.id}, 1)">+</button>
        </div>

        <button class="btn-add-cart" onclick="addToCart(${product.id})" style="background-color: ${btnColor}; color: white; border: none;">
            <i class="fa-solid fa-cart-shopping"></i> ${isOffer ? 'Comprar Agora' : 'Adicionar ao carrinho'}
        </button>
    `;

    return card;
}

function changeQuantity(productId, change) {
    const qtyElement = document.getElementById(`qty-${productId}`);
    let currentQty = productQuantities[productId] || 1;

    const newQty = currentQty + change;

    if (newQty >= 1) {
        productQuantities[productId] = newQty;
        qtyElement.innerText = newQty;
    }
}

function addToCart(productId) {
    if (productId === 999) return;

    // Track demand (for professional reports)
    const demand = JSON.parse(localStorage.getItem('ducervejaria_product_demand') || '{}');
    demand[productId] = (demand[productId] || 0) + 1;
    localStorage.setItem('ducervejaria_product_demand', JSON.stringify(demand));

    const quantity = productQuantities[productId];

    if (cartItems[productId]) {
        cartItems[productId] += quantity;
    } else {
        cartItems[productId] = quantity;
    }

    calculateTotalItems();
    updateCartUI();

    if (document.getElementById('cart-sidebar').classList.contains('open')) {
        renderCart();
    }
}

function removeFromCart(productId) {
    delete cartItems[productId];
    calculateTotalItems();
    updateCartUI();
    renderCart();
}

function calculateTotalItems() {
    cartTotalItems = 0;
    for (const qty of Object.values(cartItems)) {
        cartTotalItems += qty;
    }
}

function updateCartUI() {
    const headerCartCount = document.querySelector('.cart-count');
    const floatingCartCount = document.querySelector('.floating-cart-count');

    if (headerCartCount) headerCartCount.innerText = cartTotalItems;
    if (floatingCartCount) floatingCartCount.innerText = cartTotalItems;
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const isOpen = sidebar.classList.contains('open');

    if (!isOpen) {
        sidebar.classList.add('open');
        renderCart();
    } else {
        sidebar.classList.remove('open');
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Ensure it's visible if it was hidden
        section.style.display = 'block';
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 10);
    }
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('cart-total-price');
    container.innerHTML = '';

    let totalPrice = 0;
    let hasItems = false;

    // Also include demo product in search if needed
    // Merge activeProducts + demo for lookup
    const lookupProducts = [...activeProducts];
    // Add demo product manually to lookup if it exists in cart logic
    if (cartItems[999]) {
        lookupProducts.push({
            id: 999,
            name: "Combo Vodka Absolut + 4 Red Bull",
            price: 75.00,
            image: "https://via.placeholder.com/200x200?text=Combo+Vodka+Energetico"
        });
    }

    for (const [id, qty] of Object.entries(cartItems)) {
        const productId = parseInt(id);
        const product = lookupProducts.find(p => p.id === productId);

        if (product) {
            hasItems = true;
            const itemTotal = product.price * qty;
            totalPrice += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${product.name}</div>
                    <div class="cart-item-details">
                        <span>${qty}x R$ ${formatPrice(product.price)}</span>
                        <strong>R$ ${formatPrice(itemTotal)}</strong>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${product.id})">Remover</button>
                </div>
            `;
            container.appendChild(itemDiv);
        }
    }

    if (!hasItems) {
        container.innerHTML = '<p style="text-align: center; margin-top: 20px; color: #999;">Seu carrinho está vazio.</p>';
        totalPriceElement.innerText = 'R$ 0,00';
    } else {
        totalPriceElement.innerText = `R$ ${formatPrice(totalPrice)}`;
    }
}

function formatPrice(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function getStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fa-solid fa-star"></i>';
    }

    if (hasHalf) {
        starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="fa-regular fa-star"></i>';
    }

    return starsHtml;
}

function openCheckout() {
    if (cartTotalItems === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const modal = document.getElementById('checkout-modal');
    const listContainer = document.getElementById('checkout-items-list');
    const finalPriceElement = document.getElementById('checkout-final-price');

    listContainer.innerHTML = '';
    let total = 0;

    const lookupProducts = [...activeProducts];
    if (cartItems[999]) {
        lookupProducts.push({
            id: 999,
            name: "Combo Vodka Absolut + 4 Red Bull",
            price: 75.00
        });
    }

    for (const [id, qty] of Object.entries(cartItems)) {
        const product = lookupProducts.find(p => p.id == id);
        if (product) {
            const itemTotal = product.price * qty;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'checkout-item';
            div.innerHTML = `
                <div class="checkout-item-name">${qty}x ${product.name}</div>
                <div class="checkout-item-price">R$ ${formatPrice(itemTotal)}</div>
            `;
            listContainer.appendChild(div);
        }
    }

    finalPriceElement.innerText = `R$ ${formatPrice(total)}`;

    // Populate neighborhoods
    const neighborSelect = document.getElementById('neighbor-select');
    neighborSelect.innerHTML = '<option value="">Selecione seu bairro...</option>';

    const sortedNeighbors = [...activeNeighborhoods].sort((a, b) => {
        if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
        return a.name.localeCompare(b.name);
    });

    sortedNeighbors.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.innerText = `[${n.zone}] ${n.name} - R$ ${formatPrice(n.fee)}`;
        neighborSelect.appendChild(opt);
    });

    updateCheckoutTotal(); // Initial update

    // Reset change field
    document.getElementById('payment-method').value = 'Pix';
    document.getElementById('change-field-container').style.display = 'none';
    document.getElementById('change-for').value = '';

    modal.classList.add('active');
    toggleCart(); // Close sidebar
}

function handlePaymentChange() {
    const payment = document.getElementById('payment-method').value;
    const container = document.getElementById('change-field-container');
    if (payment === 'Dinheiro') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function updateCheckoutTotal() {
    let subtotal = 0;
    const lookupProducts = [...activeProducts];
    if (cartItems[999]) lookupProducts.push({ id: 999, price: 75.00 });

    for (const [id, qty] of Object.entries(cartItems)) {
        const p = lookupProducts.find(x => x.id == id);
        if (p) subtotal += p.price * qty;
    }

    const neighborId = document.getElementById('neighbor-select').value;
    const neighbor = activeNeighborhoods.find(n => n.id == neighborId);
    const fee = neighbor ? neighbor.fee : 0;

    document.getElementById('checkout-delivery-fee').innerText = `R$ ${formatPrice(fee)}`;
    document.getElementById('checkout-final-total').innerText = `R$ ${formatPrice(subtotal + fee)}`;
}

function confirmOrder() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const neighborId = document.getElementById('neighbor-select').value;
    const payment = document.getElementById('payment-method').value;

    const neighbor = activeNeighborhoods.find(n => n.id == neighborId);

    if (!name || !phone || !address || !neighbor) {
        alert("Por favor, preencha todos os campos e selecione seu bairro.");
        return;
    }

    // Build WhatsApp message
    let message = `*NOVO PEDIDO - DÚ CERVEJARIA*\n\n`;
    message += `👤 *Cliente:* ${name}\n`;
    message += `📞 *WhatsApp:* ${phone}\n`;
    message += `📍 *Endereço:* ${address}\n`;
    message += `🏘️ *Bairro:* ${neighbor.name} (${neighbor.zone})\n`;
    message += `💳 *Pagamento:* ${payment}\n\n`;
    message += `🛒 *Produtos:*\n`;

    let subtotal = 0;
    const lookupProducts = [...activeProducts];
    if (cartItems[999]) lookupProducts.push({ id: 999, name: "Combo Vodka Absolut + 4 Red Bull", price: 75.00 });

    for (const [id, qty] of Object.entries(cartItems)) {
        const product = lookupProducts.find(p => p.id == id);
        if (product) {
            const itemTotal = product.price * qty;
            subtotal += itemTotal;
            message += `• ${qty}x ${product.name} - R$ ${formatPrice(itemTotal)}\n`;
        }
    }

    const total = subtotal + neighbor.fee;
    message += `\n📦 *Entrega:* R$ ${formatPrice(neighbor.fee)}`;
    message += `\n💰 *TOTAL: R$ ${formatPrice(total)}*`;

    let changeInfo = { for: 0, back: 0 };
    if (payment === 'Dinheiro') {
        const changeFor = parseFloat(document.getElementById('change-for').value) || 0;
        if (changeFor > total) {
            const back = changeFor - total;
            message += `\n\n💵 *Troco para:* R$ ${formatPrice(changeFor)}`;
            message += `\n↪️ *Troco a devolver:* R$ ${formatPrice(back)}`;
            changeInfo = { for: changeFor, back: back };
        } else if (changeFor === 0) {
            message += `\n\n💵 *Troco:* Não precisa (Valor Gasto)`;
        } else if (changeFor < total && changeFor > 0) {
            alert(`O valor para troco (R$ ${formatPrice(changeFor)}) é menor que o total do pedido (R$ ${formatPrice(total)}). Por favor, corrija.`);
            return;
        }
    }

    // --- SAVE ORDER TO DASHBOARD ---
    const orderItems = [];
    for (const [id, qty] of Object.entries(cartItems)) {
        const product = lookupProducts.find(p => p.id == id);
        if (product) orderItems.push({ name: product.name, qty, price: product.price });
    }

    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        customerName: name,
        customerPhone: phone,
        address: address,
        neighbor: neighbor.name,
        zone: neighbor.zone,
        items: orderItems,
        subtotal: subtotal,
        deliveryFee: neighbor.fee,
        total: total,
        paymentMethod: payment,
        change: changeInfo,
        status: 'Pendente'
    };

    const storedOrders = JSON.parse(localStorage.getItem('ducervejaria_orders') || '[]');
    storedOrders.push(newOrder);
    localStorage.setItem('ducervejaria_orders', JSON.stringify(storedOrders));
    // --------------------------------

    // Send to WhatsApp
    const savedZap = localStorage.getItem('ducervejaria_whatsapp') || '5511999999999';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${savedZap}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Clear cart after order
    for (let id in cartItems) delete cartItems[id];
    calculateTotalItems();
    updateCartUI();
    closeModal('checkout-modal');
    alert("Pedido enviado para o WhatsApp! Dados do pedido salvos.");
}
