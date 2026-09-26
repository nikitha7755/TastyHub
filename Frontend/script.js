let allFoods = [];
let allRestaurants = [];


/* =====================================================
   API + LOGGED-IN USER
===================================================== */

const API_BASE_URL = "http://127.0.0.1:5000";

const accessToken =
    localStorage.getItem("access_token");

const currentUserId =
    localStorage.getItem("user_id");

const currentUserName =
    localStorage.getItem("user_name");

const currentUserEmail =
    localStorage.getItem("user_email");


/* =====================================================
   LOGIN CHECK
===================================================== */

if (!accessToken || !currentUserId) {

    window.location.href =
        `${API_BASE_URL}/login.html`;
}


/* =====================================================
   COMMON AUTH HEADERS
===================================================== */

function getAuthHeaders(includeJSON = false) {

    const token =
        localStorage.getItem("access_token");

    const headers = {
        "Authorization": `Bearer ${token}`
    };

    if (includeJSON) {
        headers["Content-Type"] =
            "application/json";
    }

    return headers;
}


/* =====================================================
   HELPER FUNCTIONS
===================================================== */

function formatPrice(price) {

    return Number(price || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   FOOD IMAGES
===================================================== */

const foodImages = {

    "Chicken Biryani":
        "https://static.vecteezy.com/system/resources/previews/035/375/552/large_2x/ai-generated-chicken-biryani-kerala-style-chicken-dhum-biriyani-made-using-jeera-rice-and-spices-arranged-in-a-brass-serving-bowl-photo.jpg",

    "Veg Biryani":
        "https://genv.org/wp-content/uploads/2023/02/17-Vegetable-Biryani.jpg",

    "Paneer Butter Masala":
        "https://www.cookwithmanali.com/wp-content/uploads/2019/05/Paneer-Butter-Masala-Recipe.jpg",

    "Masala Dosa":
        "https://www.clubmahindra.com/blog/images/Masala-Dosa1.jpg",

    "Chicken 65 Special":
        "https://swatisani.net/kitchen/wp-content/uploads/2014/11/1200px-Chicken_65_Dish.jpg",

    "Chicken 65":
        "https://masalaandchai.com/wp-content/uploads/2021/10/Restaurant-Style-Chicken-65.jpg",

    "Test Burger":
        "https://images3.alphacoders.com/131/thumb-1920-1313839.jpg",

    "Paneer Tikka":
        "https://tse2.mm.bing.net/th/id/OIP.QaHs9LAbRVrXky-Jts53nQHaEO?r=0&pid=Api&h=220&P=0",

    "Paneer Roll":
        "https://rollsbar.com/wp-content/uploads/2025/06/paneer-tikka-classic.jpg",

    "Test Food":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhNDJEfohnaJ0u_5pXBsh7kZ152eOL6-bY1KqBfgbiSX5CfdrXDLTR3YI6zOTgdfmUsd6tx1b3ATf3pkOykZwyI6vBnewYTs9Ty7GoWA69Xflviywdq5f5RP7xeXAd_oRMSeLJ75h6FVP1GKmtZTDvZBLgEK8b5ysC3N-inuvadsGZ3u44yPY-p1rWuhM7j/w1200-h630-p-k-no-nu/file-SLLuVTKkCFLcaoAe88BWgo.webp"
};


/* =====================================================
   RESTAURANT IMAGES
===================================================== */

function getRestaurantImage(restaurant) {

    const restaurantImages = {

        "Paradise":
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",

        "Food Palace":
            "https://i.pinimg.com/originals/86/e8/07/86e80742839ba0d3e5cb0309d3062b48.jpg",

        "Udupi Restaurant":
            "https://www.hoteldolphingrand.com/upload/gallery/1692177227988700747.png",

        "Burger House":
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",

        "Spice Kitchen":
            "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80"
    };

    return (
        restaurantImages[restaurant.name] ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
    );
}


/* =====================================================
   FETCH RESTAURANTS
===================================================== */

async function loadRestaurants() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/restaurants`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch restaurants"
            );
        }

        const data =
            await response.json();

        console.log(
            "Restaurants:",
            data
        );

        allRestaurants =
            data.restaurants || [];

        displayRestaurants(
            allRestaurants
        );

    } catch (error) {

        console.error(
            "Restaurant API error:",
            error
        );

        const restaurantList =
            document.getElementById(
                "restaurant-list"
            );

        if (restaurantList) {

            restaurantList.innerHTML = `
                <div class="empty-message">
                    ❌ Unable to load restaurants.
                </div>
            `;
        }
    }
}


/* =====================================================
   DISPLAY RESTAURANTS
===================================================== */

function displayRestaurants(restaurants) {

    const restaurantList =
        document.getElementById(
            "restaurant-list"
        );

    if (!restaurantList) {
        return;
    }

    restaurantList.innerHTML = "";

    if (
        !restaurants ||
        restaurants.length === 0
    ) {

        restaurantList.innerHTML = `
            <div class="empty-message">
                😔 No restaurants found.
            </div>
        `;

        return;
    }

    restaurants.forEach(
        restaurant => {

            const restaurantCard =
                document.createElement(
                    "div"
                );

            restaurantCard.className =
                "restaurant-card";

            const image =
                getRestaurantImage(
                    restaurant
                );

            restaurantCard.innerHTML = `

                <img
                    class="restaurant-image"
                    src="${image}"
                    alt="${escapeHTML(
                        restaurant.name
                    )}"
                    onerror="
                        this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'
                    "
                >

                <div class="restaurant-content">

                    <h3>
                        🍽️
                        ${escapeHTML(
                            restaurant.name
                        )}
                    </h3>

                    <div class="restaurant-info">

                        <span>
                            ${escapeHTML(
                                restaurant.cuisine ||
                                "Multi Cuisine"
                            )}
                        </span>

                        <span class="rating">
                            ⭐
                            ${restaurant.rating || "N/A"}
                        </span>

                    </div>

                    <div class="restaurant-info">

                        <span>
                            📍
                            ${escapeHTML(
                                restaurant.location ||
                                "N/A"
                            )}
                        </span>

                        <span>
                            🕒 25-35 min
                        </span>

                    </div>

                </div>
            `;

            restaurantList.appendChild(
                restaurantCard
            );
        }
    );
}


/* =====================================================
   RESTAURANT SEARCH
===================================================== */

function filterRestaurants() {

    const searchInput =
        document.getElementById(
            "restaurant-search"
        );

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    const filteredRestaurants =
        allRestaurants.filter(
            restaurant => {

                const name =
                    String(
                        restaurant.name || ""
                    ).toLowerCase();

                const cuisine =
                    String(
                        restaurant.cuisine || ""
                    ).toLowerCase();

                const location =
                    String(
                        restaurant.location || ""
                    ).toLowerCase();

                return (
                    name.includes(
                        searchText
                    ) ||
                    cuisine.includes(
                        searchText
                    ) ||
                    location.includes(
                        searchText
                    )
                );
            }
        );

    displayRestaurants(
        filteredRestaurants
    );
}


/* =====================================================
   FETCH FOOD ITEMS
===================================================== */

async function loadFoods() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/food-items`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch food items"
            );
        }

        const data =
            await response.json();

        console.log(
            "Food Items:",
            data
        );

        allFoods =
            data.food_items || [];

        createCategoryDropdown();

        displayFoods(
            allFoods
        );

    } catch (error) {

        console.error(
            "Food API error:",
            error
        );

        const foodList =
            document.getElementById(
                "food-list"
            );

        if (foodList) {

            foodList.innerHTML = `
                <div class="empty-message">
                    ❌ Unable to load food items.
                </div>
            `;
        }
    }
}


