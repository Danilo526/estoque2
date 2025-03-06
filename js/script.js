document.addEventListener("DOMContentLoaded", () => {
    // Inicialização do sistema de abas
    setupTabs();
    
    // Carregar inventário do localStorage ao iniciar
    let inventory = [];
    loadInventory();
    
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
        console.log("Dados salvos:", inventory); // Log para debugging
    }

    // Função para carregar o inventário do localStorage
    function loadInventory() {
        const savedInventory = localStorage.getItem("inventoryData");
        console.log("Dados carregados:", savedInventory); // Log para debugging
        
        if (savedInventory && savedInventory !== "undefined") {
            try {
                inventory = JSON.parse(savedInventory);
                if (!Array.isArray(inventory)) {
                    console.error("Dados inválidos no localStorage");
                    inventory = [];
                }
            } catch (e) {
                console.error("Erro ao carregar dados:", e);
                inventory = [];
            }
        } else {
            inventory = [];
        }
        
        updateInventory();
    }

    function updateInventory() {
        inventoryTable.innerHTML = "";
        removeProductSelect.innerHTML = "";
        let total = 0, value = 0;

        // Adiciona uma opção vazia no select
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "Selecione um produto";
        removeProductSelect.appendChild(emptyOption);

        inventory.forEach((item, index) => {
            total += item.quantity;
            value += item.price * item.quantity;

            // Atualiza tabela
            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>R$ ${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td><button class="remove-btn">❌</button></td>
            `;
            
            // Adiciona botão de remoção com event listener
            const removeBtn = row.querySelector(".remove-btn");
            removeBtn.addEventListener("click", () => removeWholeProduct(index));
            
            inventoryTable.appendChild(row);

            // Atualiza seleção de produtos para remoção
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${item.name} (Qtd: ${item.quantity})`;
            removeProductSelect.appendChild(option);
        });

        totalProducts.textContent = total;
        stockValue.textContent = `R$ ${value.toFixed(2)}`;
    }

    addProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const code = document.getElementById("product-code").value;
        const name = document.getElementById("product-name").value;
        const price = parseFloat(document.getElementById("product-price").value);
        const quantity = parseInt(document.getElementById("product-quantity").value);

        if (!code || !name || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            alert("Preencha os campos corretamente!");
            return;
        }

        // Verificar se o produto já existe pelo código
        const existingIndex = inventory.findIndex(item => item.code === code);
        
        if (existingIndex >= 0) {
            // Se o produto já existe, atualize a quantidade
            inventory[existingIndex].quantity += quantity;
            // Atualize também o preço e nome caso tenham mudado
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
        const indexStr = removeProductSelect.value;
        
        if (!indexStr) {
            alert("Selecione um produto válido!");
            return;
        }
        
        const index = parseInt(indexStr);
        const removeQuantity = parseInt(document.getElementById("remove-quantity").value);

        if (isNaN(removeQuantity) || removeQuantity <= 0 || removeQuantity > inventory[index].quantity) {
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
    function setupTabs() {
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
    }
});