/* =====================================================
   TASTYHUB PROFILE PAGE
===================================================== */

const API_BASE_URL = "http://127.0.0.1:5000";


/* =====================================================
   AUTH
===================================================== */

function getToken() {
    return localStorage.getItem("access_token");
}


function getAuthHeaders(includeJSON = false) {

    const token = getToken();

    const headers = {
        "Authorization": `Bearer ${token}`
    };

    if (includeJSON) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


/* =====================================================
   LOGIN CHECK
===================================================== */

function checkLogin() {

    const token =
        localStorage.getItem("access_token");

    const userId =
        localStorage.getItem("user_id");

    if (!token || !userId) {

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


/* =====================================================
   HTML ESCAPE
===================================================== */

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
   FORMAT PRICE
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


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateValue) {

    if (!dateValue) {
        return "N/A";
    }

    try {

        return new Date(
            dateValue
        ).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    } catch (error) {

        return String(dateValue);
    }
}


/* =====================================================
   HANDLE AUTH ERROR
===================================================== */

function handleAuthError(data) {

    const message =
        data?.msg ||
        data?.message ||
        "";

    if (
        message.toLowerCase().includes(
            "token has expired"
        ) ||
        message.toLowerCase().includes(
            "expired"
        ) ||
        message.toLowerCase().includes(
            "token is missing"
        ) ||
        message.toLowerCase().includes(
            "invalid token"
        )
    ) {

        localStorage.removeItem(
            "access_token"
        );

        alert(
            "Your login session has expired. Please login again."
        );

        window.location.href =
            "login.html";

        return true;
    }

    return false;
}


/* =====================================================
   LOAD PROFILE
===================================================== */

async function loadProfile() {

    const profileInfo =
        document.getElementById(
            "profile-info"
        );

    const ordersContainer =
        document.getElementById(
            "profile-orders-list"
        );


    if (!profileInfo) {
        return;
    }


    const token = getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    profileInfo.innerHTML = `

        <div class="profile-loading">

            <div class="loading-spinner"></div>

            <p>
                Loading your profile...
            </p>

        </div>

    `;


    if (ordersContainer) {

        ordersContainer.innerHTML = `

            <div class="profile-loading">

                <div class="loading-spinner"></div>

                <p>
                    Loading your order history...
                </p>

            </div>

        `;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/my-profile`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        console.log(
            "Profile API response:",
            data
        );


        /* -----------------------------------------
           TOKEN ERROR
        ----------------------------------------- */

        if (
            handleAuthError(data)
        ) {
            return;
        }


        if (!response.ok) {

            throw new Error(
                data.msg ||
                data.message ||
                "Failed to load profile"
            );
        }


        if (!data.success) {

            throw new Error(
                data.msg ||
                data.message ||
                "Unable to load profile"
            );
        }


        const user =
            data.user || {};


        /* -----------------------------------------
           UPDATE LOCAL STORAGE
        ----------------------------------------- */

        if (user.id) {

            localStorage.setItem(
                "user_id",
                user.id
            );
        }


        if (user.name) {

            localStorage.setItem(
                "user_name",
                user.name
            );
        }


        if (user.email) {

            localStorage.setItem(
                "user_email",
                user.email
            );
        }


        if (user.role) {

            localStorage.setItem(
                "user_role",
                user.role
            );
        }


        /* -----------------------------------------
           PROFILE CARD
        ----------------------------------------- */

        profileInfo.innerHTML = `

            <div class="professional-profile-card">

                <div class="profile-cover">

                    <div class="profile-avatar-large">
                        👤
                    </div>

                </div>


                <div class="profile-main-info">

                    <div class="profile-name-section">

                        <h2>
                            ${escapeHTML(
                                user.name || "TastyHub User"
                            )}
                        </h2>

                        <span class="profile-role-badge">
                            ${escapeHTML(
                                user.role || "User :" 
                            )}
                        </span>

                    </div>


                    <p class="profile-email">

                        

                        ${escapeHTML(
                            user.email ||
                            "Nikitha"
                        )}

                    </p>

                </div>


                <div class="profile-info-grid">

                    <div class="profile-info-box">

                        <span class="info-icon">
                        </span>

                        <div>

                            <small>
                                   Username :
                            </small>

                            <strong>
                                ${escapeHTML(
                                    user.name ||
                                    "User"
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="profile-info-box">

                        <span class="info-icon">
                        </span>

                        <div>

                            <small>
                                Email :
                            </small>

                            <strong>
                                ${escapeHTML(
                                    user.email ||
                                    "nikithahanna17@gmail.com"
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="profile-info-box">

                        <span class="info-icon">
                           
                        </span>

                        <div>

                            <small>
                                Account Type :
                            </small>

                            <strong>
                                ${escapeHTML(
                                    user.role ||
                                    "User"
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        `;


        /* -----------------------------------------
           ORDERS
        ----------------------------------------- */

        const orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        renderOrders(orders);


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );


        profileInfo.innerHTML = `

            <div class="profile-error">

                <div class="error-icon">
                    ❌
                </div>

                <h3>
                    Unable to load profile
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <button
                    class="retry-btn"
                    onclick="loadProfile()"
                >
                    🔄 Try Again
                </button>

            </div>

        `;


        if (ordersContainer) {

            ordersContainer.innerHTML = `

                <div class="profile-error small-error">

                    <p>
                        ❌ Unable to load order history.
                    </p>

                </div>

            `;
        }
    }
}


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders(orders) {

    const container =
        document.getElementById(
            "profile-orders-list"
        );


    if (!container) {
        return;
    }


    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    🛍️
                </div>

                <h3>
                    No Orders Yet
                </h3>

                <p>
                    You haven't placed any orders yet.
                </p>

                <a
                    href="index.html"
                    class="browse-food-btn"
                >
                    🍔 Browse Food
                </a>

            </div>

        `;

        return;
    }


    container.innerHTML =
        orders.map(
            order => {

                const total =
                    formatPrice(
                        order.total_amount
                    );


                const orderStatus =
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
                    orderStatus.toLowerCase();


                const paymentLower =
                    paymentStatus.toLowerCase();


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

                } else if (
                    statusLower.includes(
                        "confirm"
                    )
                ) {

                    statusClass =
                        "status-confirmed";
                }


                const isCancelled =
                    statusLower.includes(
                        "cancel"
                    );


                const isDelivered =
                    statusLower.includes(
                        "deliver"
                    );


                return `

                    <div class="professional-order-card">


                        <div class="order-card-top">

                            <div>

                                <span class="order-label">
                                    ORDER
                                </span>

                                <h3>
                                    #${order.id}
                                </h3>

                            </div>


                            <div class="order-price">

                                ₹${total}

                            </div>

                        </div>


                        <div class="order-date">

                            🕒
                            ${escapeHTML(
                                formatDate(
                                    order.created_at
                                )
                            )}

                        </div>


                        <div class="order-status-row">

                            <div class="order-status-item">

                                <span>
                                    Order Status
                                </span>

                                <strong
                                    class="order-status-badge ${statusClass}"
                                >
                                    ${escapeHTML(
                                        orderStatus
                                    )}
                                </strong>

                            </div>


                            <div class="order-status-item">

                                <span>
                                    Payment
                                </span>

                                <strong
                                    class="
                                        payment-status-badge
                                        ${
                                            paymentLower === "paid"
                                                ? "payment-paid"
                                                : "payment-pending"
                                        }
                                    "
                                >
                                    ${
                                        paymentLower === "paid"
                                            ? "✓ Paid"
                                            : "Pending"
                                    }
                                </strong>

                            </div>

                        </div>


                        <div class="order-divider"></div>


                        <div class="profile-order-actions">


                            ${
                                paymentLower !== "paid" &&
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
                                            ❌ Cancel
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

                    </div>

                `;

            }
        ).join("");
}


/* =====================================================
   MAKE PAYMENT
===================================================== */

async function makePayment(orderId) {

    const token = getToken();


    if (!token) {

        window.location.href =
            "login.html";

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

                    body:
                        JSON.stringify({})
                }
            );


        const data =
            await response.json();


        console.log(
            "Payment response:",
            data
        );


        if (
            handleAuthError(data)
        ) {
            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.msg ||
                data.message ||
                "Payment failed"
            );
        }


        alert(
            "✅ Payment successful!"
        );


        await loadProfile();

    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );
    }
}


/* =====================================================
   CANCEL ORDER
===================================================== */

async function cancelOrder(orderId) {

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

                    body:
                        JSON.stringify({
                            status: "Cancelled"
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
            handleAuthError(data)
        ) {
            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.msg ||
                data.message ||
                "Failed to cancel order"
            );
        }


        alert(
            "❌ Order cancelled successfully."
        );


        await loadProfile();

    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );
    }
}


/* =====================================================
   REMOVE ORDER
===================================================== */

async function removeOrder(orderId) {

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
            handleAuthError(data)
        ) {
            return;
        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.msg ||
                data.message ||
                "Failed to remove order"
            );
        }


        alert(
            "🗑️ Order removed successfully."
        );


        await loadProfile();

    } catch (error) {

        console.error(
            "Remove order error:",
            error
        );


        alert(
            "❌ " +
            error.message
        );
    }
}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "user_id"
    );

    localStorage.removeItem(
        "user_name"
    );

    localStorage.removeItem(
        "user_email"
    );

    localStorage.removeItem(
        "user_role"
    );

    sessionStorage.removeItem(
        "access_token"
    );


    window.location.href =
        "login.html";
}


/* =====================================================
   LOGOUT BUTTON
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkLogin()) {
            return;
        }


        const logoutBtn =
            document.getElementById(
                "logout-btn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logout
            );
        }


        loadProfile();

    }
);