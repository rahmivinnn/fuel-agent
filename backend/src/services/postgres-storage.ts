import { db } from '../config/database';
import { customers, orders, fuelFriends, vehicles, reviews, notifications, chatMessages, wallets, transactions, fuelStations, products, paymentMethods } from '../types/schema';
import { eq, and, like } from 'drizzle-orm';
import bcrypt from 'bcrypt';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  about?: string;
  location?: string;
  services?: string; // JSON string
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

class StorageService {
  // Customer methods
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const result = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    return result[0] || null;
  }

  async getCustomerByEmailOrPhone(emailOrPhone: string): Promise<Customer | null> {
    const result = await db.select().from(customers)
      .where(eq(customers.email, emailOrPhone))
      .limit(1);
    
    if (result[0]) return result[0];
    
    const phoneResult = await db.select().from(customers)
      .where(eq(customers.phoneNumber, emailOrPhone))
      .limit(1);
    
    return phoneResult[0] || null;
  }

  async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const result = await db.insert(customers).values({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      isEmailVerified: data.isEmailVerified || false,
      otpCode: data.otpCode,
      otpExpires: data.otpExpires
    }).returning();
    
    return result[0];
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0] || null;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const result = await db.update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return result[0] || null;
  }

  // Order methods
  async createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const result = await db.insert(orders).values({
      customerId: data.customerId,
      trackingNumber: data.trackingNumber,
      status: data.status,
      paymentStatus: data.paymentStatus,
      fuelFriendId: data.fuelFriendId,
      deliveryAddress: data.deliveryAddress,
      deliveryPhone: data.deliveryPhone,
      fuelType: data.fuelType,
      totalAmount: data.totalAmount
    }).returning();
    
    return result[0];
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: string): Promise<Order | null> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0] || null;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const result = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return result[0] || null;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId));
  }

  async getOrdersByStatus(customerId: string, status: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(and(eq(orders.customerId, customerId), eq(orders.status, status)));
  }

  // Fuel Friends methods
  // Fuel Friend methods
  async getFuelFriendByEmail(email: string): Promise<any | null> {
    const result = await db.select().from(fuelFriends).where(eq(fuelFriends.email, email)).limit(1);
    return result[0] || null;
  }

  async createFuelFriend(data: any): Promise<any> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const result = await db.insert(fuelFriends).values({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      location: data.location,
      deliveryFee: data.deliveryFee,
      isAvailable: data.isAvailable || true,
    }).returning();
    
    return result[0];
  }

  async getAvailableFuelFriends(): Promise<any[]> {
    return await db.select().from(fuelFriends).where(eq(fuelFriends.isAvailable, true));
  }

  async getFuelFriend(id: string): Promise<any | null> {
    const result = await db.select().from(fuelFriends).where(eq(fuelFriends.id, id)).limit(1);
    return result[0] || null;
  }

  async updateFuelFriend(id: string, updates: any): Promise<any> {
    const result = await db.update(fuelFriends)
      .set(updates)
      .where(eq(fuelFriends.id, id))
      .returning();
    return result[0] || null;
  }

  // Fuel Station methods
  async getAllFuelStations(): Promise<any[]> {
    return await db.select().from(fuelStations);
  }

  async searchFuelStations(query: string): Promise<any[]> {
    return await db.select().from(fuelStations)
      .where(like(fuelStations.name, `%${query}%`));
  }

  async getFuelStation(id: string): Promise<any | null> {
    const result = await db.select().from(fuelStations).where(eq(fuelStations.id, id)).limit(1);
    return result[0] || null;
  }

  // Vehicle methods
  async getVehiclesByCustomer(customerId: string): Promise<any[]> {
    return await db.select().from(vehicles).where(eq(vehicles.customerId, customerId));
  }

  async createVehicle(data: any): Promise<any> {
    const result = await db.insert(vehicles).values(data).returning();
    return result[0];
  }

  async updateVehicle(id: string, updates: any): Promise<any> {
    const result = await db.update(vehicles)
      .set(updates)
      .where(eq(vehicles.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Payment Methods
  async getPaymentMethodsByCustomer(customerId: string): Promise<any[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.customerId, customerId));
  }

  async createPaymentMethod(data: any): Promise<any> {
    const result = await db.insert(paymentMethods).values(data).returning();
    return result[0];
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  // Wallet methods
  async getWallet(driverId: string): Promise<any> {
    const result = await db.select().from(wallets).where(eq(wallets.driverId, driverId)).limit(1);
    
    if (result[0]) return result[0];
    
    const newWallet = await db.insert(wallets).values({
      driverId,
      balance: '0.00'
    }).returning();
    
    return newWallet[0];
  }

  async getTransactions(driverId: string): Promise<any[]> {
    const wallet = await this.getWallet(driverId);
    return await db.select().from(transactions).where(eq(transactions.walletId, wallet.id));
  }

  // Notification methods
  async createNotification(data: any): Promise<any> {
    const result = await db.insert(notifications).values(data).returning();
    return result[0];
  }

  async getNotificationsByCustomer(customerId: string): Promise<any[]> {
    return await db.select().from(notifications).where(eq(notifications.customerId, customerId));
  }

  async markNotificationAsRead(id: string): Promise<any> {
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Chat methods
  async getMessagesByOrder(orderId: string): Promise<any[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.orderId, orderId));
  }

  async createChatMessage(data: any): Promise<any> {
    const result = await db.insert(chatMessages).values(data).returning();
    return result[0];
  }

  // Review methods
  async getReviewsByTarget(targetType: string, targetId: string): Promise<any[]> {
    return await db.select().from(reviews)
      .where(and(eq(reviews.targetType, targetType), eq(reviews.targetId, targetId)));
  }

  async createReview(data: any): Promise<any> {
    const result = await db.insert(reviews).values(data).returning();
    return result[0];
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<any[]> {
    return [];
  }

  async createOrderItem(data: any): Promise<any> {
    return { ...data, id: Date.now().toString() };
  }
}

export const storage = new StorageService();