/* =====================================================
   CATEGORY DROPDOWN
===================================================== */

function createCategoryDropdown() {

    const categoryFilter =
        document.getElementById(
            "category-filter"
        );

    if (!categoryFilter) {
        return;
    }

    categoryFilter.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;

    const categories = [
        ...new Set(
            allFoods
                .map(
                    food =>
                        String(
                            food.category || ""
                        ).trim()
                )
                .filter(
                    category =>
                        category !== ""
                )
        )
    ];

    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            categoryFilter.appendChild(
                option
            );
        }
    );
}


/* =====================================================
   DISPLAY FOOD ITEMS
===================================================== */

function displayFoods(foods) {

    const foodList =
        document.getElementById(
            "food-list"
        );

    if (!foodList) {
        return;
    }

    foodList.innerHTML = "";

    if (
        !foods ||
        foods.length === 0
    ) {

        foodList.innerHTML = `
            <div class="empty-message">
                😔 No food items found.
            </div>
        `;

        return;
    }

    foods.forEach(
        food => {

            const foodCard =
                document.createElement(
                    "div"
                );

            foodCard.className =
                "food-card";

            const imageUrl =
                foodImages[food.name] ||
                "";

            foodCard.innerHTML = `

                ${
                    imageUrl
                        ? `
                            <img
                                src="${imageUrl}"
                                alt="${escapeHTML(
                                    food.name
                                )}"
                                class="food-image"
                                onerror="
                                    this.style.display='none'
                                "
                            >
                        `
                        : ""
                }

                <div class="food-card-content">

                    <h3>
                        🍴
                        ${escapeHTML(
                            food.name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            food.description || ""
                        )}
                    </p>

                    <p>
                        Category:
                        ${escapeHTML(
                            food.category ||
                            "N/A"
                        )}
                    </p>

                    <p class="food-price">
                        ₹${formatPrice(
                            food.price
                        )}
                    </p>

                    <button
                        class="add-cart-btn"
                        onclick="addToCart(
                            ${food.id}
                        )"
                    >
                        🛒 Add to Cart
                    </button>

                </div>
            `;

            foodList.appendChild(
                foodCard
            );
        }
    );
}


