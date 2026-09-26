TastyHub 🍴

TastyHub is a full-stack food ordering web application built with
Python Flask, MySQL, HTML, CSS, and JavaScript. It provides a
complete food-ordering workflow including user registration, login,
authentication, restaurant and food browsing, search and filtering, cart
management, order placement, payment-status handling, order tracking,
cancellation, profile information, and order history.

Project type: Full-Stack Web Application
Backend: Python + Flask
Frontend: HTML5 + CSS3 + JavaScript
Database: MySQL
Authentication: JWT (JSON Web Token)
API Testing: Postman
Version Control: Git + GitHub

📌 Project Overview

The main goal of TastyHub is to build a practical food-ordering
application with a separate frontend and backend, database connectivity,
secure user authentication, and user-specific cart and order management.

The application follows this general flow:

User
  │
  ▼
Frontend (HTML + CSS + JavaScript)
  │
  │ REST API requests
  ▼
Flask Backend (Python)
  │
  ├── Authentication / JWT
  ├── Business Logic
  ├── Cart Management
  ├── Order Management
  ├── Search / Filtering
  └── Payment Status
  │
  ▼
MySQL Database

🏗️ Project Architecture

TastyHub/
│
├── .env
├── .gitignore
├── README.md
│
├── Backend/
│   └── app.py
│
├── Frontend/
│   ├── index.html
│   ├── Login.html
│   ├── Login.js
│   ├── profile.html
│   ├── profile.js
│   ├── script.js
│   ├── Signup.html
│   ├── Signup.js
│   └── style.css
│
└── venv/

Folder responsibilities

Backend/ - Contains the Flask application. - Defines API routes and
application logic. - Handles authentication, database operations, cart,
orders, payments, search, and recommendations.

Frontend/ - Contains the user interface. - HTML provides page
structure. - CSS provides styling. - JavaScript handles user
interactions and communicates with Flask APIs.

.env - Stores sensitive configuration such as database credentials
and the JWT secret.

.gitignore - Prevents sensitive files and local development files
from being committed to GitHub.

venv/ - Local Python virtual environment. - This should not be
uploaded to GitHub.

🛠️ Technologies Used

Technology               Purpose

Python                   Backend programming
Flask                    Web framework and REST-style API development
Flask-CORS               Cross-origin communication between frontend and backend
Flask-JWT-Extended       JWT authentication and protected APIs
MySQL                    Relational database
MySQL Connector/Python   Python-to-MySQL database connectivity
HTML5                    Frontend structure
CSS3                     Frontend styling
JavaScript               Frontend logic and API integration
Werkzeug                 Password hashing and password verification
python-dotenv            Loading configuration from .env
Postman                  REST API testing and debugging
Git                      Version control
GitHub                   Remote source-code repository

🔐 Authentication and Security

TastyHub uses JWT-based authentication for protected operations.

Login flow

User enters username and password
            ↓
        POST /login
            ↓
Flask validates the credentials
            ↓
Password is verified using password hashing
            ↓
JWT access token is generated
            ↓
Frontend stores/uses the token
            ↓
Protected API requests send the token
            ↓
Flask identifies the logged-in user

The backend uses @jwt_required() on protected endpoints and obtains
the current user using the JWT identity.

Passwords are stored using Werkzeug password hashing rather than
intentionally storing newly registered passwords as plain text.

Do not commit real passwords, database credentials, or JWT secrets to
GitHub.

🗄️ Database Design

The application uses MySQL to store the main application data.

Main tables

Table                               Purpose

users                             User account, email, password, and
role

restaurants                       Restaurant information such as
name, location, cuisine, rating,
and availability

food_items                        Food name, description, price,
category, availability, and
restaurant relationship

cart                              Items currently added to a user's
cart

orders                            Order total, status, payment
status, user, and creation time

Relationship overview

users
  │
  ├──────────► cart
  │
  └──────────► orders
                  │
                  └──────────► order_items ◄──────── food_items
                                      │
                                      └──────── restaurant

