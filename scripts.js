let selectedProduct = null;
let editIndex = null;
let editProductIndex = null;

// DOM initialization
function initDOM() {
    return {
        modal: document.getElementById('formModal'),
        productModal: document.getElementById('productModal'),
        productTitle: document.getElementById('productTitle'),
        capacityInput: document.getElementById('capacity'),
        priceInput: document.getElementById('price'),
        shopSelect: document.getElementById('shop-select'),
        shopInput: document.getElementById('shop'),
        newShopInput: document.getElementById('new-shop-input'),
        dataTable: document.getElementById('dataTable').querySelector('tbody'),
        capacityFilter: document.getElementById('capacity-filter'),
        productFilter: document.getElementById('product-filter'),
        sortBy: document.getElementById('sort-by'),
        resetFiltersBtn: document.getElementById('reset-filters'),
        totalEntriesSpan: document.getElementById('total-entries'),
        lowestPriceSpan: document.getElementById('lowest-price'),
        productGallery: document.getElementById('product-gallery'),
        manageProductsBtn: document.getElementById('manage-products-btn'),
        newProductName: document.getElementById('new-product-name'),
        newProductImage: document.getElementById('new-product-image'),
        newProductCapacities: document.getElementById('new-product-capacities'),
        productsList: document.getElementById('products-list'),
        searchInput: document.getElementById('search-input'),
        themeToggle: document.getElementById('theme-toggle'),
        toggleFiltersBtn: document.getElementById('toggle-filters-btn'),
        filterControls: document.getElementById('filter-controls'),
        addProductBtn: document.getElementById('add-product-btn'),
        saveEditBtn: document.getElementById('save-edit-btn'),
        cancelEditBtn: document.getElementById('cancel-edit-btn'),
    };
}

// Focus trapping for modals
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

// Storage functions
function isLocalStorageAvailable() {
    try {
        const testKey = 'test';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

function getProducts() {
    if (!isLocalStorageAvailable()) return [];
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    if (!products.length) {
        products = [
            {
                name: 'Crucial MX500',
                image: 'https://content.crucial.com/content/dam/crucial/ssd-products/mx500/images/product/crucial-mx500-2-5inch-product-front-image.psd.transform/medium-png/image.png',
                capacities: ['250GB', '500GB', '1TB'],
            },
            {
                name: 'Crucial BX500',
                image: 'https://content.crucial.com/content/dam/crucial/ssd-products/bx500/images/product/crucial-bx500-front-image.psd.transform/medium-png/image.png',
                capacities: ['500GB', '1TB'],
            },
            {
                name: 'Samsung 870 EVO',
                image: 'https://tv-it.com/storage/new-project-4-4.webp',
                capacities: ['500GB'],
            },
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    return products;
}

function getPriceData() {
    if (!isLocalStorageAvailable()) return [];
    return JSON.parse(localStorage.getItem('priceData') || '[]');
}

function getShops() {
    if (!isLocalStorageAvailable()) return [];
    return JSON.parse(localStorage.getItem('shops') || '[]');
}

function saveProducts(products) {
    if (isLocalStorageAvailable()) {
        localStorage.setItem('products', JSON.stringify(products));
    }
}

function savePriceData(priceData) {
    if (isLocalStorageAvailable()) {
        localStorage.setItem('priceData', JSON.stringify(priceData));
    }
}

function saveShops(shops) {
    if (isLocalStorageAvailable()) {
        localStorage.setItem('shops', JSON.stringify(shops));
    }
}

function validateFormData({ capacity, price, shop, image, capacities }) {
    const validCapacities = ['250GB', '500GB', '1TB', '2TB'];
    if (capacities && capacities.length) {
        if (!capacities.every(c => validCapacities.includes(c))) {
            throw new Error('السعات يجب أن تكون: 250GB, 500GB, 1TB, 2TB');
        }
    } else if (capacity && !validCapacities.includes(capacity)) {
        throw new Error('سعة غير صالحة');
    }
    if (isNaN(price) || price <= 0) {
        throw new Error('السعر يجب أن يكون رقمًا موجبًا');
    }
    if (shop.length < 2 || /[<>\"&]/.test(shop)) {
        throw new Error('اسم المتجر غير صالح');
    }
    if (image && !isValidURL(image)) {
        throw new Error('رابط الصورة غير صالح');
    }
    return true;
}

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// UI functions
function renderProductGallery(products) {
    const productGallery = document.getElementById('product-gallery');
    productGallery.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.product = product.name;
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-name">${product.name}</div>
        `;
        productCard.addEventListener('click', () => openModal(product.name));
        productGallery.appendChild(productCard);
    });
}

function renderProductsList() {
    const productsList = document.getElementById('products-list');
    const products = getProducts();
    productsList.innerHTML = '';

    if (!products.length) {
        productsList.innerHTML = '<div class="no-products">لم تتم إضافة منتجات بعد</div>';
        return;
    }

    products.forEach((product, index) => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        const capacitiesText = Array.isArray(product.capacities) && product.capacities.length ? product.capacities.join(', ') : 'لا يوجد';
        productItem.innerHTML = `
            <div class="product-info">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div>
                    <span class="product-name-display">${product.name}</span>
                    <div class="product-capacities">السعات: ${capacitiesText}</div>
                </div>
            </div>
            <div>
                <button class="edit-product" onclick="editProduct(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-product" onclick="deleteProduct(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        productsList.appendChild(productItem);
    });
}

function updateTable(data) {
    const dataTable = document.getElementById('dataTable').querySelector('tbody');
    const totalEntriesSpan = document.getElementById('total-entries');
    const lowestPriceSpan = document.getElementById('lowest-price');
    dataTable.innerHTML = '';

    if (!data.length) {
        dataTable.innerHTML = '<tr><td colspan="5" class="no-data">لا توجد مدخلات أسعار بعد. اضغط على منتج لإضافة واحد.</td></tr>';
    } else {
        data.forEach((item, index) => {
            const originalIndex = getPriceData().findIndex(entry => entry.timestamp === item.timestamp);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product}</td>
                <td>${item.capacity}</td>
                <td>${formatNumber(item.price)} جنيه</td>
                <td>${item.shop}</td>
                <td class="actions-cell">
                    <button class="btn btn-primary" onclick="editData(${originalIndex})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteData(${originalIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            dataTable.appendChild(row);
        });
    }

    totalEntriesSpan.textContent = `${data.length} مدخلات`;
    if (data.length > 0) {
        const lowest = Math.min(...data.map(item => item.price));
        lowestPriceSpan.textContent = `الأقل: ${formatNumber(lowest)} جنيه`;
    } else {
        lowestPriceSpan.textContent = 'الأقل: -';
    }
}

function updateProductFilterOptions(products) {
    const productFilter = document.getElementById('product-filter');
    productFilter.innerHTML = '<option value="all">جميع المنتجات</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.name;
        option.textContent = product.name;
        productFilter.appendChild(option);
    });
}

