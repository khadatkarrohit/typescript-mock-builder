export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export type Product = {
  id: number;
  productName: string;
  price: number;
  tags: string[];
  available: boolean;
};
