// =====================================================
// TastyHub Login JavaScript
// =====================================================

const form = document.getElementById("login-form");
const message = document.getElementById("login-message");

const forgotPasswordLink =
    document.getElementById("forgot-password-link");


// =====================================================
// LOGIN
// =====================================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document
        .getElementById("login-name")
        .value
        .trim();

    const password = document
        .getElementById("login-password")
        .value;

    // Clear previous message
    message.textContent = "";
    message.className = "";

    // Basic validation
    if (!name || !password) {

        message.textContent =
            "Please enter username and password.";

        message.className = "message-error";

        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    password: password
                })
            }
        );

        const data = await response.json();

        console.log("Login response:", data);


        // =================================================
        // LOGIN SUCCESS
        // =================================================

        if (response.ok) {

            message.textContent =
                "Login successful! Opening TastyHub...";

            message.className = "message-success";


            // -------------------------------------------------
            // Save JWT token
            // -------------------------------------------------

            localStorage.setItem(
                "access_token",
                data.access_token
            );


            // -------------------------------------------------
            // Save user information
            // -------------------------------------------------

            localStorage.setItem(
                "user_id",
                data.user.id
            );

            localStorage.setItem(
                "user_name",
                data.user.name
            );


            if (data.user.email) {

                localStorage.setItem(
                    "user_email",
                    data.user.email
                );

            }


            if (data.user.role) {

                localStorage.setItem(
                    "user_role",
                    data.user.role
                );

            }


            // -------------------------------------------------
            // Open main TastyHub page
            // -------------------------------------------------

            setTimeout(function () {

                window.location.href =
                    "http://127.0.0.1:5000/index.html";

            }, 1000);

        }


        // =================================================
        // LOGIN FAILED
        // =================================================

        else {

            message.textContent =
                data.message ||
                "Invalid username or password.";

            message.className =
                "message-error";

        }

    }


    // =====================================================
    // CONNECTION ERROR
    // =====================================================

    catch (error) {

        console.error(
            "Login error:",
            error
        );

        message.textContent =
            "Unable to connect to Flask server.";

        message.className =
            "message-error";

    }

});


// =====================================================
// FORGOT PASSWORD
// =====================================================

forgotPasswordLink.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        showForgotPassword();

    }
);


// =====================================================
// SHOW FORGOT PASSWORD SECTION
// =====================================================

function showForgotPassword() {

    const authCard =
        document.querySelector(".auth-card");

    authCard.innerHTML = `

        <div class="auth-logo">
            🔐
        </div>

        <h1>TastyHub</h1>

        <h2>Reset Password</h2>

        <p class="auth-subtitle">
            Create a new password for your account
        </p>

        <form id="reset-password-form">

            <input
                type="text"
                id="reset-name"
                placeholder="Username"
                required
            >

            <input
                type="password"
                id="new-password"
                placeholder="New Password"
                required
            >

            <input
                type="password"
                id="confirm-password"
                placeholder="Confirm New Password"
                required
            >

            <p id="reset-message"></p>

            <button
                type="submit"
                class="auth-btn"
            >
                Reset Password
            </button>

        </form>

        <p class="auth-footer">

            <a
                href="#"
                id="back-to-login"
            >
                ← Back to Login
            </a>

        </p>
    `;


    // Get reset form
    const resetForm =
        document.getElementById(
            "reset-password-form"
        );

    const resetMessage =
        document.getElementById(
            "reset-message"
        );

    const backToLogin =
        document.getElementById(
            "back-to-login"
        );


    // =================================================
    // RESET PASSWORD
    // =================================================

    resetForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document
                    .getElementById("reset-name")
                    .value
                    .trim();

            const newPassword =
                document
                    .getElementById("new-password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirm-password")
                    .value;


            resetMessage.textContent = "";
            resetMessage.className = "";


            // -------------------------------------------------
            // Validation
            // -------------------------------------------------

            if (
                !name ||
                !newPassword ||
                !confirmPassword
            ) {

                resetMessage.textContent =
                    "Please fill in all fields.";

                resetMessage.className =
                    "message-error";

                return;
            }


            // -------------------------------------------------
            // Check passwords
            // -------------------------------------------------

            if (
                newPassword !== confirmPassword
            ) {

                resetMessage.textContent =
                    "Passwords do not match.";

                resetMessage.className =
                    "message-error";

                return;
            }


            // -------------------------------------------------
            // Password length
            // -------------------------------------------------

            if (newPassword.length < 6) {

                resetMessage.textContent =
                    "Password must contain at least 6 characters.";

                resetMessage.className =
                    "message-error";

                return;
            }


            try {

                const response = await fetch(
                    "http://127.0.0.1:5000/reset-password",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name: name,

                            new_password:
                                newPassword

                        })
                    }
                );


                const data =
                    await response.json();


                console.log(
                    "Reset password response:",
                    data
                );


                // =================================================
                // RESET SUCCESS
                // =================================================

                if (response.ok) {

                    resetMessage.textContent =
                        "Password reset successful!";

                    resetMessage.className =
                        "message-success";


                    // Go back to login
                    setTimeout(
                        function () {

                            location.reload();

                        },
                        1500
                    );

                }


                // =================================================
                // RESET FAILED
                // =================================================

                else {

                    resetMessage.textContent =
                        data.message ||
                        "Unable to reset password.";

                    resetMessage.className =
                        "message-error";

                }

            }


            // =================================================
            // CONNECTION ERROR
            // =================================================

            catch (error) {

                console.error(
                    "Reset password error:",
                    error
                );

                resetMessage.textContent =
                    "Unable to connect to Flask server.";

                resetMessage.className =
                    "message-error";

            }

        }
    );


    // =================================================
    // BACK TO LOGIN
    // =================================================

    backToLogin.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            location.reload();

        }
    );

}