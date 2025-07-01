# Dounie Cuisine Pro - API Reference

This document provides a high-level overview of the backend API endpoints for the Dounie Cuisine Pro application.

**Base URL:** `/api`

---

## 1. Authentication (`/api/auth`)

-   **`POST /register`**
    -   **Description:** Registers a new user.
    -   **Protection:** Public.
    -   **Request Body:** `firstName`, `lastName`, `email`, `password`.
    -   **Response:** JWT token, user object (excluding password).
-   **`POST /login`**
    -   **Description:** Logs in an existing user.
    -   **Protection:** Public.
    -   **Request Body:** `email`, `password`.
    -   **Response:** JWT token, user object (excluding password).
-   **`POST /logout`**
    -   **Description:** Placeholder for logout; client should clear token.
    -   **Protection:** None (client-side action).
    -   **Response:** Success message.

---

## 2. Users (`/api/users`)

### 2.1. Current User Profile (Self-managed)

-   **`GET /profile/me`**
    -   **Description:** Gets the profile of the currently authenticated user.
    -   **Protection:** Authenticated.
    -   **Response:** User object (excluding password).
-   **`PUT /profile/me`**
    -   **Description:** Updates the profile of the currently authenticated user (e.g., name, phone).
    -   **Protection:** Authenticated.
    -   **Request Body:** `firstName` (optional), `lastName` (optional), `phone` (optional).
    -   **Response:** Updated user object (excluding password).
-   **`PUT /profile/me/password`**
    -   **Description:** Changes the password for the currently authenticated user.
    -   **Protection:** Authenticated.
    -   **Request Body:** `currentPassword`, `newPassword`.
    -   **Response:** Success message.

### 2.2. Admin User Management

-   **`GET /`**
    -   **Description:** Gets a list of all users (paginated).
    -   **Protection:** Admin-only.
    -   **Query Params:** `page`, `pageSize`.
    -   **Response:** Paginated list of user objects.
-   **`GET /:id`**
    -   **Description:** Gets details for a specific user by ID.
    -   **Protection:** Admin-only.
    -   **Response:** User object.
-   **`PUT /:id/role`**
    -   **Description:** Updates the role of a specific user.
    -   **Protection:** Admin-only.
    -   **Request Body:** `role` ('client' or 'admin').
    -   **Response:** Updated user object.
-   **`PATCH /:id/activation`**
    -   **Description:** Toggles the active status of a specific user.
    -   **Protection:** Admin-only.
    -   **Response:** Updated user object.

---

## 3. Categories (`/api/categories`)

-   **`GET /`**
    -   **Description:** Gets a list of all menu categories.
    -   **Protection:** Public.
    -   **Response:** Array of category objects.
-   **`GET /:id`**
    -   **Description:** Gets details for a specific category by ID.
    -   **Protection:** Public.
    -   **Response:** Category object.
-   **`POST /`**
    -   **Description:** Creates a new menu category.
    -   **Protection:** Admin-only.
    -   **Request Body:** `name`, `description` (optional).
    -   **Response:** Newly created category object.
-   **`PUT /:id`**
    -   **Description:** Updates an existing menu category.
    -   **Protection:** Admin-only.
    *   **Request Body:** `name` (optional), `description` (optional).
    -   **Response:** Updated category object.
-   **`DELETE /:id`**
    -   **Description:** Deletes a menu category. (Fails if dishes are associated).
    -   **Protection:** Admin-only.
    -   **Response:** Success message.

---

## 4. Dishes (Menu Items) (`/api/dishes`)

-   **`GET /`**
    -   **Description:** Gets a list of all dishes (paginated).
    -   **Protection:** Public.
    -   **Query Params:** `page`, `pageSize`, `category_id`, `is_available`.
    -   **Response:** Paginated list of dish objects (includes `category_name`).
-   **`GET /:id`**
    -   **Description:** Gets details for a specific dish by ID.
    -   **Protection:** Public.
    -   **Response:** Dish object (includes `category_name`).
-   **`POST /`**
    -   **Description:** Creates a new dish.
    -   **Protection:** Admin-only.
    -   **Request Body:** `name`, `description`, `price`, `category_id`, `image_url` (optional), `allergens` (optional), `is_available` (optional, defaults true).
    -   **Response:** Newly created dish object.
-   **`PUT /:id`**
    -   **Description:** Updates an existing dish.
    -   **Protection:** Admin-only.
    -   **Request Body:** Fields from dish creation (all optional).
    -   **Response:** Updated dish object.
-   **`DELETE /:id`**
    -   **Description:** Deletes a dish.
    -   **Protection:** Admin-only.
    -   **Response:** Success message.

---

## 5. Orders (`/api/orders`) (Admin Management)

