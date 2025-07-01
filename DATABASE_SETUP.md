# Manual SQLite Database Setup for Dounie Cuisine Pro

This guide provides the SQL commands to manually create the necessary database schema for the Dounie Cuisine Pro application using SQLite. This is provided because running Knex migrations programmatically can sometimes be challenging in certain restricted environments or if `ts-node` / Knex CLI tooling isn't fully operational.

In a typical local development environment with Node.js, npm, and Knex CLI correctly set up, you would use `npx knex migrate:latest --knexfile knexfile.ts` to apply these schemas automatically from the migration files located in `server/db/migrations/`.

## Prerequisites

1.  **SQLite Command Line Tool:** Ensure you have `sqlite3` (or a similar SQLite GUI tool) installed and accessible from your terminal or command prompt.
    *   You can download it from [sqlite.org](https://www.sqlite.org/download.html).

## Steps

1.  **Navigate to Project Root:** Open your terminal or command prompt and navigate to the root directory of the Dounie Cuisine Pro project.

2.  **Create/Open the Database File:**
    If the `database.sqlite` file does not exist in the project root, SQLite will create it when you open it.
    ```bash
    sqlite3 database.sqlite
    ```
    This will open the SQLite command prompt (e.g., `sqlite>`).

3.  **Execute SQL `CREATE TABLE` Statements:**
    Copy and paste the following SQL commands one by one (or as a batch if your SQLite tool supports it) into the SQLite prompt and press Enter after each one.

    **Important Notes:**
    *   The order of table creation matters due to foreign key constraints. Create `users`, then `categories`, then `gallery_albums` first, followed by tables that reference them.
    *   These schemas reflect the conceptual definitions from the project's migration plans.

    ```sql
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('client', 'admin')) NOT NULL DEFAULT 'client',
        isActive BOOLEAN NOT NULL DEFAULT 1, -- SQLite uses 1 for true, 0 for false
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Dishes (Menu Items) Table
    CREATE TABLE IF NOT EXISTS dishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        allergens TEXT,
        is_available BOOLEAN NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_amount DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        shipping_address TEXT, -- Store as JSON string: { street, city, postalCode, country }
        billing_address TEXT,  -- Store as JSON string
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        dish_id INTEGER NOT NULL,
        dish_name TEXT NOT NULL, -- Denormalized name at time of order
        quantity INTEGER NOT NULL,
        price_per_item DECIMAL(10, 2) NOT NULL, -- Price of dish at time of order
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE RESTRICT
    );

    -- Reservations Table
    CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT NOT NULL,
        event_date DATETIME NOT NULL,
        number_of_guests INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Gallery Albums Table
    CREATE TABLE IF NOT EXISTS gallery_albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        cover_image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Gallery Images Table
    CREATE TABLE IF NOT EXISTS gallery_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        album_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        caption TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE CASCADE
    );

    -- Settings Table (Key-Value Store)
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT,
        group_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ```

4.  **Verify Table Creation (Optional):**
    In the SQLite prompt, you can list tables to verify they were created:
    ```sql
    .tables
    ```
    You can also view the schema of a specific table:
    ```sql
    .schema users
    ```

5.  **Exit SQLite:**
    ```sql
    .quit
    ```

Your `database.sqlite` file in the project root should now contain these tables.

## Using Knex Migrations (Preferred Method in Local Dev)

If you have a full Node.js development environment and want to use Knex migrations (as intended by the `knexfile.ts` and migration files in `server/db/migrations/` that were conceptually defined):

1.  **Ensure `knexfile.ts` is correctly configured.** (It is set up for SQLite).
2.  **Install `ts-node` or ensure your Node environment can execute TypeScript files directly if your migration files are in TypeScript (which they are planned to be):**
    ```bash
    npm install --save-dev ts-node
    # or configure your tsconfig-paths and node options if needed
    ```
3.  **Run migrations:**
    ```bash
    npx knex migrate:latest --knexfile knexfile.ts
    ```
    This command should pick up the migration files (e.g., `YYYYMMDDHHMMSS_create_users_table.ts`, etc., which would need to be fully created with the SQL logic above inside their `up` methods) and apply them to your `database.sqlite`.

    **Note:** The migration files themselves were only *conceptually* created or partially created during this project's development in the sandbox. To use this method, you would need to ensure those migration files exist in `server/db/migrations/` and contain the correct Knex schema builder code corresponding to the SQL above.

This manual setup guide provides a fallback for environments where the Knex CLI tooling for TypeScript migrations is problematic.
