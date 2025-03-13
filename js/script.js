// Inicializar o sistema de estoque
document.addEventListener('DOMContentLoaded', function() {
    // Configurar data atual
    const today = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('current-date').textContent = today.toLocaleDateString('pt-BR', options);
    
    // Carregar os produtos do localStorage
    loadProducts();
    
    // Configurar os ouvintes de eventos
    setupEventListeners();
});

// Sistema de abas
function setupEventListeners() {
    // Sistema de abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe ativa de todas as abas
            tabButtons.forEach(btn => btn.classList.remove('active'));
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adicionar classe ativa na aba clicada
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Formulário para adicionar produtos
    document.getElementById('add-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
    
    // Formulário para remover estoque
    document.getElementById('remove-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        removeStock();
    });
}

// Funções para gerenciar o estoque
let products = [];

// Carregar produtos do localStorage
function loadProducts() {
    const savedProducts = localStorage.getItem('inventory');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    
    updateInventoryTable();
    updateDashboard();
    updateRemoveSelect();
}

// Salvar produtos no localStorage
function saveProducts() {
    localStorage.setItem('inventory', JSON.stringify(products));
}

// Adicionar um novo produto
function addProduct() {
    const code = document.getElementById('product-code').value;
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    
    // Verificar se o código já existe
    const existingProductIndex = products.findIndex(p => p.code === code);
    
    if (existingProductIndex >= 0) {
        // Atualizar produto existente
        products[existingProductIndex].quantity += quantity;
        if (price !== products[existingProductIndex].price) {
            products[existingProductIndex].price = price;
        }
    } else {
        // Adicionar novo produto
        products.push({
            code,
            name,
            price,
            quantity
        });
    }
    
    // Salvar e atualizar a interface
    saveProducts();
    updateInventoryTable();
    updateDashboard();
    updateRemoveSelect();
    
    // Limpar o formulário
    document.getElementById('add-product-form').reset();
    
    // Exibir mensagem de sucesso
    alert('Produto adicionado com sucesso!');
}

// Remover estoque de um produto
function removeStock() {
    const code = document.getElementById('remove-product-select').value;
    const quantity = parseInt(document.getElementById('remove-quantity').value);
    
    // Encontrar o produto
    const productIndex = products.findIndex(p => p.code === code);
    
    if (productIndex >= 0) {
        // Verificar se há estoque suficiente
        if (products[productIndex].quantity >= quantity) {
            products[productIndex].quantity -= quantity;
            
            // Se a quantidade chegar a zero, perguntar se deseja remover o produto
            if (products[productIndex].quantity === 0) {
                const remove = confirm('O estoque deste produto chegou a zero. Deseja remover o produto do sistema?');
                if (remove) {
                    products.splice(productIndex, 1);
                }
            }
            
            // Salvar e atualizar a interface
            saveProducts();
            updateInventoryTable();
            updateDashboard();
            updateRemoveSelect();
            
            // Limpar o formulário
            document.getElementById('remove-product-form').reset();
            
            // Exibir mensagem de sucesso
            alert('Estoque removido com sucesso!');
        } else {
            alert('Quantidade insuficiente em estoque!');
        }
    }
}

// Remover produto completamente
function deleteProduct(code) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const productIndex = products.findIndex(p => p.code === code);
        if (productIndex >= 0) {
            products.splice(productIndex, 1);
            
            // Salvar e atualizar a interface
            saveProducts();
            updateInventoryTable();
            updateDashboard();
            updateRemoveSelect();
        }
    }
}

// Atualizar a tabela de inventário
function updateInventoryTable() {
    const tableBody = document.getElementById('inventory-table-body');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>
                <button class="action-btn" onclick="deleteProduct('${product.code}')">Excluir</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Atualizar o painel de controle
function updateDashboard() {
    const totalProducts = products.reduce((sum, product) => sum + product.quantity, 0);
    const stockValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('stock-value').textContent = `R$ ${stockValue.toFixed(2)}`;
}

// Atualizar o select para remover produto
function updateRemoveSelect() {
    const select = document.getElementById('remove-product-select');
    select.innerHTML = '';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.code;
        option.textContent = `${product.code} - ${product.name} (Em estoque: ${product.quantity})`;
        select.appendChild(option);
    });
}