/* =====================================================
   FOOD SEARCH + CATEGORY FILTER
===================================================== */

function filterFoods() {

    const searchInput =
        document.getElementById(
            "food-search"
        );

    const categoryFilter =
        document.getElementById(
            "category-filter"
        );

    if (
        !searchInput ||
        !categoryFilter
    ) {
        return;
    }

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedCategory =
        categoryFilter.value
            .trim()
            .toLowerCase();

    const filteredFoods =
        allFoods.filter(
            food => {

                const foodName =
                    String(
                        food.name || ""
                    ).toLowerCase();

                const foodCategory =
                    String(
                        food.category || ""
                    )
                    .trim()
                    .toLowerCase();

                const matchesSearch =
                    foodName.includes(
                        searchText
                    ) ||
                    foodCategory.includes(
                        searchText
                    );

                const matchesCategory =
                    selectedCategory === "" ||
                    foodCategory ===
                        selectedCategory;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            }
        );

    displayFoods(
        filteredFoods
    );
}


/* =====================================================
   ADD TO CART
===================================================== */

async function addToCart(foodId) {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {

        alert(
            "Please login first."
        );

        window.location.href =
            `${API_BASE_URL}/login.html`;

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/cart`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(true),

                    body: JSON.stringify({
                        food_id:
                            Number(foodId),

                        quantity: 1
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "Add to cart response:",
            data
        );

        if (
            response.ok &&
            data.success
        ) {

            showToast(
                "Item added to cart successfully! 🛒"
            );

            await loadCart();

        } else {

            showToast(
                data.message ||
                data.msg ||
                "Failed to add item to cart.",
                true
            );
        }

    } catch (error) {

        console.error(
            "Add to cart error:",
            error
        );

        showToast(
            "Unable to connect to Flask server.",
            true
        );
    }
}


/* =====================================================
   LOAD CART
===================================================== */

async function loadCart() {

    const token =
        localStorage.getItem(
            "access_token"
        );

    const userId =
        localStorage.getItem(
            "user_id"
        );

    if (
        !token ||
        !userId
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/cart/${userId}`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );

        const data =
            await response.json();

        console.log(
            "Cart data:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.msg ||
                "Failed to load cart"
            );
        }

        const cartList =
            document.getElementById(
                "cart-list"
            );

        const cartTotal =
            document.getElementById(
                "cart-total"
            );

        if (!cartList) {
            return;
        }

        cartList.innerHTML = "";

        const cartItems =
            data.cart || [];

        updateCartBadge(
            cartItems
        );

        if (
            cartItems.length === 0
        ) {

            cartList.innerHTML = `
                <div class="empty-message">

                    🛒 Your cart is empty.

                    <br><br>

                    Add some delicious food!

                </div>
            `;

            if (cartTotal) {

                cartTotal.textContent =
                    "Total: ₹0.00";
            }

            return;
        }

        cartItems.forEach(
            item => {

                const cartCard =
                    document.createElement(
                        "div"
                    );

                cartCard.className =
                    "cart-card";

                const price =
                    Number(
                        item.price || 0
                    );

                const quantity =
                    Number(
                        item.quantity || 1
                    );

                const itemTotal =
                    Number(
                        item.item_total ||
                        price * quantity
                    );

                cartCard.innerHTML = `

                    <div class="cart-main">

                        <div class="cart-info">

                            <h3>
                                🍴
                                ${escapeHTML(
                                    item.name ||
                                    "Food Item"
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    item.restaurant_name ||
                                    "TastyHub Restaurant"
                                )}
                            </p>

                            <p>
                                ₹${formatPrice(
                                    price
                                )}
                                each
                            </p>

                        </div>


                        <div class="cart-controls">

                            <button
                                class="quantity-btn"
                                onclick="
                                    updateQuantity(
                                        ${item.id},
                                        ${quantity - 1}
                                    )
                                "
                                ${
                                    quantity <= 1
                                        ? "disabled"
                                        : ""
                                }
                            >
                                −
                            </button>


                            <span class="quantity">
                                ${quantity}
                            </span>


                            <button
                                class="quantity-btn"
                                onclick="
                                    updateQuantity(
                                        ${item.id},
                                        ${quantity + 1}
                                    )
                                "
                            >
                                +
                            </button>

                        </div>


                        <div class="item-total">

                            ₹${formatPrice(
                                itemTotal
                            )}

                        </div>

                    </div>


                    <button
                        class="remove-btn"
                        onclick="
                            removeFromCart(
                                ${item.id}
                            )
                        "
                    >
                        🗑️ Remove item
                    </button>
                `;

                cartList.appendChild(
                    cartCard
                );
            }
        );

        if (cartTotal) {

            cartTotal.textContent =
                `Total: ₹${formatPrice(
                    data.total || 0
                )}`;
        }

    } catch (error) {

        console.error(
            "Cart API error:",
            error
        );

        const cartList =
            document.getElementById(
                "cart-list"
            );

        if (cartList) {

            cartList.innerHTML = `
                <div class="empty-message">
                    ❌ Unable to load your cart.
                </div>
            `;
        }
    }
}


