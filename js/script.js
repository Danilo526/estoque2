// Dados do sistema
let products = JSON.parse(localStorage.getItem('products')) || [];
let movements = JSON.parse(localStorage.getItem('movements')) || [];

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadProducts();
    updateDashboard();
    updateRemoveProductOptions();
    
    // Adicionar event listeners para formulários
    document.getElementById('add-product-form').addEventListener('submit', addProduct);
    document.getElementById('remove-product-form').addEventListener('submit', removeProduct);
});

// Gerenciar as tabs
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Mostrar o conteúdo correspondente
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Carregar produtos na tabela de inventário
function loadProducts() {
    const tableBody = document.getElementById('inventory-table-body');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Adicionar classe para estoque baixo
        if (product.quantity < 5) {
            row.classList.add('low-stock');
        }
        
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>${getStatusBadge(product.quantity)}</td>
            <td>
                <button class="action-btn edit-btn" data-code="${product.code}">Editar</button>
                <button class="action-btn delete-btn" data-code="${product.code}">Excluir</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners para botões de editar e excluir
    addActionButtonListeners();
    
    // Atualizar tabela de movimentações
    loadMovements();
}

// Obter nome da categoria
function getCategoryName(categoryCode) {
    const categories = {
        'electronics': 'Eletrônicos',
        'furniture': 'Móveis',
        'clothing': 'Vestuário',
        'books': 'Livros',
        'other': 'Outros'
    };
    
    return categories[categoryCode] || categoryCode;
}

// Gerar badge de status
function getStatusBadge(quantity) {
    if (quantity > 10) {
        return '<span class="status-badge success">Em estoque</span>';
    } else if (quantity > 0) {
        return '<span class="status-badge warning">Estoque baixo</span>';
    } else {
        return '<span class="status-badge error">Indisponível</span>';
    }
}

// Adicionar evento aos botões de ação
function addActionButtonListeners() {
    // Botões de editar
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productCode = this.getAttribute('data-code');
            editProduct(productCode);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productCode = this.getAttribute('data-code');
            deleteProduct(productCode);
        });
    });
}

// Adicionar produto ao estoque
function addProduct(e) {
    e.preventDefault();
    
    const code = document.getElementById('product-code').value;
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    
    // Verificar se o código já existe
    const existingProductIndex = products.findIndex(p => p.code === code);
    
    if (existingProductIndex >= 0) {
        // Atualizar produto existente
        const oldQuantity = products[existingProductIndex].quantity;
        products[existingProductIndex].name = name;
        products[existingProductIndex].category = category;
        products[existingProductIndex].price = price;
        products[existingProductIndex].quantity += quantity;
        
        // Registrar movimentação
        registerMovement(code, name, 'entrada', quantity, price * quantity);
        
        showNotification('Produto atualizado com sucesso!', 'success');
    } else {
        // Adicionar novo produto
        const newProduct = {
            code,
            name,
            category,
            price,
            quantity
        };
        
        products.push(newProduct);
        
        // Registrar movimentação
        registerMovement(code, name, 'entrada', quantity, price * quantity);
        
        showNotification('Produto adicionado com sucesso!', 'success');
    }
    
    // Salvar no localStorage
    saveData();
    
    // Atualizar interface
    loadProducts();
    updateDashboard();
    updateRemoveProductOptions();
    
    // Limpar formulário
    document.getElementById('add-product-form').reset();
}

