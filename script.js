// ==========================================================
// BURGER ANAS - MAIN SCRIPT
// CART + CUSTOMER MEMORY + ORDERS + FIREBASE
// ==========================================================


// ==========================================================
// FIREBASE
// ==========================================================

const FIREBASE_FIRESTORE_URL =
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let firebaseFunctions = null;


async function getFirebaseFunctions() {

    if (firebaseFunctions) {
        return firebaseFunctions;
    }

    firebaseFunctions = await import(
        FIREBASE_FIRESTORE_URL
    );

    return firebaseFunctions;
}


// ==========================================================
// WAIT FOR FIREBASE
// ==========================================================

async function waitForFirebaseDB(timeout = 15000) {

    const startTime = Date.now();

    while (!window.firebaseDB) {

        if (Date.now() - startTime >= timeout) {

            throw new Error(
                "Firebase DB was not initialized."
            );

        }

        await new Promise(function(resolve) {

            setTimeout(resolve, 100);

        });

    }

    return window.firebaseDB;
}


// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let cart = [];

let existingCustomer = null;

let customerSearchTimer = null;


// ==========================================================
// WHATSAPP NUMBER
// ==========================================================

const WHATSAPP_NUMBER =
    "201208119371";


// ==========================================================
// ELEMENTS
// ==========================================================

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const cartCount =
    document.getElementById("cartCount");

const clearCartButton =
    document.getElementById("clearCart");

const checkoutForm =
    document.getElementById("checkoutForm");

const customerName =
    document.getElementById("customerName");

const customerPhone =
    document.getElementById("customerPhone");

const customerAddress =
    document.getElementById("customerAddress");

const orderMessage =
    document.getElementById("orderMessage");

const placeOrderBtn =
    document.getElementById("placeOrderBtn");


// ==========================================================
// LOAD CART
// ==========================================================

try {

    const savedCart =
        localStorage.getItem("cart");

    if (savedCart) {

        const parsedCart =
            JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {

            cart = parsedCart;

        }

    }

}
catch (error) {

    console.error(
        "Cart loading error:",
        error
    );

    cart = [];

}


// ==========================================================
// NORMALIZE PHONE
// ==========================================================

function normalizePhone(phone) {

    let value =
        String(phone || "").trim();


    const arabicNumbers = {

        "٠": "0",
        "١": "1",
        "٢": "2",
        "٣": "3",
        "٤": "4",
        "٥": "5",
        "٦": "6",
        "٧": "7",
        "٨": "8",
        "٩": "9"

    };


    value = value.replace(
        /[٠-٩]/g,
        function(number) {

            return arabicNumbers[number];

        }
    );


    value = value.replace(
        /[\s\-()]/g,
        ""
    );


    // +20XXXXXXXXXX
    // -> 01XXXXXXXXX

    if (value.startsWith("+20")) {

        value =
            "0" +
            value.substring(3);

    }


    // 20XXXXXXXXXX
    // -> 01XXXXXXXXX

    if (
        value.startsWith("20") &&
        value.length === 12
    ) {

        value =
            "0" +
            value.substring(2);

    }


    return value;

}


// ==========================================================
// SHOW MESSAGE
// ==========================================================

function showMessage(
    message,
    type = "normal"
) {

    if (!orderMessage) {
        return;
    }


    orderMessage.textContent =
        message;


    orderMessage.style.display =
        "block";


    if (type === "success") {

        orderMessage.style.color =
            "#86efac";

    }
    else if (type === "error") {

        orderMessage.style.color =
            "#fca5a5";

    }
    else {

        orderMessage.style.color =
            "#ffffff";

    }

}


// ==========================================================
// CLEAR CUSTOMER STATUS MESSAGE
// ==========================================================

function clearCustomerStatusMessage() {

    const possibleSelectors = [

        "#customerMessage",
        "#customerStatus",
        "#phoneMessage",
        "#customerFoundMessage",
        ".customer-message",
        ".customer-status",
        ".phone-message",
        ".customer-status-message",
        "[data-customer-message]",
        "[data-customer-status]"

    ];


    possibleSelectors.forEach(
        function(selector) {

            const elements =
                document.querySelectorAll(
                    selector
                );


            elements.forEach(
                function(element) {

                    element.textContent =
                        "";

                    element.innerHTML =
                        "";

                    element.style.display =
                        "none";

                }
            );

        }
    );


    if (orderMessage) {

        const currentText =
            String(
                orderMessage.textContent || ""
            ).trim();


        if (
            currentText.includes(
                "This phone number belongs to an existing customer"
            )
        ) {

            orderMessage.innerHTML =
                "";

            orderMessage.textContent =
                "";

            orderMessage.style.display =
                "none";

        }

    }

}


