
export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  COST_VOLUME = 'COST_VOLUME'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber?: string;
  address?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId?: string;
  clientName: string;
  clientPhone?: string;
  type: 'Air Ticket' | 'Hotel' | 'Visa' | 'Package';
  date: string; // Entry date
  issueDate?: string; // Ticket Issue Date
  travelTime?: string; // Flight/Travel time
  amount: number;
  cost: number;
  status: BookingStatus;
  description: string;
  pax?: number; // Number of passengers
  pnr?: string;
  route?: string;
  from?: string;
  to?: string;
  flyingDate?: string;
  checkIn?: string;
  checkOut?: string;
  hotelName?: string;
  bookingSource?: string;
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: TransactionType;
  bookingId?: string;
  reference: string;
}

export interface AgencyStats {
  totalSales: number;
  totalCost: number;
  netProfit: number;
  pendingInvoices: number;
}
