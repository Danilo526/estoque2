document.addEventListener("DOMContentLoaded", () => {
    // Carregar inventário do localStorage ao iniciar
    let inventory = loadInventory() || [];
    
    const inventoryTable = document.getElementById("inventory-table-body");
    const totalProducts = document.getElementById("total-products");
    const stockValue = document.getElementById("stock-value");
    const currentDate = document.getElementById("current-date");

    const addProductForm = document.getElementById("add-product-form");
    const removeProductForm = document.getElementById("remove-product-form");
    const removeProductSelect = document.getElementById("remove-product-select");

    // Mostrar data atual
    const today = new Date();
    currentDate.textContent = today.toLocaleDateString('pt-BR');

    // Função para salvar o inventário no localStorage
    function saveInventory() {
        localStorage.setItem("inventoryData", JSON.stringify(inventory));
    }

    // Função para carregar o inventário do localStorage
    function loadInventory() {
        const savedInventory = localStorage.getItem("inventoryData");
        return savedInventory ? JSON.parse(savedInventory) : null;
    }

    function updateInventory() {
        inventoryTable.innerHTML = "";
        removeProductSelect.innerHTML = "";
        let total = 0, value = 0;

        inventory.forEach((item, index) => {
            total += item.quantity;
            value += item.price * item.quantity;

            // Atualiza tabela
            const row = `
                <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>R$ ${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td><button class="remove-btn" data-index="${index}">❌</button></td>
                </tr>`;
            inventoryTable.innerHTML += row;

            // Atualiza seleção de produtos para remoção
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${item.name} (Qtd: ${item.quantity})`;
            removeProductSelect.appendChild(option);
        });

        totalProducts.textContent = total;
        stockValue.textContent = `R$ ${value.toFixed(2)}`;
        
        // Adiciona event listeners aos botões de remoção
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeWholeProduct(index);
            });
        });
    }

    addProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const code = document.getElementById("product-code").value;
        const name = document.getElementById("product-name").value;
        const price = parseFloat(document.getElementById("product-price").value);
        const quantity = parseInt(document.getElementById("product-quantity").value);

        if (!name || price <= 0 || quantity <= 0) {
            alert("Preencha os campos corretamente!");
            return;
        }

        // Verificar se o produto já existe pelo código
        const existingIndex = inventory.findIndex(item => item.code === code);
        
        if (existingIndex >= 0) {
            // Se o produto já existe, atualize a quantidade
            inventory[existingIndex].quantity += quantity;
            // Atualize também o preço caso tenha mudado
            inventory[existingIndex].price = price;
            inventory[existingIndex].name = name;
        } else {
            // Se o produto é novo, adicione ao inventário
            inventory.push({ code, name, price, quantity });
        }
        
        saveInventory(); // Salva no localStorage
        updateInventory();
        addProductForm.reset();
    });

    removeProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const index = parseInt(removeProductSelect.value);
        const removeQuantity = parseInt(document.getElementById("remove-quantity").value);

        if (isNaN(index) || inventory.length === 0) {
            alert("Selecione um produto válido!");
            return;
        }

        if (removeQuantity <= 0 || removeQuantity > inventory[index].quantity) {
            alert("Quantidade inválida!");
            return;
        }

        inventory[index].quantity -= removeQuantity;
        if (inventory[index].quantity === 0) {
            inventory.splice(index, 1);
        }

        saveInventory(); // Salva no localStorage
        updateInventory();
        removeProductForm.reset();
    });

    function removeWholeProduct(index) {
        if (confirm("Tem certeza que deseja remover este produto?")) {
            inventory.splice(index, 1);
            saveInventory(); // Salva no localStorage
            updateInventory();
        }
    }

    // Sistema de abas
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove a classe active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));
            
            // Adiciona a classe active ao botão clicado e ao conteúdo correspondente
            button.classList.add("active");
            const tabId = button.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // Inicializa o inventário
    updateInventory();
});