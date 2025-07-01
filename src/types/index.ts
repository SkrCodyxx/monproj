// Placeholder for shared TypeScript types

export interface User {
  id: string;
  email: string;
  role: 'client' | 'admin'; // Example roles
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean; // Added for user activation status
}

// Renaming MenuItem to Dish for consistency with backend table name plan
export interface Dish {
  id: string; // Or number if using integer IDs from DB directly
  category_id: string; // Or number
  name: string;
  description: string;
  price: number; // Representing price, could be float or integer (cents)
  image_url?: string;
  allergens?: string; // Simple text for now
  is_available: boolean;
  category_name?: string; // Optional: for frontend display, if joined
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string; // Or number
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Address { // Reusable Address type
    street: string;
    city: string;
    postalCode: string;
    country: string;
}
export interface Order {
  id: string; // or number
  user_id?: string | null; // or number
  total_amount: number;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: string | Address; // Store as JSON string in DB, parse to Address object in app
  billing_address?: string | Address;
  notes?: string;
  items?: OrderItem[]; // Typically fetched separately or as a join for order details
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  user?: Pick<User, 'email' | 'firstName' | 'lastName'>; // Optional: for frontend display if joined
}

export interface OrderItem {
  id: string; // or number
  order_id: string; // or number
  dish_id: string; // or number
  dish_name: string; // Denormalized
  quantity: number;
  price_per_item: number;
  // No separate created_at/updated_at needed if managed by order's timestamps or not critical
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: string; // or number
  user_id?: string | null; // or number
  event_type: string;
  event_date: string; // ISO datetime string
  number_of_guests: number;
  status: ReservationStatus;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  user?: Pick<User, 'email' | 'firstName' | 'lastName'>; // Optional: for frontend display if joined
}

export interface GalleryAlbum {
  id: string; // or number
  name: string;
  description?: string;
  cover_image_url?: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
  image_count?: number; // Optional: for frontend display if joined/calculated
}

export interface GalleryImage {
  id: string; // or number
  album_id: string; // or number
  image_url: string;
  caption?: string;
  sort_order?: number;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}

// Add more types as defined in the "Cahier des Charges"
// e.g., Category, GalleryImage, CompanySettings, etc.