// Remover produto do estoque
function removeProduct(e) {
    e.preventDefault();
    
    const productCode = document.getElementById('remove-product-select').value;
    const quantity = parseInt(document.getElementById('remove-quantity').value);
    
    // Encontrar o produto
    const productIndex = products.findIndex(p => p.code === productCode);
    
    if (productIndex >= 0) {
        const product = products[productIndex];
        
        // Verificar se quantidade é válida
        if (quantity > product.quantity) {
            showNotification('Quantidade a remover excede o estoque disponível!', 'error');
            return;
        }
        
        // Atualizar quantidade
        product.quantity -= quantity;
        
        // Registrar movimentação
        registerMovement(product.code, product.name, 'saída', quantity, product.price * quantity);
        
        // Remover produto se quantidade for zero
        if (product.quantity === 0) {
            products.splice(productIndex, 1);
        }
        
        // Salvar no localStorage
        saveData();
        
        // Atualizar interface
        loadProducts();
        updateDashboard();
        updateRemoveProductOptions();
        
        showNotification('Produto removido com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('remove-product-form').reset();
    }
}

// Editar produto
function editProduct(productCode) {
    const product = products.find(p => p.code === productCode);
    
    if (product) {
        // Preencher formulário de adição com dados do produto
        document.getElementById('product-code').value = product.code;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-quantity').value = 0; // Começar com 0 para adicionar ao estoque existente
        
        // Mudar para a tab de adição
        document.querySelector('[data-tab="add-product-tab"]').click();
        
        showNotification('Produto carregado para edição', 'success');
    }
}

// Excluir produto
function deleteProduct(productCode) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        const productIndex = products.findIndex(p => p.code === productCode);
        
        if (productIndex >= 0) {
            products.splice(productIndex, 1);
            
            // Salvar no localStorage
            saveData();
            
            // Atualizar interface
            loadProducts();
            updateDashboard();
            updateRemoveProductOptions();
            
            showNotification('Produto excluído com sucesso!', 'success');
        }
    }
}

// Registrar movimentação
function registerMovement(productCode, productName, type, quantity, value) {
    const now = new Date();
    
    const movement = {
        date: now.toISOString(),
        code: productCode,
        name: productName,
        type: type,
        quantity: quantity,
        value: value
    };
    
    movements.push(movement);
}

// Carregar movimentações
function loadMovements() {
    const tableBody = document.getElementById('daily-report-body');
    tableBody.innerHTML = '';
    
    // Filtrar movimentações de hoje
    const today = new Date().toISOString().split('T')[0];
    const todayMovements = movements.filter(m => m.date.startsWith(today));
    
    // Ordenar por data (mais recente primeiro)
    todayMovements.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    todayMovements.forEach(movement => {
        const row = document.createElement('tr');
        const date = new Date(movement.date);
        
        row.innerHTML = `
            <td>${date.toLocaleString('pt-BR')}</td>
            <td>${movement.code}</td>
            <td>${movement.name}</td>
            <td class="${movement.type}">${movement.type.toUpperCase()}</td>
            <td>${movement.quantity}</td>
            <td>R$ ${movement.value.toFixed(2)}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Atualizar gráfico de movimentações (placeholder por enquanto)
    updateMovementChart();
}

// Atualizar opções do select de remoção
function updateRemoveProductOptions() {
    const select = document.getElementById('remove-product-select');
    select.innerHTML = '<option value="">Selecione um produto</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.code;
        option.textContent = `${product.name} (${product.code}) - Disponível: ${product.quantity}`;
        select.appendChild(option);
    });
}

// Atualizar dashboard
function updateDashboard() {
    // Total de produtos
    document.getElementById('total-products').textContent = products.length;
    
    // Valor em estoque
    const stockValue = products.reduce((total, product) => total + (product.price * product.quantity), 0);
    document.getElementById('stock-value').textContent = `R$ ${stockValue.toFixed(2)}`;
    
    // Entradas hoje
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = movements.filter(m => m.date.startsWith(today) && m.type === 'entrada');
    document.getElementById('today-entries').textContent = todayEntries.length;
    
    // Saídas hoje
    const todayExits = movements.filter(m => m.date.startsWith(today) && m.type === 'saída');
    document.getElementById('today-exits').textContent = todayExits.length;
}

// Atualizar gráfico de movimentações (placeholder)
function updateMovementChart() {
    const chartElement = document.getElementById('daily-movement-chart');
    chartElement.innerHTML = 'Gráfico de Movimentações Diárias (placeholder)';
}

// Exibir notificação
function showNotification(message, type) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-icon">
            ${type === 'success' ? '✓' : type === 'error' ? '✗' : '!'}
        </div>
        <div class="notification-content">
            <div class="notification-title">${type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : 'Aviso'}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(notification);
    
    // Mostrar notificação depois de um curto delay
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Configurar fechamento da notificação
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Fechar automaticamente após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('movements', JSON.stringify(movements));
}