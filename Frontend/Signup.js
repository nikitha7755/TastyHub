// =====================================================
// TastyHub Signup JavaScript
// =====================================================

const form = document.getElementById("signup-form");
const message = document.getElementById("signup-message");


// =====================================================
// SIGNUP FORM
// =====================================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // =================================================
    // GET FORM VALUES
    // =================================================

    const name =
        document.getElementById("signup-name")
            .value
            .trim();

    const email =
        document.getElementById("signup-email")
            .value
            .trim();

    const password =
        document.getElementById("signup-password")
            .value;

    const confirmPassword =
        document.getElementById("confirm-password")
            .value;


    // Clear previous message
    message.textContent = "";
    message.className = "";


    // =================================================
    // CHECK EMPTY FIELDS
    // =================================================

    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        message.textContent =
            "Please fill in all fields.";

        message.className =
            "message-error";

        return;
    }


    // =================================================
    // CHECK USERNAME
    // =================================================

    if (name.length < 3) {

        message.textContent =
            "Username must contain at least 3 characters.";

        message.className =
            "message-error";

        return;
    }


    // =================================================
    // CHECK EMAIL
    // =================================================

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        message.textContent =
            "Please enter a valid email address.";

        message.className =
            "message-error";

        return;
    }


    // =================================================
    // CHECK PASSWORD
    // =================================================

    if (password.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        message.className =
            "message-error";

        return;
    }


    // =================================================
    // CHECK PASSWORD CONFIRMATION
    // =================================================

    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        message.className =
            "message-error";

        return;
    }


    // =================================================
    // SEND REGISTRATION REQUEST
    // =================================================

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );


        // Convert response to JSON
        const data = await response.json();


        console.log(
            "Registration response:",
            data
        );


        // =================================================
        // REGISTRATION SUCCESS
        // =================================================

        if (response.ok) {

            message.textContent =
                "Account created successfully! Redirecting to login...";

            message.className =
                "message-success";


            // Clear form
            form.reset();


            // Redirect to login
            setTimeout(function () {

                window.location.href =
                    "http://127.0.0.1:5000/login.html";

            }, 1500);

        }


        // =================================================
        // REGISTRATION FAILED
        // =================================================

        else {

            message.textContent =
                data.message ||
                "Registration failed.";

            message.className =
                "message-error";

        }

    }


    // =================================================
    // CONNECTION ERROR
    // =================================================

    catch (error) {

        console.error(
            "Registration error:",
            error
        );

        message.textContent =
            "Unable to connect to Flask server.";

        message.className =
            "message-error";

    }

});