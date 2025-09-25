// User types
export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'business';
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled';
  invoiceCount: number;
  maxInvoices: number;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Customer types
export interface Customer {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Invoice types
export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  unitPrice: number; // Add unitPrice alias for compatibility
  amount: number;
  total: number; // Add total alias for compatibility
  details?: string; // Optional details field
}

export interface Invoice {
  _id: string;
  userId: string;
  customerId: Customer | string;
  customer: Customer; // Add customer property
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  terms?: string;
  template: 'default' | 'modern' | 'minimal' | 'professional';
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  total: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
  totalRevenue: number;
  paidRevenue: number;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: InvoiceSummary;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CustomerForm {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  taxId?: string;
  notes?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface InvoiceForm {
  customerId: string;
  items: Omit<InvoiceItem, 'amount'>[];
  dueDate: string;
  taxRate: number;
  discountRate: number;
  currency: string;
  notes?: string;
  terms?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// Subscription plans
export interface Plan {
  id: 'free' | 'pro' | 'business';
  name: string;
  price: number;
  features: string[];
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Table types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

// Filter types
export interface FilterOption {
  label: string;
  value: string;
}

export interface InvoiceFilters {
  status: string;
  dateRange: string;
  customer: string;
  search: string;
}