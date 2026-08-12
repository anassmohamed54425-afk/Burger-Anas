// ====================
// CART
// ====================

let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ====================
// UPDATE CART COUNT
// ====================

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }

    let count = 0;

    cart.forEach(function(product) {

        count += Number(product.quantity) || 0;

    });

    cartCount.textContent = count;

}


// ====================
// ADD TO CART
// ====================

function addToCart(name, price) {

    let existingProduct =
        cart.find(function(product) {

            return product.name === name;

        });


    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({

            name: name,

            price: Number(price),

            quantity: 1

        });

    }


    saveCart();

    displayCart();

    updateCartCount();


    console.log("Added:", name);

}


// ====================
// SAVE CART
// ====================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// ====================
// DISPLAY CART
// ====================

function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");


    if (!cartItems || !cartTotal) {

        updateCartCount();

        return;

    }


    cartItems.innerHTML = "";

    let total = 0;


    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.textContent = "0";

        updateCartCount();

        return;

    }


    cart.forEach(function(product, index) {

        const price =
            Number(product.price) || 0;

        const quantity =
            Number(product.quantity) || 0;

        const productTotal =
            price * quantity;


        const item =
            document.createElement("div");


        item.className =
            "cart-item";


        item.innerHTML = `

            <h3>
                ${product.name}
            </h3>

            <p>
                Price:
                ${price} EGP
            </p>

            <div class="quantity-controls">

                <button
                    type="button"
                    onclick="decreaseQuantity(${index})">
                    -
                </button>

                <span>
                    ${quantity}
                </span>

                <button
                    type="button"
                    onclick="increaseQuantity(${index})">
                    +
                </button>

            </div>

            <p>
                Total:
                ${productTotal} EGP
            </p>

            <button
                type="button"
                onclick="removeFromCart(${index})">
                Remove
            </button>

        `;


        cartItems.appendChild(item);


        total += productTotal;

    });


    cartTotal.textContent = total;


    // تحديث العداد بعد رسم السلة
    updateCartCount();

}


// ====================
// INCREASE QUANTITY
// ====================

function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity++;


    saveCart();

    displayCart();

    updateCartCount();

}


// ====================
// DECREASE QUANTITY
// ====================

function decreaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }


    saveCart();

    displayCart();

    updateCartCount();

}


// ====================
// REMOVE PRODUCT
// ====================

function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }


    cart.splice(index, 1);


    saveCart();

    displayCart();

    updateCartCount();

}


// ====================
// CLEAR CART
// ====================

const clearCartButton =
    document.getElementById("clearCart");


if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        function() {

            if (cart.length === 0) {

                return;

            }


            if (confirm("Clear your cart?")) {

                cart = [];


                localStorage.removeItem("cart");


                displayCart();

                updateCartCount();

            }

        }
    );

}


// ====================
// CHECKOUT + FIREBASE
// ====================

const checkoutForm =
    document.getElementById("checkoutForm");


