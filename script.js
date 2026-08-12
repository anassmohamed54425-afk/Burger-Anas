let cart = JSON.parse(localStorage.getItem("cart")) || [];

let customerData = JSON.parse(localStorage.getItem("customerData")) || {
    name: "",
    phone: "",
    address: ""
};


// ====================
// Display Saved Data
// ====================

document.getElementById("customerName").value = customerData.name;
document.getElementById("customerPhone").value = customerData.phone;
document.getElementById("customerAddress").value = customerData.address;


// ====================
// Add To Cart
// ====================

function addToCart(name, price) {

    let existingProduct = cart.find(function(product) {
        return product.name === name;
    });

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();

    displayCart();
}


// ====================
// Save Cart
// ====================

function saveCart() {

    localStorage.setItem("cart", JSON.stringify(cart));
}


// ====================
// Display Cart
// ====================

function displayCart() {

    let cartItems = document.getElementById("cartItems");

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach(function(product, index) {

        let productTotal = product.price * product.quantity;

        let item = document.createElement("div");

        item.innerHTML = `
            <div class="cart-item">

                <h3>${product.name}</h3>

                <p>
                    Price: ${product.price} EGP
                </p>

                <div class="quantity-controls">

                    <button onclick="decreaseQuantity(${index})">
                        -
                    </button>

                    <span>${product.quantity}</span>

                    <button onclick="increaseQuantity(${index})">
                        +
                    </button>

                </div>

                <p>
                    Total: ${productTotal} EGP
                </p>

                <button onclick="removeFromCart(${index})">
                    Remove
                </button>

            </div>
        `;

        cartItems.appendChild(item);

        total += productTotal;
    });

    document.getElementById("cartTotal").textContent = total;
}


// ====================
// Increase Quantity
// ====================

function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();

    displayCart();
}


// ====================
// Decrease Quantity
// ====================

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);
    }

    saveCart();

    displayCart();
}


// ====================
// Remove Product
// ====================

function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    displayCart();
}


// ====================
// Checkout
// ====================

document.getElementById("checkoutForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let placeOrderBtn = document.getElementById("placeOrderBtn");

placeOrderBtn.textContent = "Processing...";
placeOrderBtn.disabled = true;

    let name = document.getElementById("customerName").value.trim();

    let phone = document.getElementById("customerPhone").value.trim();

    let address = document.getElementById("customerAddress").value.trim();


    if (name === "" || phone === "" || address === "") {

        alert("Please fill in all fields.");

        return;
    }


    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    // Save customer information

    customerData = {
        name: name,
        phone: phone,
        address: address
    };

    localStorage.setItem(
        "customerData",
        JSON.stringify(customerData)
    );


    // Calculate total

    let total = 0;

    cart.forEach(function(product) {

        total += product.price * product.quantity;

    });


    // Create Order ID

    let orderId =
        "BH-" +
        Math.floor(10000 + Math.random() * 90000);


    // Create order items

    let orderItems = "";

    cart.forEach(function(product) {

        let productTotal =
            product.price * product.quantity;

        orderItems += `
            <p>
                ${product.name}
                × ${product.quantity}
                = ${productTotal} EGP
            </p>
        `;
    });


    // Display order

    let orderMessage =
        document.getElementById("orderMessage");

    orderMessage.innerHTML = `

        <h2>Order Confirmed!</h2>

        <h3>Order ID: ${orderId}</h3>

        <p>Thank you, ${name}</p>

        <hr>

        ${orderItems}

        <hr>

        <h3>Total: ${total} EGP</h3>

    `;

    placeOrderBtn.textContent = "Order Placed!";


    console.log("Name:", name);
    console.log("Phone:", phone);
    console.log("Address:", address);
    console.log("Total:", total);

});


// ====================
// Start Application
// ====================

document.getElementById("clearCart").addEventListener("click", function() {

    if (cart.length === 0) {
        return;
    }

    let confirmClear = confirm(
        "Are you sure you want to clear your cart?"
    );

    if (confirmClear) {

        cart = [];

        localStorage.removeItem("cart");

        displayCart();
    }

});

displayCart();