function updateCapacityOptions(productName) {
    const capacitySelect = document.getElementById('capacity');
    capacitySelect.innerHTML = '';
    const products = getProducts();
    const product = products.find(p => p.name === productName);
    if (product && Array.isArray(product.capacities) && product.capacities.length) {
        product.capacities.forEach(capacity => {
            const option = document.createElement('option');
            option.value = capacity;
            option.textContent = capacity;
            capacitySelect.appendChild(option);
        });
        capacitySelect.disabled = product.capacities.length === 1;
    } else {
        const option = document.createElement('option');
        option.value = '500GB';
        option.textContent = '500 جيجابايت';
        capacitySelect.appendChild(option);
        capacitySelect.disabled = true;
    }
}

function updateShopOptions() {
    const shopSelect = document.getElementById('shop-select');
    if (!shopSelect) return;
    const shops = getShops();
    shopSelect.innerHTML = '<option value="new">متجر جديد</option>';
    shops.forEach(shop => {
        const option = document.createElement('option');
        option.value = shop;
        option.textContent = shop;
        shopSelect.appendChild(option);
    });
}

function toggleNewShopInput() {
    const shopSelect = document.getElementById('shop-select');
    const newShopInput = document.getElementById('new-shop-input');
    if (shopSelect && newShopInput) {
        newShopInput.style.display = shopSelect.value === 'new' ? 'block' : 'none';
        if (shopSelect.value !== 'new') {
            document.getElementById('shop').value = '';
        }
    }
}

function openModal(product) {
    selectedProduct = product;
    document.getElementById('productTitle').textContent = product;
    updateCapacityOptions(product);
    updateShopOptions();
    toggleNewShopInput();
    document.getElementById('formModal').style.display = 'flex';
    document.getElementById('formModal').querySelector('.modal-content').focus();
    document.getElementById('price').focus();
}

