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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  allergens?: string[];
  available: boolean;
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