if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("customerName")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("customerPhone")
                    .value
                    .trim();


            const address =
                document
                    .getElementById("customerAddress")
                    .value
                    .trim();


            // ====================
            // VALIDATION
            // ====================

            if (
                name === "" ||
                phone === "" ||
                address === ""
            ) {

                alert(
                    "Please fill all information"
                );

                return;

            }


            if (cart.length === 0) {

                alert(
                    "Your cart is empty"
                );

                return;

            }


            // ====================
            // CALCULATE TOTAL
            // ====================

            let total = 0;


            cart.forEach(function(product) {

                total +=
                    Number(product.price) *
                    Number(product.quantity);

            });


            // ====================
            // CREATE ORDER ID
            // ====================

            const orderId =
                "BA-" +
                Math.floor(
                    10000 +
                    Math.random() * 90000
                );


            // ====================
            // SAVE ORDER TO FIREBASE
            // ====================

            try {

                if (!window.firebaseDB) {

                    throw new Error(
                        "Firebase database is not connected."
                    );

                }


                const {
                    collection,
                    addDoc,
                    serverTimestamp
                } = await import(
                    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
                );


                const orderRef =
                    await addDoc(

                        collection(
                            window.firebaseDB,
                            "orders"
                        ),

                        {

                            orderId: orderId,

                            customerName: name,

                            phone: phone,

                            address: address,

                            items: cart,

                            total: total,

                            status: "new",

                            createdAt:
                                serverTimestamp()

                        }

                    );


                console.log(
                    "Order saved successfully:",
                    orderRef.id
                );


            } catch (error) {

                console.error(
                    "Firebase Error:",
                    error
                );


                alert(
                    "There was a problem saving the order. Please try again."
                );


                return;

            }


            // ====================
            // ORDER DETAILS
            // ====================

            let orderItems = "";


            cart.forEach(function(product) {

                const productTotal =
                    Number(product.price) *
                    Number(product.quantity);


                orderItems += `

                    <p>

                        ${product.name}

                        × ${product.quantity}

                        =

                        ${productTotal} EGP

                    </p>

                `;

            });


            // ====================
            // SHOW CONFIRMATION
            // ====================

            const orderMessage =
                document.getElementById(
                    "orderMessage"
                );


            if (orderMessage) {

                orderMessage.innerHTML = `

                    <h2>
                        Order Confirmed! ✅
                    </h2>

                    <h3>
                        Order ID: ${orderId}
                    </h3>

                    <hr>

                    <p>
                        Customer:
                        ${name}
                    </p>

                    <p>
                        Phone:
                        ${phone}
                    </p>

                    <p>
                        Address:
                        ${address}
                    </p>

                    <hr>

                    <h3>
                        Order Details
                    </h3>

                    ${orderItems}

                    <hr>

                    <h2>
                        Total:
                        ${total} EGP
                    </h2>

                    <button
                        type="button"
                        onclick="sendWhatsApp()">
                        Order on WhatsApp
                    </button>

                    <button
                        type="button"
                        onclick="newOrder()">
                        New Order
                    </button>

                `;

            }


            // ====================
            // SAVE ORDER FOR WHATSAPP
            // ====================

            window.lastOrder = {

                orderId: orderId,

                name: name,

                phone: phone,

                address: address,

                items: [...cart],

                total: total

            };


            // ====================
            // CLEAR CART AFTER ORDER
            // ====================

            cart = [];


            localStorage.removeItem(
                "cart"
            );


            displayCart();

            updateCartCount();

        }
    );

}


// ====================
// NEW ORDER
// ====================

function newOrder() {

    const nameInput =
        document.getElementById(
            "customerName"
        );


    const phoneInput =
        document.getElementById(
            "customerPhone"
        );


    const addressInput =
        document.getElementById(
            "customerAddress"
        );


    const orderMessage =
        document.getElementById(
            "orderMessage"
        );


    if (nameInput) {

        nameInput.value = "";

    }


    if (phoneInput) {

        phoneInput.value = "";

    }


    if (addressInput) {

        addressInput.value = "";

    }


    if (orderMessage) {

        orderMessage.innerHTML = "";

    }


    window.lastOrder = null;

}


// ====================
// WHATSAPP ORDER
// ====================

function sendWhatsApp() {

    const order =
        window.lastOrder;


    if (!order) {

        alert(
            "Please place an order first."
        );

        return;

    }


    // ====================
    // PRODUCTS MESSAGE
    // ====================

    let itemsMessage = "";


    order.items.forEach(function(product) {

        const productTotal =
            Number(product.price) *
            Number(product.quantity);


        itemsMessage +=
            product.name +
            " x " +
            product.quantity +
            " = " +
            productTotal +
            " EGP\n";

    });


    // ====================
    // WHATSAPP MESSAGE
    // ====================

    const message =
        "New Burger Anas Order 🍔\n\n" +

        "Order ID: " +
        order.orderId +
        "\n\n" +

        "Customer: " +
        order.name +
        "\n" +

        "Phone: " +
        order.phone +
        "\n" +

        "Address: " +
        order.address +
        "\n\n" +

        "Order Details:\n" +

        itemsMessage +

        "\nTotal: " +
        order.total +
        " EGP";


    // ====================
    // WHATSAPP NUMBER
    // ====================

    const phoneNumber =
        "201208119371";


    // ====================
    // OPEN WHATSAPP
    // ====================

    const whatsappURL =
        "https://wa.me/" +
        phoneNumber +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank"
    );

}


// ====================
// START
// ====================

displayCart();

updateCartCount();