// Utility functions
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function showNotification(message, type = 'success') {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    notifications.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Main logic
function init() {
    if (!isLocalStorageAvailable()) {
        showNotification('تحذير: المتصفح لا يدعم LocalStorage، البيانات قد لا تُحفظ.', 'error');
    }

    renderProductGallery(getProducts());
    updateTable(getPriceData());
    updateProductFilterOptions(getProducts());

    const { 
        modal, productModal, capacityFilter, productFilter, 
        sortBy, resetFiltersBtn, manageProductsBtn, 
        searchInput, themeToggle, toggleFiltersBtn, filterControls,
        shopSelect
    } = initDOM();

    if (shopSelect) {
        shopSelect.addEventListener('change', toggleNewShopInput);
    }

    capacityFilter.addEventListener('change', debounce(filterData, 300));
    productFilter.addEventListener('change', debounce(filterData, 300));
    sortBy.addEventListener('change', debounce(filterData, 300));
    searchInput.addEventListener('input', debounce(filterData, 300));
    resetFiltersBtn.addEventListener('click', resetFilters);
    manageProductsBtn.addEventListener('click', openProductModal);
    themeToggle.addEventListener('click', () => {
        document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    });
    toggleFiltersBtn.addEventListener('click', () => {
        filterControls.classList.toggle('hidden');
        toggleFiltersBtn.innerHTML = `
            <i class="fas fa-filter"></i>
            ${filterControls.classList.contains('hidden') ? 'إظهار' : 'إخفاء'} الفلاتر
        `;
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
        if (event.target === productModal) closeProductModal();
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (modal.style.display === 'flex') closeModal();
            if (productModal.style.display === 'flex') closeProductModal();
        }
    });

    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveData();
        }
    });

    trapFocus(modal);
    trapFocus(productModal);
}

function filterData() {
    const capacity = document.getElementById('capacity-filter').value;
    const product = document.getElementById('product-filter').value;
    const sortOption = document.getElementById('sort-by').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    let data = getPriceData();

    if (searchQuery) {
        data = data.filter(
            item => item.product.toLowerCase().includes(searchQuery) || item.shop.toLowerCase().includes(searchQuery)
        );
    }

    if (capacity !== 'all') {
        data = data.filter(item => item.capacity === capacity);
    }
    if (product !== 'all') {
        data = data.filter(item => item.product === product);
    }

    if (sortOption === 'price-asc') {
        data.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
        data.sort((a, b) => b.price - a.price);
    } else {
        data.sort((a, b) => b.timestamp - a.timestamp);
    }

    updateTable(data);
}

function resetFilters() {
    document.getElementById('capacity-filter').value = 'all';
    document.getElementById('product-filter').value = 'all';
    document.getElementById('sort-by').value = 'newest';
    document.getElementById('search-input').value = '';
    updateTable(getPriceData());
}

function openProductModal() {
    renderProductsList();
    editProductIndex = null;
    toggleProductActions(false);
    document.getElementById('productModal').style.display = 'flex';
    document.getElementById('productModal').querySelector('.modal-content').focus();
}

function closeModal() {
    document.getElementById('formModal').style.display = 'none';
    document.getElementById('capacity').value = '250GB';
    document.getElementById('capacity').disabled = false;
    document.getElementById('price').value = '';
    document.getElementById('shop-select').value = 'new';
    document.getElementById('new-shop-input').style.display = 'none';
    selectedProduct = null;
    editIndex = null;
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('new-product-name').value = '';
    document.getElementById('new-product-image').value = '';
    document.getElementById('new-product-capacities').value = '';
    editProductIndex = null;
    toggleProductActions(false);
}