/* =====================================================
   CART BADGE
===================================================== */

function updateCartBadge(
    cartItems
) {

    const cartLink =
        document.querySelector(
            '.navbar a[href="#cart-list"]'
        );

    if (!cartLink) {
        return;
    }

    let badge =
        cartLink.querySelector(
            ".cart-count"
        );

    if (!badge) {

        badge =
            document.createElement(
                "span"
            );

        badge.className =
            "cart-count";

        cartLink.appendChild(
            badge
        );
    }

    const totalQuantity =
        cartItems.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    Number(
                        item.quantity
                    ) || 0
                ),
            0
        );

    badge.textContent =
        totalQuantity;

    badge.style.display =
        totalQuantity > 0
            ? "flex"
            : "none";
}


/* =====================================================
   UPDATE CART QUANTITY
===================================================== */

async function updateQuantity(
    cartId,
    newQuantity
) {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }

    if (
        newQuantity < 1
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/cart/${cartId}`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(true),

                    body: JSON.stringify({
                        quantity:
                            Number(
                                newQuantity
                            )
                    })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                data.msg ||
                "Failed to update quantity"
            );
        }

        showToast(
            "Cart updated successfully."
        );

        await loadCart();

    } catch (error) {

        console.error(
            "Quantity update error:",
            error
        );

        showToast(
            error.message ||
            "Failed to update cart.",
            true
        );
    }
}


/* =====================================================
   REMOVE FROM CART
===================================================== */

async function removeFromCart(
    cartId
) {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/cart/${cartId}`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                data.msg ||
                "Failed to remove item"
            );
        }

        showToast(
            "Item removed from cart."
        );

        await loadCart();

    } catch (error) {

        console.error(
            "Remove cart error:",
            error
        );

        showToast(
            error.message ||
            "Failed to remove item.",
            true
        );
    }
}


/* =====================================================
   PLACE ORDER
===================================================== */

async function placeOrder() {

    const token =
        localStorage.getItem(
            "access_token"
        );

    const userId =
        localStorage.getItem(
            "user_id"
        );

    if (!token || !userId) {

        alert(
            "Please login first."
        );

        return;
    }

    try {

        const cartResponse =
            await fetch(
                `${API_BASE_URL}/cart/${userId}`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );

        const cartData =
            await cartResponse.json();

        if (!cartResponse.ok) {

            throw new Error(
                cartData.message ||
                cartData.msg ||
                "Unable to check cart"
            );
        }

        const cartItems =
            cartData.cart || [];

        if (
            cartItems.length === 0
        ) {

            showToast(
                "Your cart is empty.",
                true
            );

            return;
        }

        const response =
            await fetch(
                `${API_BASE_URL}/orders`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(true),

                    body: JSON.stringify({})
                }
            );

        const data =
            await response.json();

        console.log(
            "Order response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                data.msg ||
                "Failed to place order"
            );
        }

        showToast(
            "Order placed successfully! 🎉"
        );

        await loadCart();

        await loadOrders();

    } catch (error) {

        console.error(
            "Order API error:",
            error
        );

        showToast(
            error.message ||
            "Failed to place order.",
            true
        );
    }
}


/* =====================================================
   LOAD ORDERS
===================================================== */

async function loadOrders() {

    const token =
        localStorage.getItem(
            "access_token"
        );

    const userId =
        localStorage.getItem(
            "user_id"
        );

    if (
        !token ||
        !userId
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${userId}`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );

        const data =
            await response.json();

        console.log(
            "Orders:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.msg ||
                "Failed to load orders"
            );
        }

        renderOrders(
            data.orders || []
        );

    } catch (error) {

        console.error(
            "Orders API error:",
            error
        );

        const orderList =
            document.getElementById(
                "order-list"
            );

        if (orderList) {

            orderList.innerHTML = `
                <div class="empty-message">
                    ❌ Unable to load your orders.
                </div>
            `;
        }
    }
}


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders(
    orders
) {

    const orderList =
        document.getElementById(
            "order-list"
        );

    if (!orderList) {
        return;
    }

    orderList.innerHTML = "";

    if (
        !orders ||
        orders.length === 0
    ) {

        orderList.innerHTML = `
            <div class="empty-message">
                📦 No orders found.
            </div>
        `;

        return;
    }

    orders.forEach(
        order => {

            const orderCard =
                document.createElement(
                    "div"
                );

            orderCard.className =
                "order-card";


            const status =
                String(
                    order.status ||
                    "Pending"
                );


            const paymentStatus =
                String(
                    order.payment_status ||
                    "Pending"
                );


            const statusLower =
                status.toLowerCase();


            let statusClass =
                "status-pending";


            if (
                statusLower.includes(
                    "deliver"
                )
            ) {

                statusClass =
                    "status-delivered";

            } else if (
                statusLower.includes(
                    "cancel"
                )
            ) {

                statusClass =
                    "status-cancelled";

            } else if (
                statusLower.includes(
                    "prepar"
                )
            ) {

                statusClass =
                    "status-preparing";
            }


            const isCancelled =
                statusLower.includes(
                    "cancel"
                );


            const isDelivered =
                statusLower.includes(
                    "deliver"
                );


            orderCard.innerHTML = `

                <div class="order-header">

                    <h3>
                        📦
                        Order #${order.id}
                    </h3>

                    <span
                        class="status ${statusClass}"
                    >
                        ${escapeHTML(
                            status
                        )}
                    </span>

                </div>


                <div class="order-details">

                    <span>
                        💰
                        <strong>
                            ₹${formatPrice(
                                order.total_amount
                            )}
                        </strong>
                    </span>


                    <span>
                        💳 Payment:
                        <strong>
                            ${escapeHTML(
                                paymentStatus
                            )}
                        </strong>
                    </span>


                    <span>
                        🕒
                        ${escapeHTML(
                            order.created_at ||
                            "N/A"
                        )}
                    </span>

                </div>


                <div class="order-actions">

                    ${
                        paymentStatus
                            .toLowerCase() !==
                            "paid" &&
                        !isCancelled
                            ? `
                                <button
                                    class="pay-btn"
                                    onclick="
                                        makePayment(
                                            ${order.id}
                                        )
                                    "
                                >
                                    💳 Pay Now
                                </button>
                            `
                            : ""
                    }


                    ${
                        !isCancelled &&
                        !isDelivered
                            ? `
                                <button
                                    class="cancel-btn"
                                    onclick="
                                        cancelOrder(
                                            ${order.id}
                                        )
                                    "
                                >
                                    ❌ Cancel Order
                                </button>
                            `
                            : ""
                    }


                    <button
                        class="remove-btn"
                        onclick="
                            removeOrder(
                                ${order.id}
                            )
                        "
                    >
                        🗑️ Remove
                    </button>

                </div>
            `;

            orderList.appendChild(
                orderCard
            );
        }
    );
}


/* =====================================================
   MAKE PAYMENT
===================================================== */

async function makePayment(
    orderId
) {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/payments/${orderId}`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders(true),

                    body: JSON.stringify({})
                }
            );

        const data =
            await response.json();

        console.log(
            "Payment response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                data.msg ||
                "Payment failed"
            );
        }

        showToast(
            "Payment successful! 💳"
        );

        await loadOrders();

    } catch (error) {

        console.error(
            "Payment error:",
            error
        );

        showToast(
            error.message ||
            "Payment failed.",
            true
        );
    }
}