// ==========================================================
// CREATE WHATSAPP MESSAGE
// ==========================================================

function createWhatsAppMessage(
    orderNumber,
    orderId,
    customer,
    items,
    total
) {

    let message =
        "🍔 BURGER ANAS - NEW ORDER\n\n";


    message +=
        "Order Number: #" +
        orderNumber +
        "\n";


    message +=
        "Order ID: " +
        orderId +
        "\n\n";


    message +=
        "👤 Customer Information\n";


    message +=
        "Name: " +
        customer.name +
        "\n";


    message +=
        "Phone: " +
        customer.phone +
        "\n";


    message +=
        "Address: " +
        customer.address +
        "\n\n";


    message +=
        "🛒 Order Details\n";


    items.forEach(
        function(item) {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            message +=
                "• " +
                item.name +
                " × " +
                item.quantity +
                " = " +
                itemTotal +
                " EGP\n";

        }
    );


    message +=
        "\n💰 Total: " +
        total +
        " EGP\n\n";


    message +=
        "Thank you for ordering from Burger Anas 🍔";


    return message;

}


// ==========================================================
// SEND ORDER TO WHATSAPP
// ==========================================================

function sendOrderToWhatsApp(
    orderNumber,
    orderId,
    customer,
    items,
    total
) {

    const message =
        createWhatsAppMessage(
            orderNumber,
            orderId,
            customer,
            items,
            total
        );


    const whatsappURL =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank"
    );

}


// ==========================================================
// NEW ORDER
// ==========================================================

window.newOrder =
    function() {

        if (orderMessage) {

            orderMessage.innerHTML =
                "";

            orderMessage.textContent =
                "";

            orderMessage.style.display =
                "none";

        }


        clearCustomerStatusMessage();


        clearCustomerFormWithoutMessage();


        if (checkoutForm) {

            checkoutForm.reset();

        }


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };


// ==========================================================
// CLEAR CUSTOMER FORM WITHOUT MESSAGE
// ==========================================================

function clearCustomerFormWithoutMessage() {

    if (customerName) {

        customerName.value =
            "";

    }


    if (customerPhone) {

        customerPhone.value =
            "";

    }


    if (customerAddress) {

        customerAddress.value =
            "";

    }


    existingCustomer =
        null;


    clearTimeout(
        customerSearchTimer
    );


    customerSearchTimer =
        null;


    unlockCustomerFields();

}


// ==========================================================
// SHOW ORDER DETAILS
// ==========================================================