-   **`GET /`**
    -   **Description:** Gets a list of all orders (paginated).
    -   **Protection:** Admin-only.
    -   **Query Params:** `page`, `pageSize`, `status`, `user_id`, `dateFrom`, `dateTo`, `search`.
    -   **Response:** Paginated list of order objects (includes basic user info).
-   **`GET /:id`**
    -   **Description:** Gets details for a specific order by ID, including order items.
    -   **Protection:** Admin-only.
    -   **Response:** Order object with items and user info.
-   **`PUT /:id/status`**
    -   **Description:** Updates the status of an order.
    -   **Protection:** Admin-only.
    -   **Request Body:** `status` (one of `OrderStatus` enum).
    -   **Response:** Updated order object.

---

## 6. Reservations (`/api/reservations`) (Admin Management)

-   **`GET /`**
    -   **Description:** Gets a list of all reservations (paginated).
    -   **Protection:** Admin-only.
    -   **Query Params:** `page`, `pageSize`, `status`, `user_id`, `eventDateFrom`, `eventDateTo`, `search`.
    -   **Response:** Paginated list of reservation objects (includes basic user info).
-   **`GET /:id`**
    -   **Description:** Gets details for a specific reservation by ID.
    -   **Protection:** Admin-only.
    -   **Response:** Reservation object with user info.
-   **`PUT /:id/status`**
    -   **Description:** Updates the status of a reservation.
    -   **Protection:** Admin-only.
    -   **Request Body:** `status` (one of `ReservationStatus` enum).
    -   **Response:** Updated reservation object.
-   **`PUT /:id`**
    -   **Description:** Updates details of a reservation (e.g., notes, guest count, event details).
    -   **Protection:** Admin-only.
    -   **Request Body:** Optional fields from `Reservation` type.
    -   **Response:** Updated reservation object.

---

## 7. Gallery Albums (`/api/gallery-albums`)

-   **`GET /`**
    -   **Description:** Gets a list of all gallery albums (includes `image_count`).
    -   **Protection:** Public.
    -   **Response:** Array of gallery album objects.
-   **`GET /:albumId`**
    -   **Description:** Gets details for a specific album by ID (includes `image_count`).
    -   **Protection:** Public.
    -   **Response:** Gallery album object.
-   **`POST /`**
    -   **Description:** Creates a new gallery album.
    -   **Protection:** Admin-only.
    -   **Request Body:** `name`, `description` (optional), `cover_image_url` (optional).
    -   **Response:** Newly created gallery album object.
-   **`PUT /:albumId`**
    -   **Description:** Updates an existing gallery album.
    -   **Protection:** Admin-only.
    -   **Request Body:** `name` (optional), `description` (optional), `cover_image_url` (optional).
    -   **Response:** Updated gallery album object.
-   **`DELETE /:albumId`**
    -   **Description:** Deletes a gallery album and its associated images (due to DB cascade).
    -   **Protection:** Admin-only.
    -   **Response:** Success message.

### 7.1. Images within an Album (`/api/gallery-albums/:albumId/images`)

-   **`GET /:albumId/images`**
    -   **Description:** Gets a list of all images for a specific album (paginated).
    -   **Protection:** Public.
    -   **Query Params:** `page`, `pageSize`.
    -   **Response:** Paginated list of gallery image objects.
-   **`POST /:albumId/images`**
    -   **Description:** Adds an image to a specific album. Handles file upload (field name `imageFile`) or direct `image_url`.
    -   **Protection:** Admin-only.
    -   **Request Body (multipart/form-data OR application/json):** `imageFile` (file) OR `image_url` (string), `caption` (optional), `sort_order` (optional).
    -   **Response:** Newly created gallery image object.

---

## 8. Gallery Images (`/api/gallery-images`) (Direct Image Manipulation)

-   **`PUT /:imageId`**
    -   **Description:** Updates details (caption, sort_order) of a specific image.
    -   **Protection:** Admin-only.
    -   **Request Body:** `caption` (optional), `sort_order` (optional).
    -   **Response:** Updated gallery image object.
-   **`DELETE /:imageId`**
    -   **Description:** Deletes a specific image.
    -   **Protection:** Admin-only.
    -   **Response:** Success message.

---

## 9. Settings (`/api/settings`)

-   **`GET /`**
    -   **Description:** Gets all application settings as a structured object.
    -   **Protection:** Admin-only (for fetching all editable settings).
    -   **Response:** `AppSettings` object.
-   **`PUT /`**
    -   **Description:** Updates application settings.
    -   **Protection:** Admin-only.
    -   **Request Body:** `AppSettings` object (can be partial).
    -   **Response:** Updated `AppSettings` object.

---
