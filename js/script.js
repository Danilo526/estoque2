document.addEventListener("DOMContentLoaded", () => {
    let inventory = [];
    
    const inventoryTable = document.getElementById("inventory-table-body");
    const totalProducts = document.getElementById("total-products");
    const stockValue = document.getElementById("stock-value");

    const addProductForm = document.getElementById("add-product-form");
    const removeProductForm = document.getElementById("remove-product-form");
    const removeProductSelect = document.getElementById("remove-product-select");

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
                    <td><button onclick="removeProduct(${index})">❌</button></td>
                </tr>`;
            inventoryTable.innerHTML += row;

            // Atualiza seleção de produtos para remoção
            const option = document.createElement("option");
            option.value = index;
            option.textContent = ${item.name} (Qtd: ${item.quantity});
            removeProductSelect.appendChild(option);
        });

        totalProducts.textContent = total;
        stockValue.textContent = R$ ${value.toFixed(2)};
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

        inventory.push({ code, name, price, quantity });
        updateInventory();
        addProductForm.reset();
    });

    removeProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const index = parseInt(removeProductSelect.value);
        const removeQuantity = parseInt(document.getElementById("remove-quantity").value);

        if (removeQuantity <= 0 || removeQuantity > inventory[index].quantity) {
            alert("Quantidade inválida!");
            return;
        }

        inventory[index].quantity -= removeQuantity;
        if (inventory[index].quantity === 0) {
            inventory.splice(index, 1);
        }

        updateInventory();
        removeProductForm.reset();
    });

    window.removeProduct = (index) => {
        inventory.splice(index, 1);
        updateInventory();
    };

    updateInventory();
});