function showOrderDetails(
    orderNumber,
    orderId,
    customer,
    items,
    total
) {

    if (!orderMessage) {
        return;
    }


    let itemsHTML = "";


    items.forEach(function(item) {

        const itemTotal =
            Number(item.price) *
            Number(item.quantity);


        itemsHTML += `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:15px;
                    padding:10px 0;
                    border-bottom:1px solid rgba(255,255,255,0.15);
                "
            >

                <div>

                    <strong>
                        ${escapeHtml(item.name)}
                    </strong>

                    <div
                        style="
                            margin-top:4px;
                            opacity:0.8;
                        "
                    >
                        ${item.quantity} × ${item.price} EGP
                    </div>

                </div>


                <strong>
                    ${itemTotal} EGP
                </strong>

            </div>

        `;

    });


    orderMessage.innerHTML = `

        <div
            style="
                margin-top:15px;
                padding:20px;
                border-radius:15px;
                background:rgba(20,30,60,0.75);
                border:1px solid rgba(255,255,255,0.2);
                color:white;
                text-align:left;
            "
        >

            <h3
                style="
                    margin-top:0;
                    color:#86efac;
                    text-align:center;
                "
            >
                ✓ Order placed successfully!
            </h3>


            <div
                style="
                    text-align:center;
                    margin-bottom:18px;
                    font-size:18px;
                "
            >

                <strong>
                    Order #${escapeHtml(orderNumber)}
                </strong>

                <br>

                <small>
                    ${escapeHtml(orderId)}
                </small>

            </div>


            <div
                style="
                    margin-bottom:18px;
                    padding:12px;
                    background:rgba(255,255,255,0.06);
                    border-radius:10px;
                "
            >

                <div>
                    <strong>Customer:</strong>
                    ${escapeHtml(customer.name)}
                </div>


                <div style="margin-top:6px;">
                    <strong>Phone:</strong>
                    ${escapeHtml(customer.phone)}
                </div>


                <div style="margin-top:6px;">
                    <strong>Address:</strong>
                    ${escapeHtml(customer.address)}
                </div>

            </div>


            <h4
                style="
                    margin-bottom:5px;
                "
            >
                Order Details
            </h4>


            <div>
                ${itemsHTML}
            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    margin-top:18px;
                    padding-top:15px;
                    border-top:2px solid rgba(255,255,255,0.2);
                    font-size:20px;
                "
            >

                <strong>
                    Total
                </strong>


                <strong
                    style="color:#ffd21f;"
                >
                    ${total} EGP
                </strong>

            </div>


            <!-- WHATSAPP BUTTON -->

            <button
                type="button"
                onclick="sendCurrentOrderToWhatsApp()"
                style="
                    width:100%;
                    margin-top:20px;
                    padding:13px;
                    border:none;
                    border-radius:10px;
                    background:#25D366;
                    color:white;
                    font-size:16px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                📱 Send Order to WhatsApp
            </button>


            <!-- NEW ORDER BUTTON -->

            <button
                type="button"
                onclick="newOrder()"
                style="
                    width:100%;
                    margin-top:10px;
                    padding:13px;
                    border:none;
                    border-radius:10px;
                    background:#ffd21f;
                    color:#111827;
                    font-size:16px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                🍔 New Order
            </button>


            <div
                style="
                    margin-top:15px;
                    text-align:center;
                    color:#86efac;
                "
            >
                Thank you for ordering from Burger Anas 🍔
            </div>

        </div>

    `;


    orderMessage.style.display =
        "block";


    // ======================================================
    // SAVE CURRENT ORDER FOR WHATSAPP BUTTON
    // ======================================================

    window.currentOrderForWhatsApp = {

        orderNumber:
            orderNumber,

        orderId:
            orderId,

        customer:
            customer,

        items:
            items,

        total:
            total

    };

}


// ==========================================================
// SEND CURRENT ORDER TO WHATSAPP
// ==========================================================

window.sendCurrentOrderToWhatsApp =
    function() {

        const order =
            window.currentOrderForWhatsApp;


        if (!order) {

            return;

        }


        sendOrderToWhatsApp(
            order.orderNumber,
            order.orderId,
            order.customer,
            order.items,
            order.total
        );

    };


// ==========================================================
// UPDATE CART COUNT
// ==========================================================

function updateCartCount() {

    let count = 0;


    cart.forEach(function(item) {

        count +=
            Number(item.quantity) || 0;

    });


    if (cartCount) {

        cartCount.textContent =
            count;

    }

}


// ==========================================================
// SAVE CART
// ==========================================================

function saveCart() {

    try {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    }
    catch (error) {

        console.error(
            "Cart save error:",
            error
        );

    }


    updateCartCount();

}


// ==========================================================
// ADD TO CART
// ==========================================================

window.addToCart =
    function(name, price) {

        const existingItem =
            cart.find(function(item) {

                return item.name === name;

            });


        if (existingItem) {

            existingItem.quantity =
                Number(existingItem.quantity) + 1;

        }
        else {

            cart.push({

                name:
                    String(name),

                price:
                    Number(price) || 0,

                quantity:
                    1

            });

        }


        saveCart();

        renderCart();

    };


// ==========================================================
// REMOVE FROM CART
// ==========================================================

window.removeFromCart =
    function(index) {

        if (
            index < 0 ||
            index >= cart.length
        ) {

            return;

        }


        cart.splice(
            index,
            1
        );


        saveCart();

        renderCart();

    };


// ==========================================================
// CHANGE QUANTITY
// ==========================================================

window.changeQuantity =
    function(index, amount) {

        if (!cart[index]) {
            return;
        }


        cart[index].quantity =
            Number(cart[index].quantity) +
            Number(amount);


        if (
            cart[index].quantity <= 0
        ) {

            cart.splice(
                index,
                1
            );

        }


        saveCart();

        renderCart();

    };