The order workflow copies the cart items into order_items, creates an
order record, calculates the total, and clears the user's cart.

🔌 Main API Modules

Health and information

GET /api/health
GET /about

Used to check whether the backend is running and return API information.

Authentication

POST /register
POST /login
PUT  /reset-password
GET  /auth/check

Supports account creation, login, password reset, and authentication
checking.

Profile

GET /profile
GET /my-profile

Returns information for the authenticated user and order history.

Food items

GET /food-items
GET /food-items/<food_id>
GET /food-items/category/<category>

Supports listing food, retrieving a specific food item, and filtering by
category.

Restaurants

GET /restaurants
GET /restaurants/<restaurant_id>
GET /restaurants/<restaurant_id>/food-items

Supports restaurant listing, restaurant details, and retrieving food
items belonging to a restaurant.

Cart

GET    /cart/<user_id>
POST   /cart
PUT    /cart/<cart_id>
DELETE /cart/<cart_id>
GET    /cart/<user_id>/total

Supports adding food, updating quantity, removing items, viewing the
cart, and calculating the total.

Orders

POST   /orders
GET    /orders/<user_id>
GET    /orders/<order_id>
PUT    /orders/<order_id>/status
PUT    /orders/<order_id>/cancel
DELETE /orders/<order_id>
DELETE /orders/<order_id>/remove

Supports order creation, order history, individual order details, status
updates, cancellation, and removal from history.

Payments

POST /payments/<order_id>

The current implementation records a successful payment by updating the
order's payment status to Paid and the order status to Confirmed. It
is an application-level payment-status workflow, not a live
payment-gateway integration.

Search

GET /search/food?q=<query>
GET /search/restaurants?q=<query>

Supports searching food and restaurants.

Recommendations

GET /recommendations/<user_id>

Provides recommendations based on the authenticated user's previous
order categories.

🛒 Cart Workflow

Select food
    ↓
Add to cart
    ↓
Check whether item already exists
    ↓
Existing item → increase quantity
New item      → create cart record
    ↓
Calculate item total
    ↓
Calculate cart total

The backend checks the authenticated user before accessing or modifying
protected cart data.

📦 Order Workflow

User has items in cart
        ↓
Place Order
        ↓
Read current user's cart
        ↓
Calculate total amount
        ↓
Create order
        ↓
Create order_items
        ↓
Clear user's cart
        ↓
Order created as Pending
        ↓
Payment
        ↓
Payment status → Paid
Order status   → Confirmed

Order status

The backend supports statuses such as:

Pending
Placed
Confirmed
Preparing
Out for Delivery
Delivered
Cancelled

Payment status

Pending
Paid

Keeping order status and payment status separately allows the
application to track delivery progress and payment state independently.

🔎 Search and Filtering

TastyHub supports:

Food search by name

Food search by category

Food search by description

Restaurant search by name

Restaurant search by location

Restaurant search by cuisine

Category-based food filtering

Restaurant-specific food listing

The frontend also uses JavaScript to update the displayed results
dynamically.

👤 User-Specific Data

Protected operations use the identity stored in the JWT rather than
trusting a user ID supplied by the client.

For example:

Login
  ↓
JWT token
  ↓
Authenticated user identity
  ↓
Backend verifies ownership
  ↓
Access user's cart/orders/profile

The backend checks that the requested user ID matches the authenticated
user's identity for protected user-specific routes.

This helps prevent a logged-in user from accessing another user's cart
or orders.

💳 Payment Handling

The current project includes a payment-status API.

When payment is made:

Payment request
      ↓
Verify order ownership
      ↓
Check order is not cancelled
      ↓
Check payment is not already completed
      ↓
payment_status = Paid
      ↓
order status = Confirmed

This is a simulated/application-level payment workflow. A real payment
gateway such as Razorpay or Stripe can be integrated as a future
enhancement.

🧪 API Testing with Postman

Postman was used to test the Flask REST APIs independently from the
frontend.

Examples of testing include:

