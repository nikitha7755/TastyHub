import os
from datetime import timedelta

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
    create_access_token
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from dotenv import load_dotenv

import mysql.connector
from mysql.connector import Error
# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)


# =========================================================
# FLASK APP CONFIGURATION
# =========================================================

app = Flask(
    __name__,
    static_folder="../Frontend",
    static_url_path=""
)

CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY"
)

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
    hours=24
)

jwt = JWTManager(app)


# =========================================================
# DATABASE CONFIGURATION
# =========================================================

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            **DB_CONFIG
        )

        if connection.is_connected():
            return connection

    except Error as e:
        print("Database connection error:", e)

    return None
# =========================================================
# FRONTEND ROUTES
# =========================================================

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "login.html")


@app.route("/login.html")
def login_page():
    return send_from_directory(app.static_folder, "login.html")


@app.route("/signup.html")
def signup_page():
    return send_from_directory(app.static_folder, "signup.html")


@app.route("/index.html")
def index_page():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/profile.html")
def profile_page():
    return send_from_directory(app.static_folder, "profile.html")


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "TastyHub backend is running"
    })


@app.route("/about", methods=["GET"])
def about():
    return jsonify({
        "success": True,
        "message": "Welcome to TastyHub Food Delivery API"
    })


# =========================================================
# AUTHENTICATION
# =========================================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required"
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "Name, email and password are required"
        }), 400

    if len(name) < 3:
        return jsonify({
            "success": False,
            "message": "Username must contain at least 3 characters"
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 6 characters"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            "SELECT id FROM users WHERE name = %s",
            (name,)
        )

        existing_name = cursor.fetchone()

        if existing_name:
            return jsonify({
                "success": False,
                "message": "Username already exists"
            }), 409

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        existing_email = cursor.fetchone()

        if existing_email:
            return jsonify({
                "success": False,
                "message": "Email already exists"
            }), 409

        hashed_password = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users
            (name, password, email, role)
            VALUES (%s, %s, %s, %s)
            """,
            (name, hashed_password, email, "User")
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Account created successfully"
        }), 201

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required"
        }), 400

    name = data.get("name", "").strip()
    password = data.get("password", "")

    if not name or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id, name, email, password, role
            FROM users
            WHERE name = %s
            """,
            (name,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401

        stored_password = user["password"]

        password_valid = False

        if stored_password:

            try:
                password_valid = check_password_hash(
                    stored_password,
                    password
                )
            except Exception:
                password_valid = False

            # Allows old plain-text passwords if your database
            # already contains them.
            if not password_valid and stored_password == password:
                password_valid = True

        if not password_valid:
            return jsonify({
                "success": False,
                "message": "Invalid username or password"
            }), 401

        access_token = create_access_token(
            identity=str(user["id"])
        )

        return jsonify({
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# RESET PASSWORD
# ---------------------------------------------------------

@app.route("/reset-password", methods=["PUT"])
def reset_password():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required"
        }), 400

    name = data.get("name", "").strip()
    new_password = data.get("new_password", "")

    if not name or not new_password:
        return jsonify({
            "success": False,
            "message": "Username and new password are required"
        }), 400

    if len(new_password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 6 characters"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor()

    try:

        hashed_password = generate_password_hash(new_password)

        cursor.execute(
            """
            UPDATE users
            SET password = %s
            WHERE name = %s
            """,
            (hashed_password, name)
        )

        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "message": "Username not found"
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Password reset successfully"
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# AUTH CHECK
# =========================================================

@app.route("/auth/check", methods=["GET"])
@jwt_required()
def auth_check():

    user_id = get_jwt_identity()

    return jsonify({
        "success": True,
        "authenticated": True,
        "user_id": int(user_id)
    })


# =========================================================
# CURRENT USER PROFILE
# =========================================================

@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        # Get user details
        cursor.execute(
            """
            SELECT id, name, email, role
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Get order history
        cursor.execute(
            """
            SELECT
                id,
                total_amount,
                status,
                payment_status,
                created_at
            FROM orders
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,)
        )

        orders = cursor.fetchall()

        for order in orders:
            if order["created_at"]:
                order["created_at"] = order["created_at"].isoformat()

            if order["total_amount"] is not None:
                order["total_amount"] = float(order["total_amount"])

        return jsonify({
            "success": True,
            "user": user,
            "orders": orders
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# MY PROFILE
# =========================================================

@app.route("/my-profile", methods=["GET"])
@jwt_required()
def my_profile():

    current_user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        # Get the currently logged-in user's details
        cursor.execute(
            """
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE id = %s
            """,
            (current_user_id,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Get complete order history for the logged-in user.
        # Cancelled orders are intentionally included.
        cursor.execute(
            """
            SELECT
                id,
                user_id,
                total_amount,
                status,
                payment_status,
                created_at
            FROM orders
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (current_user_id,)
        )

        orders = cursor.fetchall()

        # Convert MySQL values into JSON-friendly values.
        for order in orders:

            if order["total_amount"] is not None:
                order["total_amount"] = float(
                    order["total_amount"]
                )

            if order["created_at"]:
                order["created_at"] = (
                    order["created_at"].isoformat()
                )

        return jsonify({
            "success": True,
            "message": "Profile retrieved successfully",
            "user": user,
            "orders": orders
        }), 200

    except Error as e:

        print("My Profile Error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to load profile",
            "error": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# USERS
# =========================================================

@app.route("/users", methods=["GET"])
@jwt_required()
def get_users():

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id, name, email, role
            FROM users
            ORDER BY id DESC
            """
        )

        users = cursor.fetchall()

        return jsonify({
            "success": True,
            "users": users
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# FOOD ITEMS
# =========================================================

@app.route("/food-items", methods=["GET"])
def get_food_items():

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                price,
                category,
                is_available,
                restaurant_id
            FROM food_items
            ORDER BY id DESC
            """
        )

        foods = cursor.fetchall()

        for food in foods:

            if food["price"] is not None:
                food["price"] = float(food["price"])

        return jsonify({
            "success": True,
            "food_items": foods
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


@app.route("/food-items/<int:food_id>", methods=["GET"])
def get_food_item(food_id):

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                price,
                category,
                is_available,
                restaurant_id
            FROM food_items
            WHERE id = %s
            """,
            (food_id,)
        )

        food = cursor.fetchone()

        if not food:
            return jsonify({
                "success": False,
                "message": "Food item not found"
            }), 404

        if food["price"] is not None:
            food["price"] = float(food["price"])

        return jsonify({
            "success": True,
            "food": food
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# RESTAURANTS
# =========================================================

@app.route("/restaurants", methods=["GET"])
def get_restaurants():

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                location,
                cuisine,
                rating,
                is_open
            FROM restaurants
            ORDER BY id DESC
            """
        )

        restaurants = cursor.fetchall()

        for restaurant in restaurants:

            if restaurant["rating"] is not None:
                restaurant["rating"] = float(
                    restaurant["rating"]
                )

        return jsonify({
            "success": True,
            "restaurants": restaurants
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


@app.route("/restaurants/<int:restaurant_id>", methods=["GET"])
def get_restaurant(restaurant_id):

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                location,
                cuisine,
                rating,
                is_open
            FROM restaurants
            WHERE id = %s
            """,
            (restaurant_id,)
        )

        restaurant = cursor.fetchone()

        if not restaurant:
            return jsonify({
                "success": False,
                "message": "Restaurant not found"
            }), 404

        if restaurant["rating"] is not None:
            restaurant["rating"] = float(
                restaurant["rating"]
            )

        return jsonify({
            "success": True,
            "restaurant": restaurant
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# CART
# =========================================================

@app.route("/cart/<int:user_id>", methods=["GET"])
@jwt_required()
def get_cart(user_id):

    current_user_id = int(get_jwt_identity())

    if current_user_id != user_id:
        return jsonify({
            "success": False,
            "message": "Unauthorized access"
        }), 403

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                c.id,
                c.user_id,
                c.food_id,
                c.quantity,
                c.created_at,
                f.name,
                f.description,
                f.price,
                f.category,
                f.restaurant_id,
                r.name AS restaurant_name
            FROM cart c
            INNER JOIN food_items f
                ON c.food_id = f.id
            LEFT JOIN restaurants r
                ON f.restaurant_id = r.id
            WHERE c.user_id = %s
            ORDER BY c.created_at DESC
            """,
            (user_id,)
        )

        cart_items = cursor.fetchall()

        total = 0

        for item in cart_items:

            item["price"] = float(item["price"])

            item_total = (
                item["price"] *
                item["quantity"]
            )

            item["item_total"] = round(
                item_total,
                2
            )

            total += item_total

            if item["created_at"]:
                item["created_at"] = (
                    item["created_at"].isoformat()
                )

        return jsonify({
            "success": True,
            "cart": cart_items,
            "total": round(total, 2)
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# ADD TO CART
# ---------------------------------------------------------

@app.route("/cart", methods=["POST"])
@jwt_required()
def add_to_cart():

    current_user_id = int(get_jwt_identity())

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required"
        }), 400

    food_id = data.get("food_id")
    quantity = data.get("quantity", 1)

    if not food_id:
        return jsonify({
            "success": False,
            "message": "Food ID is required"
        }), 400

    try:
        food_id = int(food_id)
        quantity = int(quantity)
    except (ValueError, TypeError):

        return jsonify({
            "success": False,
            "message": "Invalid food ID or quantity"
        }), 400

    if quantity <= 0:
        return jsonify({
            "success": False,
            "message": "Quantity must be greater than 0"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id, is_available
            FROM food_items
            WHERE id = %s
            """,
            (food_id,)
        )

        food = cursor.fetchone()

        if not food:
            return jsonify({
                "success": False,
                "message": "Food item not found"
            }), 404

        if not food["is_available"]:
            return jsonify({
                "success": False,
                "message": "Food item is currently unavailable"
            }), 400

        cursor.execute(
            """
            SELECT id, quantity
            FROM cart
            WHERE user_id = %s
              AND food_id = %s
            """,
            (current_user_id, food_id)
        )

        existing_item = cursor.fetchone()

        if existing_item:

            new_quantity = (
                existing_item["quantity"] +
                quantity
            )

            cursor.execute(
                """
                UPDATE cart
                SET quantity = %s
                WHERE id = %s
                """,
                (
                    new_quantity,
                    existing_item["id"]
                )
            )

        else:

            cursor.execute(
                """
                INSERT INTO cart
                (user_id, food_id, quantity)
                VALUES (%s, %s, %s)
                """,
                (
                    current_user_id,
                    food_id,
                    quantity
                )
            )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Item added to cart"
        }), 201

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# UPDATE CART ITEM
# ---------------------------------------------------------

@app.route("/cart/<int:cart_id>", methods=["PUT"])
@jwt_required()
def update_cart(cart_id):

    current_user_id = int(get_jwt_identity())

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required"
        }), 400

    quantity = data.get("quantity")

    try:
        quantity = int(quantity)
    except (ValueError, TypeError):

        return jsonify({
            "success": False,
            "message": "Invalid quantity"
        }), 400

    if quantity <= 0:
        return jsonify({
            "success": False,
            "message": "Quantity must be greater than 0"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id
            FROM cart
            WHERE id = %s
              AND user_id = %s
            """,
            (cart_id, current_user_id)
        )

        item = cursor.fetchone()

        if not item:
            return jsonify({
                "success": False,
                "message": "Cart item not found"
            }), 404

        cursor.execute(
            """
            UPDATE cart
            SET quantity = %s
            WHERE id = %s
              AND user_id = %s
            """,
            (
                quantity,
                cart_id,
                current_user_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Cart updated successfully"
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# DELETE CART ITEM
# ---------------------------------------------------------

@app.route("/cart/<int:cart_id>", methods=["DELETE"])
@jwt_required()
def delete_cart_item(cart_id):

    current_user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            DELETE FROM cart
            WHERE id = %s
              AND user_id = %s
            """,
            (
                cart_id,
                current_user_id
            )
        )

        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "message": "Cart item not found"
            }), 404

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Item removed from cart"
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# CART TOTAL
# ---------------------------------------------------------

@app.route("/cart/<int:user_id>/total", methods=["GET"])
@jwt_required()
def cart_total(user_id):

    current_user_id = int(get_jwt_identity())

    if current_user_id != user_id:
        return jsonify({
            "success": False,
            "message": "Unauthorized access"
        }), 403

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            SELECT
                COALESCE(
                    SUM(f.price * c.quantity),
                    0
                )
            FROM cart c
            INNER JOIN food_items f
                ON c.food_id = f.id
            WHERE c.user_id = %s
            """,
            (user_id,)
        )

        result = cursor.fetchone()

        total = float(result[0] or 0)

        return jsonify({
            "success": True,
            "total": round(total, 2)
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# ORDERS
# =========================================================

# ---------------------------------------------------------
# CREATE ORDER
# ---------------------------------------------------------

@app.route("/orders", methods=["POST"])
@jwt_required()
def create_order():

    current_user_id = int(get_jwt_identity())

    data = request.get_json() or {}

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        # Get current user's cart
        cursor.execute(
            """
            SELECT
                c.food_id,
                c.quantity,
                f.price
            FROM cart c
            INNER JOIN food_items f
                ON c.food_id = f.id
            WHERE c.user_id = %s
            """,
            (current_user_id,)
        )

        cart_items = cursor.fetchall()

        if not cart_items:
            return jsonify({
                "success": False,
                "message": "Your cart is empty"
            }), 400

        total_amount = 0

        for item in cart_items:

            total_amount += (
                float(item["price"]) *
                item["quantity"]
            )

        total_amount = round(total_amount, 2)

        # Create order
        cursor.execute(
            """
            INSERT INTO orders
            (
                user_id,
                total_amount,
                status,
                payment_status
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                current_user_id,
                total_amount,
                "Pending",
                "Pending"
            )
        )

        order_id = cursor.lastrowid

        # Add cart items to order_items
        for item in cart_items:

            cursor.execute(
                """
                INSERT INTO order_items
                (
                    order_id,
                    food_id,
                    quantity,
                    price
                )
                VALUES (%s, %s, %s, %s)
                """,
                (
                    order_id,
                    item["food_id"],
                    item["quantity"],
                    item["price"]
                )
            )

        # Clear user's cart
        cursor.execute(
            """
            DELETE FROM cart
            WHERE user_id = %s
            """,
            (current_user_id,)
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Order placed successfully",
            "order_id": order_id,
            "total_amount": total_amount,
            "status": "Pending",
            "payment_status": "Pending"
        }), 201

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# GET USER ORDERS
# ---------------------------------------------------------

@app.route("/orders/<int:user_id>", methods=["GET"])
@jwt_required()
def get_orders(user_id):

    current_user_id = int(get_jwt_identity())

    if current_user_id != user_id:
        return jsonify({
            "success": False,
            "message": "Unauthorized access"
        }), 403

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                total_amount,
                status,
                payment_status,
                created_at
            FROM orders
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,)
        )

        orders = cursor.fetchall()

        for order in orders:

            if order["total_amount"] is not None:
                order["total_amount"] = float(
                    order["total_amount"]
                )

            if order["created_at"]:
                order["created_at"] = (
                    order["created_at"].isoformat()
                )

        return jsonify({
            "success": True,
            "orders": orders
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# GET SINGLE ORDER
# ---------------------------------------------------------

@app.route("/orders/<int:order_id>", methods=["GET"])
@jwt_required()
def get_single_order(order_id):

    current_user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                total_amount,
                status,
                payment_status,
                created_at
            FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        order["total_amount"] = float(
            order["total_amount"]
        )

        if order["created_at"]:
            order["created_at"] = (
                order["created_at"].isoformat()
            )

        # Get order items
        cursor.execute(
            """
            SELECT
                oi.id,
                oi.food_id,
                oi.quantity,
                oi.price,
                f.name,
                f.description,
                f.category
            FROM order_items oi
            INNER JOIN food_items f
                ON oi.food_id = f.id
            WHERE oi.order_id = %s
            """,
            (order_id,)
        )

        items = cursor.fetchall()

        for item in items:

            item["price"] = float(
                item["price"]
            )

            item["item_total"] = round(
                item["price"] *
                item["quantity"],
                2
            )

        order["items"] = items

        return jsonify({
            "success": True,
            "order": order
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# UPDATE ORDER STATUS
# ---------------------------------------------------------

@app.route("/orders/<int:order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):

    current_user_id = int(get_jwt_identity())

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request data is required"
        }), 400

    status = data.get("status", "").strip()

    allowed_statuses = [
        "Pending",
        "Placed",
        "Confirmed",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid order status"
        }), 400

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id, status
            FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        if status == "Cancelled" and order["status"] == "Delivered":
            return jsonify({
                "success": False,
                "message": "Delivered orders cannot be cancelled"
            }), 400

        if status == "Cancelled" and order["status"] == "Cancelled":
            return jsonify({
                "success": False,
                "message": "Order is already cancelled"
            }), 400

        cursor.execute(
            """
            UPDATE orders
            SET status = %s
            WHERE id = %s
              AND user_id = %s
            """,
            (
                status,
                order_id,
                current_user_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Order status updated",
            "order_id": order_id,
            "status": status
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# CANCEL ORDER
# ---------------------------------------------------------

@app.route("/orders/<int:order_id>/cancel", methods=["PUT"])
@jwt_required()
def cancel_order(order_id):

    current_user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id, status, payment_status
            FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        if order["status"] == "Delivered":
            return jsonify({
                "success": False,
                "message": "Delivered orders cannot be cancelled"
            }), 400

        if order["status"] == "Cancelled":
            return jsonify({
                "success": False,
                "message": "Order is already cancelled"
            }), 400

        cursor.execute(
            """
            UPDATE orders
            SET status = %s
            WHERE id = %s
              AND user_id = %s
            """,
            (
                "Cancelled",
                order_id,
                current_user_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Order cancelled successfully",
            "order_id": order_id,
            "status": "Cancelled"
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# REMOVE ORDER FROM HISTORY
# ---------------------------------------------------------
# IMPORTANT:
# Your orders table does NOT have a user_removed column.
# Therefore this permanently removes the order from the
# user's visible history by deleting:
#
# 1. order_items
# 2. orders
#
# We delete order_items first because it references orders.

@app.route("/orders/<int:order_id>/remove", methods=["DELETE"])
@jwt_required()
def remove_order(order_id):

    current_user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        # Verify ownership
        cursor.execute(
            """
            SELECT id
            FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        # Delete order items first
        cursor.execute(
            """
            DELETE FROM order_items
            WHERE order_id = %s
            """,
            (order_id,)
        )

        # Delete order
        cursor.execute(
            """
            DELETE FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Order removed from history"
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ---------------------------------------------------------
# OPTIONAL DELETE ORDER ENDPOINT
# ---------------------------------------------------------
# This does the same thing as /remove and can be used if
# the frontend uses a normal REST DELETE request.

@app.route("/orders/<int:order_id>", methods=["DELETE"])
@jwt_required()
def delete_order(order_id):

    current_user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT id
            FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        cursor.execute(
            """
            DELETE FROM order_items
            WHERE order_id = %s
            """,
            (order_id,)
        )

        cursor.execute(
            """
            DELETE FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Order deleted successfully"
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# PAYMENTS
# =========================================================

@app.route("/payments/<int:order_id>", methods=["POST"])
@jwt_required()
def make_payment(order_id):

    current_user_id = int(get_jwt_identity())

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        # Verify order ownership
        cursor.execute(
            """
            SELECT
                id,
                total_amount,
                status,
                payment_status
            FROM orders
            WHERE id = %s
              AND user_id = %s
            """,
            (
                order_id,
                current_user_id
            )
        )

        order = cursor.fetchone()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        if order["status"] == "Cancelled":
            return jsonify({
                "success": False,
                "message": "Payment cannot be made for a cancelled order"
            }), 400

        if order["payment_status"] == "Paid":
            return jsonify({
                "success": False,
                "message": "Payment is already completed"
            }), 400

        # Update payment
        cursor.execute(
            """
            UPDATE orders
            SET
                payment_status = %s,
                status = %s
            WHERE id = %s
              AND user_id = %s
            """,
            (
                "Paid",
                "Confirmed",
                order_id,
                current_user_id
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Payment successful",
            "order_id": order_id,
            "payment_status": "Paid",
            "status": "Confirmed"
        }), 200

    except Error as e:

        connection.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# SEARCH
# =========================================================

@app.route("/search/food", methods=["GET"])
def search_food():

    query = request.args.get("q", "").strip()

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        search_value = f"%{query}%"

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                price,
                category,
                is_available,
                restaurant_id
            FROM food_items
            WHERE name LIKE %s
               OR category LIKE %s
               OR description LIKE %s
            ORDER BY name
            """,
            (
                search_value,
                search_value,
                search_value
            )
        )

        foods = cursor.fetchall()

        for food in foods:

            if food["price"] is not None:
                food["price"] = float(
                    food["price"]
                )

        return jsonify({
            "success": True,
            "food_items": foods
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


@app.route("/search/restaurants", methods=["GET"])
def search_restaurants():

    query = request.args.get("q", "").strip()

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        search_value = f"%{query}%"

        cursor.execute(
            """
            SELECT
                id,
                name,
                location,
                cuisine,
                rating,
                is_open
            FROM restaurants
            WHERE name LIKE %s
               OR location LIKE %s
               OR cuisine LIKE %s
            ORDER BY name
            """,
            (
                search_value,
                search_value,
                search_value
            )
        )

        restaurants = cursor.fetchall()

        for restaurant in restaurants:

            if restaurant["rating"] is not None:
                restaurant["rating"] = float(
                    restaurant["rating"]
                )

        return jsonify({
            "success": True,
            "restaurants": restaurants
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# FOOD CATEGORY
# =========================================================

@app.route("/food-items/category/<category>", methods=["GET"])
def get_food_by_category(category):

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                price,
                category,
                is_available,
                restaurant_id
            FROM food_items
            WHERE category = %s
            ORDER BY name
            """,
            (category,)
        )

        foods = cursor.fetchall()

        for food in foods:

            if food["price"] is not None:
                food["price"] = float(
                    food["price"]
                )

        return jsonify({
            "success": True,
            "food_items": foods
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# RESTAURANT FOOD ITEMS
# =========================================================

@app.route(
    "/restaurants/<int:restaurant_id>/food-items",
    methods=["GET"]
)
def get_restaurant_food(restaurant_id):

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                name,
                description,
                price,
                category,
                is_available,
                restaurant_id
            FROM food_items
            WHERE restaurant_id = %s
            ORDER BY name
            """,
            (restaurant_id,)
        )

        foods = cursor.fetchall()

        for food in foods:

            if food["price"] is not None:
                food["price"] = float(
                    food["price"]
                )

        return jsonify({
            "success": True,
            "food_items": foods
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# RECOMMENDATIONS
# =========================================================

@app.route("/recommendations/<int:user_id>", methods=["GET"])
@jwt_required()
def recommendations(user_id):

    current_user_id = int(get_jwt_identity())

    if current_user_id != user_id:
        return jsonify({
            "success": False,
            "message": "Unauthorized access"
        }), 403

    connection = get_db_connection()

    if connection is None:
        return jsonify({
            "success": False,
            "message": "Database connection failed"
        }), 500

    cursor = connection.cursor(dictionary=True)

    try:

        # Find categories from user's previous orders
        cursor.execute(
            """
            SELECT DISTINCT
                f.category
            FROM order_items oi
            INNER JOIN orders o
                ON oi.order_id = o.id
            INNER JOIN food_items f
                ON oi.food_id = f.id
            WHERE o.user_id = %s
              AND o.status <> 'Cancelled'
              AND f.category IS NOT NULL
            """,
            (user_id,)
        )

        categories = cursor.fetchall()

        category_names = [
            row["category"]
            for row in categories
            if row["category"]
        ]

        if category_names:

            placeholders = ",".join(
                ["%s"] * len(category_names)
            )

            query = f"""
                SELECT
                    id,
                    name,
                    description,
                    price,
                    category,
                    is_available,
                    restaurant_id
                FROM food_items
                WHERE category IN ({placeholders})
                  AND is_available = 1
                ORDER BY id DESC
                LIMIT 10
            """

            cursor.execute(
                query,
                tuple(category_names)
            )

        else:

            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    description,
                    price,
                    category,
                    is_available,
                    restaurant_id
                FROM food_items
                WHERE is_available = 1
                ORDER BY id DESC
                LIMIT 10
                """
            )

        foods = cursor.fetchall()

        for food in foods:

            if food["price"] is not None:
                food["price"] = float(
                    food["price"]
                )

        return jsonify({
            "success": True,
            "recommendations": foods
        }), 200

    except Error as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# =========================================================
# GLOBAL ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "success": False,
        "message": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):

    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    print("=" * 60)
    print("TastyHub backend starting...")
    print("Frontend: http://127.0.0.1:5000")
    print("Login:    http://127.0.0.1:5000/login.html")
    print("Signup:   http://127.0.0.1:5000/signup.html")
    print("Main App: http://127.0.0.1:5000/index.html")
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )