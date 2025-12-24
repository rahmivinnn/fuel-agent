import { eq, and, desc, like } from "drizzle-orm";
import { db } from "./db";
import {
  customers, vehicles, fuelStations, products, fuelFriends, orders, orderItems,
  paymentMethods, reviews, notifications, chatMessages, wallets, transactions,
  type Customer, type InsertCustomer, type Vehicle, type InsertVehicle,
  type FuelStation, type Product, type FuelFriend, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type PaymentMethod, type InsertPaymentMethod,
  type Review, type InsertReview, type Notification, type InsertNotification,
  type ChatMessage, type InsertChatMessage, type Wallet, type Transaction
} from "@shared/schema";
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.email, email));
    return result[0];
  }

  async getCustomerByEmailOrPhone(emailOrPhone: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers)
      .where(eq(customers.email, emailOrPhone))
      .union(db.select().from(customers).where(eq(customers.phoneNumber, emailOrPhone)));
    return result[0];
  }

  async createCustomer(customer: Omit<InsertCustomer, 'isEmailVerified' | 'createdAt'>): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const result = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return result[0];
  }

  // Vehicle methods
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return result[0];
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.customerId, customerId));
  }

  async getPrimaryVehicle(customerId: string): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles)
      .where(and(eq(vehicles.customerId, customerId), eq(vehicles.isPrimary, true)));
    return result[0];
  }

  async createVehicle(vehicle: Omit<InsertVehicle, 'createdAt'>): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(vehicle).returning();
    return result[0];
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const result = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
    return result[0];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount > 0;
  }

  // Fuel Station methods
  async getFuelStation(id: string): Promise<FuelStation | undefined> {
    const result = await db.select().from(fuelStations).where(eq(fuelStations.id, id));
    return result[0];
  }

  async getAllFuelStations(): Promise<FuelStation[]> {
    return await db.select().from(fuelStations);
  }

  async searchFuelStations(query?: string): Promise<FuelStation[]> {
    if (!query) return this.getAllFuelStations();
    return await db.select().from(fuelStations)
      .where(like(fuelStations.name, `%${query}%`));
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async getProductsByStation(stationId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.stationId, stationId));
  }

  // Fuel Friend methods
  async getFuelFriend(id: string): Promise<FuelFriend | undefined> {
    const result = await db.select().from(fuelFriends).where(eq(fuelFriends.id, id));
    return result[0];
  }

  async getAllFuelFriends(): Promise<FuelFriend[]> {
    return await db.select().from(fuelFriends);
  }

  async getAvailableFuelFriends(): Promise<FuelFriend[]> {
    return await db.select().from(fuelFriends).where(eq(fuelFriends.isAvailable, true));
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getOrderByTrackingNumber(trackingNumber: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.trackingNumber, trackingNumber));
    return result[0];
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));
  }

  async getOrdersByStatus(customerId: string, status: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(and(eq(orders.customerId, customerId), eq(orders.status, status)))
      .orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: Omit<InsertOrder, 'createdAt' | 'updatedAt'>): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }

  // Order Item methods
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: Omit<InsertOrderItem, 'createdAt'>): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(item).returning();
    return result[0];
  }

  // Payment Method methods
  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return result[0];
  }

  async getPaymentMethodsByCustomer(customerId: string): Promise<PaymentMethod[]> {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.customerId, customerId));
  }

  async getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | undefined> {
    const result = await db.select().from(paymentMethods)
      .where(and(eq(paymentMethods.customerId, customerId), eq(paymentMethods.isDefault, true)));
    return result[0];
  }

  async createPaymentMethod(method: Omit<InsertPaymentMethod, 'createdAt'>): Promise<PaymentMethod> {
    const result = await db.insert(paymentMethods).values(method).returning();
    return result[0];
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const result = await db.update(paymentMethods).set(updates).where(eq(paymentMethods.id, id)).returning();
    return result[0];
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return result.rowCount > 0;
  }

  // Review methods
  async getReview(id: string): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id));
    return result[0];
  }

  async getReviewsByTarget(targetType: string, targetId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(and(eq(reviews.targetType, targetType), eq(reviews.targetId, targetId)))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsByCustomer(customerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.customerId, customerId));
  }

  async createReview(review: Omit<InsertReview, 'createdAt'>): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  // Notification methods
  async getNotification(id: string): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id));
    return result[0];
  }

  async getNotificationsByCustomer(customerId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(eq(notifications.customerId, customerId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(customerId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(eq(notifications.customerId, customerId), eq(notifications.isRead, false)));
  }

  async createNotification(notification: Omit<InsertNotification, 'createdAt'>): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const result = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return result[0];
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return result.rowCount > 0;
  }

  // Chat Message methods
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    const result = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return result[0];
  }

  async getMessagesByOrder(orderId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.orderId, orderId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: Omit<InsertChatMessage, 'createdAt'>): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  // Wallet methods
  async getWallet(driverId: string): Promise<Wallet | undefined> {
    const result = await db.select().from(wallets).where(eq(wallets.driverId, driverId));
    return result[0];
  }

  async createWallet(driverId: string): Promise<Wallet> {
    const result = await db.insert(wallets).values({ driverId }).returning();
    return result[0];
  }

  async updateWalletBalance(driverId: string, amount: number): Promise<Wallet> {
    let wallet = await this.getWallet(driverId);
    if (!wallet) {
      wallet = await this.createWallet(driverId);
    }

    const currentBalance = parseFloat(wallet.balance || "0");
    const newBalance = (currentBalance + amount).toFixed(2);

    const result = await db.update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(wallets.driverId, driverId))
      .returning();
    return result[0];
  }

  // Transaction methods
  async getTransactions(driverId: string): Promise<Transaction[]> {
    const wallet = await this.getWallet(driverId);
    if (!wallet) return [];

    return await db.select().from(transactions)
      .where(eq(transactions.walletId, wallet.id))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }
}