function saveData() {
    const capacity = document.getElementById('capacity').value;
    const price = parseFloat(document.getElementById('price').value);
    const shopSelect = document.getElementById('shop-select');
    let shop = shopSelect.value === 'new' ? document.getElementById('shop').value.trim() : shopSelect.value;

    try {
        validateFormData({ capacity, price, shop });
        const data = getPriceData();
        const entry = {
            product: selectedProduct,
            capacity,
            price,
            shop,
            timestamp: Date.now(),
        };

        if (shopSelect.value === 'new' && shop) {
            const shops = getShops();
            if (!shops.includes(shop)) {
                shops.push(shop);
                saveShops(shops);
            }
        }

        if (editIndex !== null) {
            data[editIndex] = entry;
            showNotification('تم تعديل السعر بنجاح', 'success');
        } else {
            data.push(entry);
            showNotification('تم إضافة السعر بنجاح', 'success');
        }

        savePriceData(data);
        updateTable(getPriceData());
        closeModal();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function editData(index) {
    const data = getPriceData();
    const item = data[index];
    selectedProduct = item.product;
    document.getElementById('productTitle').textContent = selectedProduct;
    updateCapacityOptions(selectedProduct);
    document.getElementById('price').value = item.price;
    const shopSelect = document.getElementById('shop-select');
    const shops = getShops();
    if (shops.includes(item.shop)) {
        shopSelect.value = item.shop;
        document.getElementById('new-shop-input').style.display = 'none';
    } else {
        shopSelect.value = 'new';
        document.getElementById('new-shop-input').style.display = 'block';
        document.getElementById('shop').value = item.shop;
    }
    editIndex = index;
    openModal(selectedProduct);
}

function deleteData(index) {
    if (!confirm('هل أنت متأكد من حذف هذا المدخل؟')) return;
    const data = getPriceData();
    data.splice(index, 1);
    savePriceData(data);
    updateTable(getPriceData());
    showNotification('تم حذف السعر بنجاح', 'success');
}

function addNewProduct() {
    const name = document.getElementById('new-product-name').value.trim();
    const image = document.getElementById('new-product-image').value.trim();
    const capacitiesInput = document.getElementById('new-product-capacities').value.trim();
    const capacities = capacitiesInput ? capacitiesInput.split(',').map(c => c.trim()) : [];

    try {
        validateFormData({ capacity: '250GB', price: 1, shop: 'test', image, capacities });
        const products = getProducts();

        if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            throw new Error('منتج بهذا الاسم موجود بالفعل');
        }

        products.push({ name, image, capacities });
        saveProducts(products);

        document.getElementById('new-product-name').value = '';
        document.getElementById('new-product-image').value = '';
        document.getElementById('new-product-capacities').value = '';
        renderProductsList();
        renderProductGallery(products);
        updateProductFilterOptions(products);
        showNotification('تم إضافة المنتج بنجاح', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function toggleProductActions(isEditing) {
    const addProductBtn = document.getElementById('add-product-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    if (isEditing) {
        addProductBtn.style.display = 'none';
        saveEditBtn.style.display = 'inline-flex';
        cancelEditBtn.style.display = 'inline-flex';
    } else {
        addProductBtn.style.display = 'inline-flex';
        saveEditBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
    }
}

function editProduct(index) {
    const products = getProducts();
    const product = products[index];
    document.getElementById('new-product-name').value = product.name;
    document.getElementById('new-product-image').value = product.image;
    document.getElementById('new-product-capacities').value = Array.isArray(product.capacities) ? product.capacities.join(', ') : '';
    editProductIndex = index;
    toggleProductActions(true);
}

function saveProductEdit() {
    const name = document.getElementById('new-product-name').value.trim();
    const image = document.getElementById('new-product-image').value.trim();
    const capacitiesInput = document.getElementById('new-product-capacities').value.trim();
    const capacities = capacitiesInput ? capacitiesInput.split(',').map(c => c.trim()) : [];

    try {
        validateFormData({ capacity: '250GB', price: 1, shop: 'test', image, capacities });
        const products = getProducts();
        if (products.some((p, i) => p.name.toLowerCase() === name.toLowerCase() && i !== editProductIndex)) {
            throw new Error('منتج بهذا الاسم موجود بالفعل');
        }

        products[editProductIndex] = { name, image, capacities };
        saveProducts(products);
        renderProductsList();
        renderProductGallery(products);
        updateProductFilterOptions(products);
        showNotification('تم تعديل المنتج بنجاح', 'success');
        document.getElementById('new-product-name').value = '';
        document.getElementById('new-product-image').value = '';
        document.getElementById('new-product-capacities').value = '';
        editProductIndex = null;
        toggleProductActions(false);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function cancelProductEdit() {
    document.getElementById('new-product-name').value = '';
    document.getElementById('new-product-image').value = '';
    document.getElementById('new-product-capacities').value = '';
    editProductIndex = null;
    toggleProductActions(false);
}

function deleteProduct(index) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف كل مدخلات الأسعار الخاصة به.')) return;

    const products = getProducts();
    const productName = products[index].name;
    products.splice(index, 1);
    saveProducts(products);

    const priceData = getPriceData().filter(entry => entry.product !== productName);
    savePriceData(priceData);

    renderProductsList();
    renderProductGallery(products);
    updateProductFilterOptions(products);
    updateTable(getPriceData());
    showNotification('تم حذف المنتج بنجاح', 'success');
}

document.addEventListener('DOMContentLoaded', init);