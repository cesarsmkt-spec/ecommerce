document.addEventListener('DOMContentLoaded', () => {
    // Verify Auth
    const isLogged = localStorage.getItem('isAdmin') === 'true';
    if (!isLogged) {
        alert('Acesso negado. Faça login primeiro.');
        window.location.href = 'index.html';
        return;
    }

    // Init Data
    loadData();
    populateFilters();
    renderTable();
    renderCategoriesTable();
    renderCategoriesTable();
    updateStats();

    // Global keyboard listeners for modals
    window.addEventListener('keydown', (e) => {
        const activeModal = document.querySelector('.modal.active');
        if (!activeModal) return;

        if (e.key === 'Escape') {
            closeModal(activeModal.id);
        } else if (e.key === 'Enter') {
            // Check which modal is active and trigger its save function
            if (activeModal.id === 'product-modal') {
                saveProduct();
            } else if (activeModal.id === 'category-modal') {
                saveCategory();
            } else if (activeModal.id === 'delete-category-modal') {
                quickDeleteCategory();
            } else if (activeModal.id === 'neighborhood-modal') {
                saveNeighborhood();
            }
        }
    });
});

let activeProducts = [];
let activeCategories = [];
let activeNeighborhoods = [];
let activeOrders = [];

function switchTab(tabName) {
    // Update nav links
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    const navItem = document.getElementById('nav-' + tabName);
    if (navItem) navItem.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    const section = document.getElementById('section-' + tabName);
    if (section) section.style.display = 'block';

    if (tabName === 'categories') {
        renderCategoriesTable();
    } else if (tabName === 'reports') {
        renderReportsTable();
    } else if (tabName === 'inventory') {
        renderInventoryTable();
    } else if (tabName === 'delivery') {
        renderDeliveryTable();
    } else if (tabName === 'orders') {
        renderOrdersTable();
    }
}

function renderInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const lowStockItems = activeProducts.filter(p => (p.stock || 0) <= 10);

    if (lowStockItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#666;">Todos os itens estão com estoque em dia! <i class="fa-solid fa-circle-check" style="color:#2e7d32"></i></td></tr>';
        return;
    }

    lowStockItems.forEach(p => {
        const tr = document.createElement('tr');
        const stock = p.stock || 0;

        tr.innerHTML = `
            <td><img src="${p.image || 'https://via.placeholder.com/50'}" alt="Img"></td>
            <td>${p.name}</td>
            <td><span class="badge" style="background:#eee; padding:3px 8px; border-radius:4px; font-size:0.8rem;">${p.category}</span></td>
            <td style="color: #d32f2f; font-weight: bold;">${stock} <i class="fa-solid fa-triangle-exclamation"></i></td>
            <td>
                <button class="action-btn btn-table-edit" onclick="openProductModal('edit', ${p.id})"><i class="fa-solid fa-pen"></i> Repor</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderReportsTable() {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Load demand data from localStorage
    const demand = JSON.parse(localStorage.getItem('ducervejaria_product_demand') || '{}');

    // Create array of products with their demand count
    const demandList = activeProducts.map(p => ({
        ...p,
        count: demand[p.id] || 0
    }));

    // Sort by count (descending)
    demandList.sort((a, b) => b.count - a.count);

    demandList.forEach((p, index) => {
        const tr = document.createElement('tr');

        // Highlighting top positions
        let positionBadge = `<span style="font-weight:bold;">#${index + 1}</span>`;
        if (index === 0) positionBadge = `<span style="color:#ffd700; font-size:1.2rem;"><i class="fa-solid fa-crown"></i> #1</span>`;

        const isBest = p.isBestSeller === true || p.category === 'Mais Vendidos';
        const bestSellerBtn = isBest
            ? `<button class="action-btn" style="background:#ffd700; color:#333; width:auto; padding:0 10px;" onclick="toggleBestSeller(${p.id})"><i class="fa-solid fa-star"></i> Sim</button>`
            : `<button class="action-btn" style="background:#eee; color:#999; width:auto; padding:0 10px;" onclick="toggleBestSeller(${p.id})"><i class="fa-regular fa-star"></i> Não</button>`;

        tr.innerHTML = `
            <td>${positionBadge}</td>
            <td><img src="${p.image || 'https://via.placeholder.com/50'}" alt="Img"></td>
            <td>
                <div style="font-weight:600;">${p.name}</div>
                <div style="font-size:0.8rem; color:#888;">${p.category}</div>
            </td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:1.1rem; font-weight:700; color:var(--primary-color);">${p.count}</span>
                    <span style="font-size:0.8rem; color:#999;">interesses</span>
                </div>
            </td>
            <td>${bestSellerBtn}</td>
            <td>
                <button class="action-btn btn-table-edit" onclick="openProductModal('edit', ${p.id})"><i class="fa-solid fa-pen"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleBestSeller(productId) {
    const idx = activeProducts.findIndex(p => p.id === productId);
    if (idx > -1) {
        // Toggle boolean flag
        activeProducts[idx].isBestSeller = !activeProducts[idx].isBestSeller;

        // Save to localStorage
        localStorage.setItem('ducervejaria_products', JSON.stringify(activeProducts));

        // Refresh the table
        renderReportsTable();

        // Also update regular product table and stats just in case
        renderTable();
        updateStats();
    }
}

function loadData() {
    const storedProds = localStorage.getItem('ducervejaria_products');
    if (storedProds) {
        activeProducts = JSON.parse(storedProds);
    } else {
        if (typeof products !== 'undefined') {
            activeProducts = [...products];
        } else {
            activeProducts = [];
        }
    }

    const storedCats = localStorage.getItem('ducervejaria_categories');
    if (storedCats) {
        activeCategories = JSON.parse(storedCats);
    } else {
        if (typeof categories !== 'undefined') {
            activeCategories = [...categories];
        } else {
            activeCategories = ['Ofertas Imperdíveis', 'Ofertas do Dia'];
        }
        localStorage.setItem('ducervejaria_categories', JSON.stringify(activeCategories));
    }

    // Ensure system categories exist
    const systemCats = ['Ofertas Imperdíveis', 'Ofertas do Dia', 'Mais Vendidos'];
    let changed = false;
    systemCats.forEach(sc => {
        if (!activeCategories.includes(sc)) {
            activeCategories.push(sc);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('ducervejaria_categories', JSON.stringify(activeCategories));
    }

    const storedNeighbors = localStorage.getItem('ducervejaria_neighborhoods');
    if (storedNeighbors) {
        activeNeighborhoods = JSON.parse(storedNeighbors);
    } else {
        activeNeighborhoods = [];
    }

    const storedOrders = localStorage.getItem('ducervejaria_orders');
    if (storedOrders) {
        activeOrders = JSON.parse(storedOrders);
    } else {
        activeOrders = [];
    }

    const savedZap = localStorage.getItem('ducervejaria_whatsapp');
    if (savedZap) {
        const zapInput = document.getElementById('config-whatsapp');
        if (zapInput) zapInput.value = savedZap;
    }

    // Load Admin Auth into settings
    const currentAuth = JSON.parse(localStorage.getItem('ducervejaria_admin_auth') || '{"u":"ducervejariaadmin","p":"ducervejariaadmin"}');
    const userInp = document.getElementById('new-admin-user');
    const passInp = document.getElementById('new-admin-pass');
    if (userInp) userInp.value = currentAuth.u;
    if (passInp) passInp.value = currentAuth.p;
}

function updateStats() {
    document.getElementById('stat-total').innerText = activeProducts.length;
    document.getElementById('stat-categories').innerText = activeCategories.length;

    // Low stock count (min <= 10)
    const lowStock = activeProducts.filter(p => (p.stock || 0) <= 10).length;
    document.getElementById('stat-low-stock').innerText = lowStock;
}

function populateFilters() {
    const sel = document.getElementById('filter-category');
    const modalSel = document.getElementById('prod-category');

    if (sel) sel.innerHTML = '<option value="">Todas as Categorias</option>';
    if (modalSel) modalSel.innerHTML = '<option value="">Selecione a Categoria</option>';

    const sortedCats = [...activeCategories].sort();

    sortedCats.forEach(c => {
        if (sel) {
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;
            sel.appendChild(opt);
        }
        if (modalSel) {
            const opt2 = document.createElement('option');
            opt2.value = c;
            opt2.innerText = c;
            modalSel.appendChild(opt2);
        }
    });

    // Also update quick delete select if it exists
    const delSel = document.getElementById('delete-cat-select');
    if (delSel) {
        delSel.innerHTML = '<option value="">Selecione para excluir</option>';
        sortedCats.forEach(c => {
            if (c !== 'Mais Vendidos') {
                const opt = document.createElement('option');
                opt.value = c;
                opt.innerText = c;
                delSel.appendChild(opt);
            }
        });
    }
}

function renderTable(filterText = '', filterCat = '') {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const filtered = activeProducts.filter(p => {
        const matchText = p.name.toLowerCase().includes(filterText.toLowerCase());
        const matchCat = filterCat === '' || p.category === filterCat;
        return matchText && matchCat;
    });

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        const price = p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        const oldPrice = p.originalPrice ? p.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-';
        const stock = p.stock || 0;
        const stockColor = stock <= 10 ? '#d32f2f' : '#2e7d32';
        const stockWeight = 'bold';

        tr.innerHTML = `
            <td><img src="${p.image || 'https://via.placeholder.com/50'}" alt="Img"></td>
            <td>${p.name}</td>
            <td><span class="badge" style="background:#eee; padding:3px 8px; border-radius:4px; font-size:0.8rem;">${p.category}</span></td>
            <td style="font-weight:bold; color: var(--primary-color);">R$ ${price}</td>
            <td style="color: #999; text-decoration: line-through;">${oldPrice !== '-' ? 'R$ ' + oldPrice : ''}</td>
            <td style="color: ${stockColor}; font-weight: ${stockWeight};">
                ${stock} ${stock <= 10 ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-circle-check" style="font-size: 0.8rem; opacity: 0.7;"></i>'}
            </td>
            <td>
                <button class="action-btn btn-table-edit" onclick="openProductModal('edit', ${p.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-table-delete" onclick="deleteProduct(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const sortedCats = [...activeCategories].sort();

    sortedCats.forEach(c => {
        const count = activeProducts.filter(p => p.category === c).length;
        const tr = document.createElement('tr');

        let tagHtml = '';
        if (c === 'Ofertas Imperdíveis' || c === 'Ofertas do Dia') {
            tagHtml = `<span class="badge" style="background: #ffebee; color: #d32f2f; margin-left: 8px; font-size: 0.7rem; border: 1px solid #ffcdd2;">OFERTA</span>`;
        } else if (c === 'Mais Vendidos') {
            tagHtml = `<span class="badge" style="background: #e8f5e9; color: #2e7d32; margin-left: 8px; font-size: 0.7rem; border: 1px solid #c8e6c9;">DESTAQUE</span>`;
        }

        tr.innerHTML = `
            <td style="font-weight: 500;">${c}${tagHtml}</td>
            <td>${count} produtos</td>
            <td>
                <button class="action-btn" style="background: var(--primary-color);" onclick="filterByCatFromTable('${c}')" title="Ver produtos"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn" style="background: var(--danger-color);" onclick="deleteCategory('${c}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openCategoryModal() {
    document.getElementById('cat-name').value = '';
    document.getElementById('category-modal').classList.add('active');
}

function saveCategory() {
    const name = document.getElementById('cat-name').value.trim();
    if (!name) {
        alert('Digite o nome da categoria');
        return;
    }
    if (activeCategories.includes(name)) {
        alert('Esta categoria já existe');
        return;
    }

    activeCategories.push(name);
    localStorage.setItem('ducervejaria_categories', JSON.stringify(activeCategories));

    closeModal('category-modal');
    renderCategoriesTable();
    populateFilters();
    updateStats();
}

function deleteCategory(catName) {
    const protectedCats = ['Mais Vendidos', 'Ofertas Imperdíveis', 'Ofertas do Dia'];
    if (protectedCats.includes(catName)) {
        alert(`A categoria "${catName}" é protegida pelo sistema e não pode ser excluída para garantir o funcionamento do site.`);
        return;
    }

    const count = activeProducts.filter(p => p.category === catName).length;
    if (count > 0) {
        alert(`Não é possível excluir a categoria "${catName}" pois ela possui ${count} produtos vinculados.`);
        return;
    }

    if (confirm(`Excluir a categoria "${catName}"?`)) {
        activeCategories = activeCategories.filter(c => c !== catName);
        localStorage.setItem('ducervejaria_categories', JSON.stringify(activeCategories));
        renderCategoriesTable();
        populateFilters();
        updateStats();
    }
}

function filterByCatFromTable(catName) {
    switchTab('products');
    const sel = document.getElementById('filter-category');
    if (sel) {
        sel.value = catName;
        renderTable('', catName);
    }
}

function filterProducts() {
    const txt = document.getElementById('search-input').value;
    const cat = document.getElementById('filter-category').value;
    renderTable(txt, cat);
}

function openProductModal(mode, productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');

    document.getElementById('prod-id').value = '';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-old-price').value = '';
    document.getElementById('prod-stock').value = '';
    document.getElementById('prod-img').value = '';
    document.getElementById('prod-category').value = '';
    const fileInput = document.getElementById('prod-img-file');
    if (fileInput) fileInput.value = '';

    const imgPreview = document.getElementById('img-preview');
    const uploadText = document.getElementById('upload-text');
    if (imgPreview) {
        imgPreview.style.display = 'none';
        imgPreview.src = '';
    }
    if (uploadText) uploadText.style.display = 'flex';

    if (mode === 'edit' && productId) {
        title.innerText = 'Editar Produto';
        const p = activeProducts.find(x => x.id === productId);
        if (p) {
            document.getElementById('prod-id').value = p.id;
            document.getElementById('prod-name').value = p.name;
            document.getElementById('prod-price').value = p.price;
            document.getElementById('prod-old-price').value = p.originalPrice || '';
            document.getElementById('prod-stock').value = p.stock || 0;
            document.getElementById('prod-category').value = p.category;

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

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function saveProduct() {
    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const originalPrice = parseFloat(document.getElementById('prod-old-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value) || 0;
    const image = document.getElementById('prod-img').value || 'https://via.placeholder.com/200x200';
    const category = document.getElementById('prod-category').value;

    if (!name || isNaN(price) || !category) {
        alert('Preencha os campos obrigatórios');
        return;
    }

    if (id) {
        const idx = activeProducts.findIndex(p => p.id == id);
        if (idx > -1) {
            activeProducts[idx] = { ...activeProducts[idx], name, price, originalPrice, stock, image, category };
        }
    } else {
        const newProduct = {
            id: Date.now(),
            name, price, originalPrice, stock, image, category, rating: 5.0
        };
        activeProducts.push(newProduct);
    }

    localStorage.setItem('ducervejaria_products', JSON.stringify(activeProducts));
    closeModal('product-modal');
    renderTable();
    renderCategoriesTable();
    renderReportsTable();
    renderInventoryTable();
    updateStats();
}

function deleteProduct(productId) {
    if (confirm('Excluir este produto?')) {
        activeProducts = activeProducts.filter(p => p.id !== productId);
        localStorage.setItem('ducervejaria_products', JSON.stringify(activeProducts));
        renderTable();
        renderCategoriesTable();
        updateStats();
    }
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('img-preview').src = e.target.result;
            document.getElementById('img-preview').style.display = 'block';
            document.getElementById('upload-text').style.display = 'none';
            document.getElementById('prod-img').value = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function openDeleteCategoryQuickModal() {
    const sel = document.getElementById('delete-cat-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione para excluir</option>';

    const sortedCats = [...activeCategories].sort();
    sortedCats.forEach(c => {
        if (c !== 'Mais Vendidos') {
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;
            sel.appendChild(opt);
        }
    });

    document.getElementById('delete-category-modal').classList.add('active');
}

function quickDeleteCategory() {
    const catName = document.getElementById('delete-cat-select').value;
    if (!catName) {
        alert('Selecione uma categoria');
        return;
    }

    deleteCategory(catName);
    closeModal('delete-category-modal');
}

function renderDeliveryTable() {
    const tbody = document.getElementById('delivery-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Sort by Zone then Name
    const sorted = [...activeNeighborhoods].sort((a, b) => {
        if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
        return a.name.localeCompare(b.name);
    });

    sorted.forEach(n => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge" style="background:#f0f0f0; padding:4px 10px; border-radius:15px; font-size:0.75rem; font-weight:bold;">${n.zone}</span></td>
            <td><strong>${n.name}</strong></td>
            <td style="color: var(--primary-color); font-weight: bold;">R$ ${n.fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            <td>
                <button class="action-btn btn-table-edit" onclick="openNeighborhoodModal(${n.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-table-delete" onclick="deleteNeighborhood(${n.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openNeighborhoodModal(id = null) {
    const modal = document.getElementById('neighborhood-modal');
    const title = document.getElementById('neighborhood-modal-title');

    document.getElementById('neighbor-id').value = '';
    document.getElementById('neighbor-name').value = '';
    document.getElementById('neighbor-fee').value = '';
    document.getElementById('neighbor-zone').value = 'ZONA NORTE';

    if (id) {
        title.innerText = 'Editar Bairro';
        const n = activeNeighborhoods.find(x => x.id === id);
        if (n) {
            document.getElementById('neighbor-id').value = n.id;
            document.getElementById('neighbor-name').value = n.name;
            document.getElementById('neighbor-fee').value = n.fee;
            document.getElementById('neighbor-zone').value = n.zone;
        }
    } else {
        title.innerText = 'Novo Bairro';
    }

    modal.classList.add('active');
}

function saveNeighborhood() {
    const id = document.getElementById('neighbor-id').value;
    const name = document.getElementById('neighbor-name').value.trim();
    const fee = parseFloat(document.getElementById('neighbor-fee').value);
    const zone = document.getElementById('neighbor-zone').value;

    if (!name || isNaN(fee)) {
        alert('Preencha o nome e o valor da taxa');
        return;
    }

    if (id) {
        const idx = activeNeighborhoods.findIndex(n => n.id == id);
        if (idx > -1) {
            activeNeighborhoods[idx] = { ...activeNeighborhoods[idx], name, fee, zone };
        }
    } else {
        activeNeighborhoods.push({
            id: Date.now(),
            name, fee, zone
        });
    }

    localStorage.setItem('ducervejaria_neighborhoods', JSON.stringify(activeNeighborhoods));
    closeModal('neighborhood-modal');
    renderDeliveryTable();
}

function deleteNeighborhood(id) {
    if (confirm('Excluir este bairro?')) {
        activeNeighborhoods = activeNeighborhoods.filter(n => n.id !== id);
        localStorage.setItem('ducervejaria_neighborhoods', JSON.stringify(activeNeighborhoods));
        renderDeliveryTable();
    }
}

function renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Load fresh from LS
    const stored = localStorage.getItem('ducervejaria_orders');
    activeOrders = stored ? JSON.parse(stored) : [];

    // Sort by date (newest first)
    const sorted = [...activeOrders].sort((a, b) => b.id - a.id);

    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#999;">Nenhum pedido realizado ainda.</td></tr>';
        return;
    }

    sorted.forEach(o => {
        const tr = document.createElement('tr');

        // Format items summary (shortened for table)
        const itemsSummary = o.items.map(i => `${i.qty}x ${i.name}`).join('<br>');

        tr.innerHTML = `
            <td style="font-size: 0.85rem;">${o.date}</td>
            <td>
                <strong>${o.customerName}</strong><br>
                <small><i class="fa-brands fa-whatsapp"></i> ${o.customerPhone}</small><br>
                <small style="color: #666;">${o.neighbor} (${o.zone})</small>
            </td>
            <td style="font-size: 0.85rem; line-height: 1.4;">${itemsSummary}</td>
            <td style="font-weight: bold; color: var(--primary-color);">
                R$ ${o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
                <small style="color: #666; font-weight: normal;">${o.paymentMethod || 'N/A'}</small>
                ${o.paymentMethod === 'Dinheiro' ? `
                    <div style="font-size: 0.75rem; color: #d32f2f; margin-top: 4px; font-weight: normal; background: #fff1f0; padding: 2px 5px; border-radius: 4px;">
                        ${o.change && o.change.for > 0 ? `Troco p/: R$ ${o.change.for.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Valor Gasto'}
                    </div>
                ` : ''}
            </td>
            <td>
                <button class="action-btn" style="background: #2196f3;" onclick="viewOrderDetails(${o.id})" title="Ver detalhes"><i class="fa-solid fa-eye"></i></button>
                <button class="action-btn btn-table-delete" onclick="deleteOrder(${o.id})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewOrderDetails(id) {
    const order = activeOrders.find(o => o.id === id);
    if (!order) return;

    const content = document.getElementById('order-details-content');

    let itemsHtml = order.items.map(i => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #eee; padding-bottom: 5px;">
            <span style="flex: 1;">${i.qty}x <strong>${i.name}</strong></span>
            <span style="font-family: monospace;">R$ ${(i.price * i.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
    `).join('');

    content.innerHTML = `
        <div style="background: #fdfdfd; padding: 15px; border: 1px solid #ebebeb; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div><strong>📅 Data:</strong><br>${order.date}</div>
                <div><strong>👤 Cliente:</strong><br>${order.customerName}</div>
                <div><strong>📱 WhatsApp:</strong><br>${order.customerPhone}</div>
                <div><strong>💳 Pagamento:</strong><br>${order.paymentMethod}</div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <p style="margin-bottom: 8px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-location-dot" style="color: #f44336;"></i> Endereço de Entrega
            </p>
            <div style="background: #fff8e1; padding: 12px; border-radius: 6px; font-size: 0.95rem; border: 1px solid #ffe082;">
                ${order.address}<br>
                <strong style="color: #8d6e63;">Bairro:</strong> ${order.neighbor} (${order.zone})
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <p style="margin-bottom: 10px; font-weight: bold; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px;">🛒 Itens do Pedido</p>
            <div style="margin-top: 5px;">${itemsHtml}</div>
        </div>

        <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; border: 1px solid #c8e6c9;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #555;">
                <span>Subtotal:</span>
                <span>R$ ${order.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #555;">
                <span>Taxa de Entrega:</span>
                <span>R$ ${order.deliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #fff; font-size: 1.3rem; font-weight: 800; color: var(--primary-color);">
                <span>TOTAL:</span>
                <span>R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>

        ${order.paymentMethod === 'Dinheiro' && order.change && order.change.for > 0 ? `
            <div style="margin-top: 15px; padding: 15px; background: #fff1f0; border-radius: 8px; border: 1px solid #ffa39e; display: flex; align-items: center; gap: 15px;">
                <i class="fa-solid fa-hand-holding-dollar" style="font-size: 1.5rem; color: #cf1322;"></i>
                <div>
                    <strong style="color: #cf1322;">PRECISA DE TROCO:</strong><br>
                    <span>Receber: R$ ${order.change.for.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> | 
                    <strong style="color: #cf1322;">Devolver: R$ ${order.change.back.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
            </div>
        ` : ''}
    `;

    document.getElementById('order-details-modal').classList.add('active');
}

function deleteOrder(id) {
    if (confirm('Excluir este pedido do histórico?')) {
        activeOrders = activeOrders.filter(o => o.id !== id);
        localStorage.setItem('ducervejaria_orders', JSON.stringify(activeOrders));
        renderOrdersTable();
    }
}

function saveWhatsAppConfig() {
    const zap = document.getElementById('config-whatsapp').value.replace(/\D/g, '');
    if (!zap || zap.length < 10) {
        alert('Por favor, insira um número válido (ex: 5511999999999)');
        return;
    }
    localStorage.setItem('ducervejaria_whatsapp', zap);
    alert('Número de WhatsApp salvo com sucesso!');
}

function logout() {
    localStorage.setItem('isAdmin', 'false');
    window.location.href = 'index.html';
}

function updateAdminAuth() {
    const newUser = document.getElementById('new-admin-user').value.trim();
    const newPass = document.getElementById('new-admin-pass').value.trim();

    if (!newUser || !newPass) {
        alert('Usuário e senha não podem ficar vazios');
        return;
    }

    if (confirm('Tem certeza que deseja alterar os dados de acesso? No próximo login você precisará dos novos dados.')) {
        localStorage.setItem('ducervejaria_admin_auth', JSON.stringify({ u: newUser, p: newPass }));
        alert('Credenciais atualizadas com sucesso!');
    }
}

function sendSuggestion() {
    const text = document.getElementById('dev-suggestions').value.trim();
    if (!text) {
        alert('Por favor, escreva uma sugestão antes de enviar.');
        return;
    }

    // Since this is a local demo, we simulate the sending
    console.log("Suggestion sent to developer:", text);
    alert('Obrigado! Sua sugestão foi enviada ao desenvolvedor.');
    document.getElementById('dev-suggestions').value = '';
}

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}