// ==========================================================
// INCREASE
// ==========================================================

window.increaseQuantity =
    function(index) {

        window.changeQuantity(
            index,
            1
        );

    };


// ==========================================================
// DECREASE
// ==========================================================

window.decreaseQuantity =
    function(index) {

        window.changeQuantity(
            index,
            -1
        );

    };


// ==========================================================
// CALCULATE TOTAL
// ==========================================================

function calculateCartTotal() {

    let total = 0;


    cart.forEach(function(item) {

        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 0;


        total +=
            price * quantity;

    });


    return total;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================================
// RENDER CART
// ==========================================================

function renderCart() {

    if (!cartItems) {

        updateCartCount();

        return;

    }


    cartItems.innerHTML =
        "";


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p>
                Your cart is empty.
            </p>
        `;


        if (cartTotal) {

            cartTotal.textContent =
                "0";

        }


        updateCartCount();

        return;

    }


    cart.forEach(function(item, index) {

        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 0;


        const itemTotal =
            price * quantity;


        const itemElement =
            document.createElement("div");


        itemElement.className =
            "cart-item";


        itemElement.innerHTML = `

            <div>

                <strong>
                    ${escapeHtml(item.name)}
                </strong>

                <div>
                    ${price} EGP × ${quantity}
                </div>

            </div>


            <div>

                <strong>
                    ${itemTotal} EGP
                </strong>

                <br>


                <button
                    type="button"
                    onclick="decreaseQuantity(${index})"
                >
                    −
                </button>


                <button
                    type="button"
                    onclick="increaseQuantity(${index})"
                >
                    +
                </button>


                <button
                    type="button"
                    onclick="removeFromCart(${index})"
                >
                    Remove
                </button>

            </div>

        `;


        cartItems.appendChild(
            itemElement
        );

    });


    if (cartTotal) {

        cartTotal.textContent =
            calculateCartTotal();

    }


    updateCartCount();

}


// ==========================================================
// CLEAR CART
// ==========================================================

if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        function() {

            cart = [];

            saveCart();

            renderCart();

        }
    );

}


// ==========================================================
// LOCK CUSTOMER FIELDS
// ==========================================================

function lockCustomerFields() {

    if (customerName) {

        customerName.readOnly =
            true;

        customerName.style.opacity =
            "0.7";

        customerName.style.cursor =
            "not-allowed";

    }


    if (customerAddress) {

        customerAddress.readOnly =
            true;

        customerAddress.style.opacity =
            "0.7";

        customerAddress.style.cursor =
            "not-allowed";

    }

}


// ==========================================================
// UNLOCK CUSTOMER FIELDS
// ==========================================================

function unlockCustomerFields() {

    if (customerName) {

        customerName.readOnly =
            false;

        customerName.style.opacity =
            "1";

        customerName.style.cursor =
            "text";

    }


    if (customerAddress) {

        customerAddress.readOnly =
            false;

        customerAddress.style.opacity =
            "1";

        customerAddress.style.cursor =
            "text";

    }

}


// ==========================================================
// CUSTOMER FOUND
// ==========================================================

function showCustomerFound() {

    showMessage(
        "✓ This phone number belongs to an existing customer. Saved data has been loaded.",
        "success"
    );

}


// ==========================================================
// NEW CUSTOMER
// ==========================================================

function showNewCustomer() {

    showMessage(
        "New customer. Please enter your name and address.",
        "normal"
    );

}


// ==========================================================
// FIND CUSTOMER BY PHONE
// ==========================================================

async function findCustomerByPhone(phone) {

    const normalizedPhone =
        normalizePhone(phone);


    if (
        normalizedPhone.length < 10
    ) {

        existingCustomer =
            null;

        unlockCustomerFields();

        return;

    }


    try {

        const db =
            await waitForFirebaseDB();


        const {
            collection,
            query,
            where,
            getDocs
        } =
            await getFirebaseFunctions();


        const customersRef =
            collection(
                db,
                "customers"
            );


        const q =
            query(
                customersRef,
                where(
                    "normalizedPhone",
                    "==",
                    normalizedPhone
                )
            );


        const snapshot =
            await getDocs(q);


        if (
            !snapshot.empty
        ) {

            const customerDoc =
                snapshot.docs[0];


            const data =
                customerDoc.data();


            existingCustomer = {

                id:
                    customerDoc.id,

                ...data

            };


            if (customerName) {

                customerName.value =
                    data.name ||
                    data.customerName ||
                    "";

            }


            if (customerAddress) {

                customerAddress.value =
                    data.address ||
                    "";

            }


            lockCustomerFields();


            showCustomerFound();


            return;

        }


        existingCustomer =
            null;


        unlockCustomerFields();


        showNewCustomer();

    }
    catch (error) {

        console.error(
            "Customer search error:",
            error
        );

    }

}


// ==========================================================
// PHONE INPUT
// ==========================================================

if (customerPhone) {

    customerPhone.addEventListener(
        "input",
        function() {

            clearTimeout(
                customerSearchTimer
            );


            existingCustomer =
                null;


            unlockCustomerFields();


            customerSearchTimer =
                setTimeout(
                    function() {

                        findCustomerByPhone(
                            customerPhone.value
                        );

                    },
                    500
                );

        }
    );

}


// ==========================================================
// GET OR CREATE CUSTOMER
// ==========================================================

async function getOrCreateCustomer() {

    const db =
        await waitForFirebaseDB();


    const {
        collection,
        query,
        where,
        getDocs,
        doc,
        getDoc,
        setDoc,
        serverTimestamp
    } =
        await getFirebaseFunctions();


    const name =
        customerName
            ? customerName.value.trim()
            : "";


    const phone =
        customerPhone
            ? customerPhone.value.trim()
            : "";


    const address =
        customerAddress
            ? customerAddress.value.trim()
            : "";


    const normalizedPhone =
        normalizePhone(phone);


    if (!phone) {

        throw new Error(
            "Please enter your phone number."
        );

    }


    if (
        normalizedPhone.length < 10
    ) {

        throw new Error(
            "Please enter a valid phone number."
        );

    }


    // ======================================================
    // EXISTING CUSTOMER
    // ======================================================

    if (existingCustomer) {

        return {

            id:
                existingCustomer.id,

            name:
                existingCustomer.name ||
                existingCustomer.customerName ||
                "",

            phone:
                existingCustomer.phone ||
                phone,

            normalizedPhone:
                existingCustomer.normalizedPhone ||
                normalizedPhone,

            address:
                existingCustomer.address ||
                ""

        };

    }


    // ======================================================
    // FINAL DUPLICATE CHECK
    // ======================================================

    const customersRef =
        collection(
            db,
            "customers"
        );


    const q =
        query(
            customersRef,
            where(
                "normalizedPhone",
                "==",
                normalizedPhone
            )
        );


    const snapshot =
        await getDocs(q);


    if (
        !snapshot.empty
    ) {

        const customerDoc =
            snapshot.docs[0];


        const data =
            customerDoc.data();


        existingCustomer = {

            id:
                customerDoc.id,

            ...data

        };


        if (customerName) {

            customerName.value =
                data.name ||
                data.customerName ||
                "";

        }


        if (customerAddress) {

            customerAddress.value =
                data.address ||
                "";

        }


        lockCustomerFields();


        return {

            id:
                customerDoc.id,

            name:
                data.name ||
                data.customerName ||
                "",

            phone:
                data.phone ||
                phone,

            normalizedPhone:
                data.normalizedPhone ||
                normalizedPhone,

            address:
                data.address ||
                ""

        };

    }


    // ======================================================
    // NEW CUSTOMER
    // ======================================================

    if (!name) {

        throw new Error(
            "Please enter your name."
        );

    }


    if (!address) {

        throw new Error(
            "Please enter your address."
        );

    }


    const customerDocRef =
        doc(
            db,
            "customers",
            normalizedPhone
        );


    const customerDoc =
        await getDoc(
            customerDocRef
        );


    if (
        customerDoc.exists()
    ) {

        const data =
            customerDoc.data();


        existingCustomer = {

            id:
                customerDoc.id,

            ...data

        };


        if (customerName) {

            customerName.value =
                data.name ||
                data.customerName ||
                "";

        }


        if (customerAddress) {

            customerAddress.value =
                data.address ||
                "";

        }


        lockCustomerFields();


        return {

            id:
                customerDoc.id,

            name:
                data.name ||
                data.customerName ||
                "",

            phone:
                data.phone ||
                phone,

            normalizedPhone:
                data.normalizedPhone ||
                normalizedPhone,

            address:
                data.address ||
                ""

        };

    }


    const customerData = {

        name:
            name,

        phone:
            phone,

        normalizedPhone:
            normalizedPhone,

        address:
            address,

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    await setDoc(
        customerDocRef,
        customerData
    );


    existingCustomer = {

        id:
            normalizedPhone,

        ...customerData

    };


    return {

        id:
            normalizedPhone,

        name:
            name,

        phone:
            phone,

        normalizedPhone:
            normalizedPhone,

        address:
            address

    };

}


// ==========================================================
// GET NEXT ORDER NUMBER
// ==========================================================

async function getNextOrderNumber() {

    const db =
        await waitForFirebaseDB();


    const {
        doc,
        runTransaction
    } =
        await getFirebaseFunctions();


    const counterRef =
        doc(
            db,
            "counters",
            "orders"
        );


    const nextNumber =
        await runTransaction(
            db,
            async function(transaction) {

                const counterSnapshot =
                    await transaction.get(
                        counterRef
                    );


                let lastNumber =
                    0;


                if (
                    counterSnapshot.exists()
                ) {

                    const data =
                        counterSnapshot.data();


                    lastNumber =
                        Number(
                            data.lastNumber
                        ) || 0;

                }


                const newNumber =
                    lastNumber + 1;


                transaction.set(
                    counterRef,
                    {

                        lastNumber:
                            newNumber

                    },
                    {

                        merge:
                            true

                    }
                );


                return newNumber;

            }
        );


    return nextNumber;

}


// ==========================================================
// CREATE ORDER ID
// ==========================================================

function createOrderId(orderNumber) {

    return (
        "BA-" +
        String(orderNumber).padStart(
            6,
            "0"
        )
    );

}


// ==========================================================
// CLEAR CUSTOMER FORM AFTER SUCCESSFUL ORDER
// ==========================================================

function clearCustomerForm() {

    clearCustomerStatusMessage();


    if (customerName) {

        customerName.value =
            "";

    }


    if (customerPhone) {

        customerPhone.value =
            "";

    }


    if (customerAddress) {

        customerAddress.value =
            "";

    }


    existingCustomer =
        null;


    clearTimeout(
        customerSearchTimer
    );


    customerSearchTimer =
        null;


    unlockCustomerFields();

}


// ==========================================================
// CLEAR CART AFTER SUCCESSFUL ORDER
// ==========================================================

function clearCartAfterSuccessfulOrder() {

    cart = [];


    try {

        localStorage.removeItem(
            "cart"
        );

    }
    catch (error) {

        console.error(
            "Cart localStorage clear error:",
            error
        );

    }


    try {

        localStorage.setItem(
            "cart",
            JSON.stringify([])
        );

    }
    catch (error) {

        console.error(
            "Cart localStorage reset error:",
            error
        );

    }


    renderCart();

    updateCartCount();

}


// ==========================================================
// PLACE ORDER
// ==========================================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==================================================
            // CART CHECK
            // ==================================================

            if (
                cart.length === 0
            ) {

                showMessage(
                    "Your cart is empty.",
                    "error"
                );

                return;

            }


            try {

                // ==================================================
                // DISABLE BUTTON
                // ==================================================

                if (placeOrderBtn) {

                    placeOrderBtn.disabled =
                        true;

                    placeOrderBtn.textContent =
                        "Placing Order...";

                }


                showMessage(
                    "Checking customer information...",
                    "normal"
                );


                // ==================================================
                // FIREBASE
                // ==================================================

                const db =
                    await waitForFirebaseDB();


                const {
                    doc,
                    setDoc,
                    serverTimestamp
                } =
                    await getFirebaseFunctions();


                // ==================================================
                // CUSTOMER
                // ==================================================

                const customer =
                    await getOrCreateCustomer();


                // ==================================================
                // ORDER NUMBER
                // ==================================================

                const orderNumber =
                    await getNextOrderNumber();


                // ==================================================
                // ORDER ID
                // ==================================================

                const orderId =
                    createOrderId(
                        orderNumber
                    );


                // ==================================================
                // TOTAL
                // ==================================================

                const total =
                    calculateCartTotal();


                // ==================================================
                // ITEMS
                // ==================================================

                const items =
                    cart.map(
                        function(item) {

                            return {

                                name:
                                    String(
                                        item.name
                                    ),

                                price:
                                    Number(
                                        item.price
                                    ) || 0,

                                quantity:
                                    Number(
                                        item.quantity
                                    ) || 0

                            };

                        }
                    );


                // ==================================================
                // ORDER DATA
                // ==================================================

                const orderData = {

                    orderId:
                        orderId,

                    orderNumber:
                        orderNumber,

                    customerId:
                        customer.id,

                    customerName:
                        customer.name,

                    phone:
                        customer.phone,

                    customerNormalizedPhone:
                        customer.normalizedPhone,

                    address:
                        customer.address,

                    items:
                        items,

                    total:
                        total,

                    status:
                        "new",

                    createdAt:
                        serverTimestamp()

                };


                // ==================================================
                // SAVE ORDER
                // ==================================================

                const orderRef =
                    doc(
                        db,
                        "orders",
                        orderId
                    );


                await setDoc(
                    orderRef,
                    orderData
                );


                // ==================================================
                // UPDATE CUSTOMER
                // ==================================================

                const customerRef =
                    doc(
                        db,
                        "customers",
                        customer.id
                    );


                await setDoc(
                    customerRef,
                    {

                        lastOrderId:
                            orderId,

                        lastOrderNumber:
                            orderNumber,

                        updatedAt:
                            serverTimestamp(),

                        lastOrderAt:
                            serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );


                // ==================================================
                // LOG
                // ==================================================

                console.log(
                    "================================"
                );

                console.log(
                    "ORDER SAVED SUCCESSFULLY"
                );

                console.log(
                    "Order ID:",
                    orderId
                );

                console.log(
                    "Order Number:",
                    orderNumber
                );

                console.log(
                    "Customer:",
                    customer
                );

                console.log(
                    "Items:",
                    items
                );

                console.log(
                    "Total:",
                    total
                );

                console.log(
                    "================================"
                );


                // ==================================================
                // CLEAR CUSTOMER MESSAGE + FORM
                // ==================================================

                clearCustomerForm();


                // ==================================================
                // CLEAR CART
                // ==================================================

                clearCartAfterSuccessfulOrder();


                // ==================================================
                // SHOW COMPLETE ORDER TO CUSTOMER
                // ==================================================

                showOrderDetails(
                    orderNumber,
                    orderId,
                    customer,
                    items,
                    total
                );


                // ==================================================
                // FINAL STATE
                // ==================================================

                existingCustomer =
                    null;

            }
            catch (error) {

                console.error(
                    "================================"
                );

                console.error(
                    "PLACE ORDER ERROR:",
                    error
                );

                console.error(
                    "================================"
                );


                showMessage(
                    "Error placing order: " +
                    error.message,
                    "error"
                );

            }
            finally {

                if (placeOrderBtn) {

                    placeOrderBtn.disabled =
                        false;

                    placeOrderBtn.textContent =
                        "Place Order";

                }

            }

        }
    );

}


// ==========================================================
// VIEW MENU
// ==========================================================

const viewMenu =
    document.getElementById(
        "viewMenu"
    );


if (viewMenu) {

    viewMenu.addEventListener(
        "click",
        function() {

            const menu =
                document.getElementById(
                    "menu"
                );


            if (menu) {

                menu.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// ==========================================================
// STORAGE EVENT
// ==========================================================

window.addEventListener(
    "storage",
    function() {

        try {

            const savedCart =
                localStorage.getItem(
                    "cart"
                );


            cart =
                savedCart
                    ? JSON.parse(savedCart)
                    : [];


            if (
                !Array.isArray(cart)
            ) {

                cart = [];

            }

        }
        catch (error) {

            cart = [];

        }


        renderCart();

        updateCartCount();

    }
);


// ==========================================================
// INITIALIZE
// ==========================================================

renderCart();

updateCartCount();


// ==========================================================
// FIREBASE STATUS
// ==========================================================

waitForFirebaseDB()
    .then(function() {

        console.log(
            "✓ Firebase DB connected successfully."
        );

    })
    .catch(function(error) {

        console.error(
            "Firebase connection error:",
            error
        );

    });
