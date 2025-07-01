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

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  pricePerItem: number;
}

export interface Reservation {
  id: string;
  userId: string;
  eventType: string;
  date: Date;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

// Add more types as defined in the "Cahier des Charges"
// e.g., Category, GalleryImage, CompanySettings, etc.