GET     /restaurants
GET     /food-items
POST    /register
POST    /login
POST    /cart
PUT     /cart/<cart_id>
DELETE  /cart/<cart_id>
POST    /orders
GET     /orders/<user_id>

Postman helped verify:

HTTP methods

Request bodies

Authentication headers

JSON responses

HTTP status codes

Error messages

Backend behavior before frontend integration

🧩 Important Challenges and Solutions

1. Flask and MySQL connection

Challenge: Connecting the Flask backend to MySQL and handling
database errors.

Solution: Created a reusable database connection function using
MySQL Connector/Python and loaded database configuration from
environment variables.

2. JWT authentication

Challenge: Protected APIs require a valid access token.

Solution: Implemented JWT authentication and used protected routes
with @jwt_required().

3. User-specific cart and orders

Challenge: Avoiding access to another user's data.

Solution: Compared the authenticated JWT identity with the requested
user ID and verified order/cart ownership.

4. Order and order-item relationships

Challenge: order_items depends on the parent order.

Solution: When permanently removing an order, the related
order_items are deleted first and the parent order is deleted
afterward.

5. Separating payment and order status

Challenge: Payment state and delivery/order state represent
different things.

Solution: Maintained separate payment_status and status fields.

6. Token expiration

Challenge: An expired JWT causes protected API requests to fail.

Solution: Log in again to obtain a new access token and use the
valid token for protected requests.

7. Sensitive configuration

Challenge: Database credentials and JWT secrets should not be
exposed.

Solution: Stored configuration in .env and excluded .env from
Git using .gitignore.

⚠️ Error Handling

The backend returns appropriate JSON responses for common problems such
as:

Missing request data

Invalid username/password

Duplicate username/email

Invalid food ID

Invalid quantity

Food item not found

Restaurant not found

Empty cart

Unauthorized access

Order not found

Invalid order status

Cancelled/delivered order restrictions

Database connection errors

The frontend also handles API failures and displays user-friendly
messages.

▶️ How to Run the Project

1. Clone the repository

git clone https://github.com/YOUR-USERNAME/TastyHub.git
cd TastyHub

2. Start MySQL

Make sure MySQL Server is running.

Create/use the required database:

CREATE DATABASE foodhub_ai;

The complete table structure and sample data should be created before
running the application.

3. Create .env

Create a .env file in the project root:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=foodhub_ai
JWT_SECRET_KEY=your_secret_key

Never commit the real .env file.

4. Create and activate the virtual environment

Windows:

python -m venv venv
venv\Scripts\activate

5. Install dependencies

Install the packages used by the backend:

pip install flask flask-cors flask-jwt-extended mysql-connector-python werkzeug python-dotenv

6. Run Flask

From the project root:

python Backend\app.py

The backend will run on the local address shown by Flask, commonly:

http://127.0.0.1:5000

7. Open the application

You can use the Flask frontend routes, for example:

http://127.0.0.1:5000/

The application also contains frontend HTML, CSS, and JavaScript files
under the Frontend folder.

📚 What I Learned

Through TastyHub, I practiced:

Python programming

Flask web development

REST-style API development

MySQL database design

SQL queries and CRUD operations

HTML and CSS

JavaScript and API integration

JWT authentication

Password hashing

User-specific data handling

Cart and order workflows

Payment-status handling

Search and filtering

Error handling

Postman API testing

Environment variables

Git and GitHub

🔮 Future Enhancements

Possible future improvements:

Real online payment gateway integration

Admin dashboard

Restaurant-owner dashboard

Email notifications

OTP-based password reset

Better real-time order tracking

Food image upload/storage

Customer reviews and ratings

Cloud deployment

Automated testing

CI/CD pipeline

AI-based food recommendations

🎯 Conclusion

TastyHub provided practical experience in developing a full-stack web
application from frontend to backend and database.

The project combines a browser-based frontend, Flask REST-style APIs,
MySQL database operations, JWT authentication, user-specific cart and
order management, search and filtering, payment-status handling, error
handling, and API testing.

It demonstrates the complete flow of a food-ordering application and
provides a practical foundation for further enhancements and deployment.