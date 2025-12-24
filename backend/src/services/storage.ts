interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  isEmailVerified?: boolean;
  otpCode?: string | null;
  otpExpires?: Date | null;
  createdAt?: Date;
}

interface Order {
  id: string;
  customerId: string;
  trackingNumber: string;
  status: string;
  paymentStatus: string;
  fuelFriendId?: string;
  deliveryAddress: string;
  deliveryPhone?: string;
  fuelType: string;
  totalAmount: string;
  createdAt?: Date;
}

interface FuelFriend {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  rating: number;
  deliveryFee: string;
  isAvailable: boolean;
}

class StorageService {
  private customers: Customer[] = [];
  private orders: Order[] = [];
  private fuelFriends: FuelFriend[] = [];
  private stations: any[] = [];
  private vehicles: any[] = [];
  private reviews: any[] = [];
  private notifications: any[] = [];
  private messages: any[] = [];
  private wallets: any[] = [];
  private transactions: any[] = [];

  // Customer methods
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    return this.customers.find(c => c.email === email) || null;
  }

  async getCustomerByEmailOrPhone(emailOrPhone: string): Promise<Customer | null> {
    return this.customers.find(c => c.email === emailOrPhone || c.phoneNumber === emailOrPhone) || null;
  }

  async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const customer: Customer = {
      ...data,
      password: hashedPassword,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.customers.push(customer);
    return customer;
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.customers.find(c => c.id === id) || null;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.customers[index] = { ...this.customers[index], ...updates };
    return this.customers[index];
  }

  // Order methods
  async createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const order: Order = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.orders.push(order);
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orders;
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.orders.find(o => o.id === id) || null;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const index = this.orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    this.orders[index] = { ...this.orders[index], ...updates };
    return this.orders[index];
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return this.orders.filter(o => o.customerId === customerId);
  }

  async getOrdersByStatus(customerId: string, status: string): Promise<Order[]> {
    return this.orders.filter(o => o.customerId === customerId && o.status === status);
  }

  // Fuel Friends methods
  async getAvailableFuelFriends(): Promise<FuelFriend[]> {
    return this.fuelFriends.filter(f => f.isAvailable);
  }

  async getFuelFriend(id: string): Promise<FuelFriend | null> {
    return this.fuelFriends.find(f => f.id === id) || null;
  }

  async updateFuelFriend(id: string, updates: any): Promise<any> {
    const index = this.fuelFriends.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.fuelFriends[index] = { ...this.fuelFriends[index], ...updates };
    return this.fuelFriends[index];
  }

  // Station methods
  async getAllFuelStations(): Promise<any[]> {
    return this.stations;
  }

  async searchFuelStations(query: string): Promise<any[]> {
    return this.stations.filter(s => 
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getFuelStation(id: string): Promise<any | null> {
    return this.stations.find(s => s.id === id) || null;
  }

  async getProductsByStation(stationId: string): Promise<any[]> {
    return [];
  }

  // Vehicle methods
  async getVehiclesByCustomer(customerId: string): Promise<any[]> {
    return this.vehicles.filter(v => v.customerId === customerId);
  }

  async createVehicle(data: any): Promise<any> {
    const vehicle = { ...data, id: Date.now().toString() };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: any): Promise<any> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return null;
    this.vehicles[index] = { ...this.vehicles[index], ...updates };
    return this.vehicles[index];
  }

  async deleteVehicle(id: string): Promise<void> {
    this.vehicles = this.vehicles.filter(v => v.id !== id);
  }

  // Review methods
  async getReviewsByTarget(targetType: string, targetId: string): Promise<any[]> {
    return this.reviews.filter(r => r.targetType === targetType && r.targetId === targetId);
  }

  async createReview(data: any): Promise<any> {
    const review = { ...data, id: Date.now().toString(), createdAt: new Date() };
    this.reviews.push(review);
    return review;
  }

  // Notification methods
  async createNotification(data: any): Promise<any> {
    const notification = { ...data, id: Date.now().toString(), createdAt: new Date() };
    this.notifications.push(notification);
    return notification;
  }

  async getNotificationsByCustomer(customerId: string): Promise<any[]> {
    return this.notifications.filter(n => n.customerId === customerId);
  }

  async markNotificationAsRead(id: string): Promise<any> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return null;
    this.notifications[index].isRead = true;
    return this.notifications[index];
  }

  async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // Chat methods
  async getMessagesByOrder(orderId: string): Promise<any[]> {
    return this.messages.filter(m => m.orderId === orderId);
  }

  async createChatMessage(data: any): Promise<any> {
    const message = { ...data, id: Date.now().toString(), createdAt: new Date() };
    this.messages.push(message);
    return message;
  }

  // Wallet methods
  async getWallet(driverId: string): Promise<any> {
    let wallet = this.wallets.find(w => w.driverId === driverId);
    if (!wallet) {
      wallet = { driverId, balance: '0.00', id: Date.now().toString() };
      this.wallets.push(wallet);
    }
    return wallet;
  }

  async createWallet(driverId: string): Promise<any> {
    const wallet = { driverId, balance: '0.00', id: Date.now().toString() };
    this.wallets.push(wallet);
    return wallet;
  }

  async updateWalletBalance(driverId: string, amount: number): Promise<any> {
    const wallet = await this.getWallet(driverId);
    wallet.balance = (parseFloat(wallet.balance) + amount).toFixed(2);
    return wallet;
  }

  async getTransactions(driverId: string): Promise<any[]> {
    return this.transactions.filter(t => t.driverId === driverId);
  }

  // Payment methods
  async getPaymentMethodsByCustomer(customerId: string): Promise<any[]> {
    return [];
  }

  async createPaymentMethod(data: any): Promise<any> {
    return { ...data, id: Date.now().toString() };
  }

  async deletePaymentMethod(id: string): Promise<void> {
    // Implementation
  }

  async getOrderItems(orderId: string): Promise<any[]> {
    return [];
  }

  async createOrderItem(data: any): Promise<any> {
    return { ...data, id: Date.now().toString() };
  }
}

export const storage = new StorageService();