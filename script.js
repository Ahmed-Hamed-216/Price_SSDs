// Reference to modal and table
const modal = document.getElementById('formModal');
const productTitle = document.getElementById('productTitle');
const capacityInput = document.getElementById('capacity');
const priceInput = document.getElementById('price');
const shopInput = document.getElementById('shop');
const dataTable = document.getElementById('dataTable').querySelector('tbody');

let selectedProduct = "";
let editIndex = null;

// Open modal on product click
document.querySelectorAll('.product').forEach(product => {
    product.addEventListener('click', () => {
        selectedProduct = product.dataset.product;
        productTitle.textContent = selectedProduct;
        modal.style.display = 'block';
    });
});

// Close modal
function closeModal() {
    modal.style.display = 'none';
    capacityInput.value = "250GB";
    priceInput.value = "";
    shopInput.value = "";
    editIndex = null; // Reset edit index
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Save data
function saveData() {
    const capacity = capacityInput.value;
    const price = priceInput.value;
    const shop = shopInput.value;

    if (price && shop) {
        const data = JSON.parse(localStorage.getItem('priceData')) || [];

        if (editIndex !== null) {
            // Update existing data
            data[editIndex] = { product: selectedProduct, capacity, price, shop };
            editIndex = null;
        } else {
            // Add new data
            data.push({ product: selectedProduct, capacity, price, shop });
        }

        localStorage.setItem('priceData', JSON.stringify(data));
        updateTable();
        closeModal();
    } else {
        alert("Please fill in all fields!");
    }
}

// Update table with saved data
function updateTable() {
    const data = JSON.parse(localStorage.getItem('priceData')) || [];
    dataTable.innerHTML = ""; // Clear previous rows
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.product}</td>
            <td>${item.capacity}</td>
            <td>${formatNumber(item.price)}</td>
            <td>${item.shop}</td>
            <td>
                <button class="btn btn-edit" onclick="editData(${index})">Edit</button>
                <button class="btn btn-delete" onclick="deleteData(${index})">Delete</button>
            </td>
        `;
        dataTable.appendChild(row);
    });
}

// Delete data
function deleteData(index) {
    const data = JSON.parse(localStorage.getItem('priceData'));
    data.splice(index, 1);
    localStorage.setItem('priceData', JSON.stringify(data));
    updateTable();
}

// Edit data
function editData(index) {
    const data = JSON.parse(localStorage.getItem('priceData'));
    const item = data[index];
    selectedProduct = item.product;
    productTitle.textContent = selectedProduct;
    capacityInput.value = item.capacity;
    priceInput.value = item.price;
    shopInput.value = item.shop;
    editIndex = index; // Set edit index
    modal.style.display = 'block';
}

// Filter by capacity
function filterByCapacity(capacity) {
    const data = JSON.parse(localStorage.getItem('priceData')) || [];
    const filteredData = data.filter(item => item.capacity === capacity);
    dataTable.innerHTML = ""; // Clear previous rows
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.product}</td>
            <td>${item.capacity}</td>
            <td>${formatNumber(item.price)}</td>
            <td>${item.shop}</td>
            <td>
                <button class="btn btn-edit" onclick="editData(${index})">Edit</button>
                <button class="btn btn-delete" onclick="deleteData(${index})">Delete</button>
            </td>
        `;
        dataTable.appendChild(row);
    });
}

// Reset filter
function resetFilter() {
    updateTable();
}

// Load data on page load
document.addEventListener('DOMContentLoaded', updateTable);

// Detect Enter key in the modal and save data
document.addEventListener('keydown', function (event) {
    // Check if modal is open and Enter is pressed
    if (modal.style.display === 'block' && event.key === 'Enter') {
        event.preventDefault(); // Prevent default behavior (e.g., form submission)
        saveData(); // Call the save data function
    }
});