/* =====================================================
   CANCEL ORDER
===================================================== */

async function cancelOrder(
    orderId
) {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this order?"
        );

    if (!confirmCancel) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${orderId}/status`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(true),

                    body: JSON.stringify({
                        status:
                            "Cancelled"
                    })
                }
            );

        const data =
            await response.json();

        console.log(
            "Cancel order response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                data.msg ||
                "Failed to cancel order"
            );
        }

        showToast(
            "Order cancelled successfully."
        );

        await loadOrders();

    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );

        showToast(
            error.message ||
            "Failed to cancel order.",
            true
        );
    }
}


/* =====================================================
   REMOVE ORDER
===================================================== */

async function removeOrder(
    orderId
) {

    const token =
        localStorage.getItem(
            "access_token"
        );

    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }

    const confirmRemove =
        confirm(
            "Remove this order from your order history?"
        );

    if (!confirmRemove) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${orderId}/remove`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );

        const data =
            await response.json();

        console.log(
            "Remove order response:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                data.msg ||
                "Failed to remove order"
            );
        }

        showToast(
            "Order removed successfully."
        );

        await loadOrders();

    } catch (error) {

        console.error(
            "Remove order error:",
            error
        );

        showToast(
            error.message ||
            "Failed to remove order.",
            true
        );
    }
}


/* =====================================================
   TOAST MESSAGE
===================================================== */

function showToast(
    message,
    isError = false
) {

    let toast =
        document.getElementById(
            "tasty-toast"
        );

    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "tasty-toast";

        toast.style.position =
            "fixed";

        toast.style.bottom =
            "25px";

        toast.style.right =
            "25px";

        toast.style.zIndex =
            "9999";

        toast.style.padding =
            "14px 20px";

        toast.style.borderRadius =
            "10px";

        toast.style.color =
            "white";

        toast.style.fontWeight =
            "600";

        toast.style.boxShadow =
            "0 8px 25px rgba(0,0,0,0.18)";

        document.body.appendChild(
            toast
        );
    }

    toast.textContent =
        message;

    toast.style.background =
        isError
            ? "#d32f2f"
            : "#ff6b35";

    toast.style.display =
        "block";

    clearTimeout(
        toast.timeout
    );

    toast.timeout =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

            },
            2500
        );
}


/* =====================================================
   WELCOME MESSAGE
===================================================== */

function showWelcomeMessage() {

    const welcomeMessage =
        document.getElementById(
            "welcome-message"
        );

    if (!welcomeMessage) {
        return;
    }

    welcomeMessage.textContent =
        `Welcome to TastyHub, ${
            currentUserName ||
            "User"
        }! 🍴`;
}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            '.navbar a[href^="#"]'
        );

    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                function(event) {

                    const targetId =
                        this.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior:
                            "smooth"
                    });
                }
            );
        }
    );
}


/* =====================================================
   SEARCH EVENT LISTENERS
===================================================== */

function setupSearchListeners() {

    const restaurantSearch =
        document.getElementById(
            "restaurant-search"
        );

    if (restaurantSearch) {

        restaurantSearch.addEventListener(
            "input",
            filterRestaurants
        );
    }

    const foodSearch =
        document.getElementById(
            "food-search"
        );

    if (foodSearch) {

        foodSearch.addEventListener(
            "input",
            filterFoods
        );
    }

    const categoryFilter =
        document.getElementById(
            "category-filter"
        );

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            filterFoods
        );
    }
}


/* =====================================================
   CART / ORDER BUTTONS
===================================================== */

function setupActionButtons() {

    const placeOrderButton =
        document.getElementById(
            "place-order-btn"
        );

    if (placeOrderButton) {

        placeOrderButton.addEventListener(
            "click",
            placeOrder
        );
    }

    const checkoutButton =
        document.getElementById(
            "checkout-btn"
        );

    if (
        checkoutButton &&
        checkoutButton !== placeOrderButton
    ) {

        checkoutButton.addEventListener(
            "click",
            placeOrder
        );
    }
}


/* =====================================================
   PAGE INITIALIZATION
===================================================== */

async function initializePage() {

    showWelcomeMessage();

    setupNavigation();

    setupSearchListeners();

    setupActionButtons();

    await loadRestaurants();

    await loadFoods();

    await loadCart();

    await loadOrders();
}


/* =====================================================
   START APPLICATION
===================================================== */

initializePage();