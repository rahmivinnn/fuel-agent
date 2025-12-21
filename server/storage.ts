import {
  type Customer, type InsertCustomer,
  type Vehicle, type InsertVehicle,
  type FuelStation, type InsertFuelStation,
  type Product, type InsertProduct,
  type FuelFriend, type InsertFuelFriend,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type PaymentMethod, type InsertPaymentMethod,
  type Review, type InsertReview,
  type Notification, type InsertNotification,
  type ChatMessage, type InsertChatMessage,
  type Wallet, type Transaction
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerByEmailOrPhone(emailOrPhone: string): Promise<Customer | undefined>;
  createCustomer(customer: Omit<InsertCustomer, 'isEmailVerified' | 'createdAt'>): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;

  // Vehicle methods
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehiclesByCustomer(customerId: string): Promise<Vehicle[]>;
  getPrimaryVehicle(customerId: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: Omit<InsertVehicle, 'createdAt'>): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Fuel Station methods
  getFuelStation(id: string): Promise<FuelStation | undefined>;
  getAllFuelStations(): Promise<FuelStation[]>;
  searchFuelStations(query?: string): Promise<FuelStation[]>;

  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByStation(stationId: string): Promise<Product[]>;

  // Fuel Friend methods
  getFuelFriend(id: string): Promise<FuelFriend | undefined>;
  getAllFuelFriends(): Promise<FuelFriend[]>;
  getAvailableFuelFriends(): Promise<FuelFriend[]>;

  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByTrackingNumber(trackingNumber: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByStatus(customerId: string, status: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: Omit<InsertOrder, 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order | undefined>;

  // Order Item methods
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: Omit<InsertOrderItem, 'createdAt'>): Promise<OrderItem>;

  // Payment Method methods
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  getPaymentMethodsByCustomer(customerId: string): Promise<PaymentMethod[]>;
  getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: Omit<InsertPaymentMethod, 'createdAt'>): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, method: Partial<PaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: string): Promise<boolean>;

  // Review methods
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByTarget(targetType: string, targetId: string): Promise<Review[]>;
  getReviewsByCustomer(customerId: string): Promise<Review[]>;
  createReview(review: Omit<InsertReview, 'createdAt'>): Promise<Review>;

  // Notification methods
  getNotification(id: string): Promise<Notification | undefined>;
  getNotificationsByCustomer(customerId: string): Promise<Notification[]>;
  getUnreadNotifications(customerId: string): Promise<Notification[]>;
  createNotification(notification: Omit<InsertNotification, 'createdAt'>): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<boolean>;

  // Chat Message methods
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getMessagesByOrder(orderId: string): Promise<ChatMessage[]>;
  createChatMessage(message: Omit<InsertChatMessage, 'createdAt'>): Promise<ChatMessage>;

  // Wallet methods
  getWallet(driverId: string): Promise<Wallet | undefined>;
  createWallet(driverId: string): Promise<Wallet>;
  updateWalletBalance(driverId: string, amount: number): Promise<Wallet>;

  // Transaction methods
  getTransactions(driverId: string): Promise<Transaction[]>;
  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private vehicles: Map<string, Vehicle>;
  private fuelStations: Map<string, FuelStation>;
  private products: Map<string, Product>;
  private fuelFriends: Map<string, FuelFriend>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private paymentMethods: Map<string, PaymentMethod>;
  private reviews: Map<string, Review>;
  private notifications: Map<string, Notification>;
  private chatMessages: Map<string, ChatMessage>;
  private wallets: Map<string, Wallet>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.customers = new Map();
    this.vehicles = new Map();
    this.fuelStations = new Map();
    this.products = new Map();
    this.fuelFriends = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.paymentMethods = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    this.chatMessages = new Map();
    this.wallets = new Map();
    this.transactions = new Map();

    this.initializeMockData();
  }

  private initializeMockData() {
    // Create test customer
    const testCustomer: Customer = {
      id: "cust1",
      fullName: "Robin Sharma",
      email: "robin@example.com",
      phoneNumber: "923553344550",
      password: "password123",
      gender: "Male",
      city: "Toronto, Canada",
      address: "123 Main Street, Toronto",
      isEmailVerified: true,
      profilePhoto: null,
      otpCode: null,
      otpExpires: null,
      createdAt: new Date(),
    };
    this.customers.set(testCustomer.id, testCustomer);

    // Create test vehicle
    const testVehicle: Vehicle = {
      id: "veh1",
      customerId: "cust1",
      brand: "Mercedes-Benz",
      color: "Red",
      licenseNumber: "CAN A980",
      fuelType: "Premium",
      isPrimary: true,
      createdAt: new Date(),
    };
    this.vehicles.set(testVehicle.id, testVehicle);

    // Create fuel stations
    const stations: FuelStation[] = [
      {
        id: "station1",
        name: "Petro Tennessee",
        address: "Abcd Tennessee",
        latitude: "36.1627",
        longitude: "-86.7816",
        regularPrice: "1.23",
        premiumPrice: "1.75",
        dieselPrice: "2.14",
        rating: "4.7",
        totalReviews: 146,
        averageDeliveryTime: 30,
        isOpen24_7: true,
        createdAt: new Date(),
      },
      {
        id: "station2",
        name: "TurboFuel Express",
        address: "1234 Energy Drive, Houston",
        latitude: "29.7604",
        longitude: "-95.3698",
        regularPrice: "1.20",
        premiumPrice: "1.70",
        dieselPrice: "2.10",
        rating: "4.6",
        totalReviews: 24,
        averageDeliveryTime: 25,
        isOpen24_7: true,
        createdAt: new Date(),
      },
    ];
    stations.forEach(station => this.fuelStations.set(station.id, station));

    // Create groceries/products
    const products: Product[] = [
      {
        id: "prod1",
        stationId: "station1",
        name: "Potato Chips",
        category: "Snacks",
        price: "3.49",
        image: null,
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod2",
        stationId: "station1",
        name: "Still Water 500ml",
        category: "Drinks",
        price: "1.29",
        image: null,
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod3",
        stationId: "station1",
        name: "Sourdough Bread",
        category: "Food",
        price: "4.50",
        image: null,
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod4",
        stationId: "station1",
        name: "Milk Chocolate Bar",
        category: "Snacks",
        price: "2.99",
        image: null,
        inStock: true,
        createdAt: new Date(),
      },
      {
        id: "prod5",
        stationId: "station1",
        name: "Butter Cookies",
        category: "Snacks",
        price: "3.59",
        image: null,
        inStock: true,
        createdAt: new Date(),
      },
    ];
    products.forEach(product => this.products.set(product.id, product));

    // Create fuel friends
    const fuelFriends: FuelFriend[] = [
      {
        id: "ff1",
        fullName: "Shah Hussain",
        phoneNumber: "+1234567890",
        email: "shah@fuelfriend.com",
        location: "Tennessee",
        deliveryFee: "5.00",
        rating: "4.8",
        totalReviews: 46,
        latitude: "36.1627",
        longitude: "-86.7816",
        profilePhoto: null,
        about: "Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers. Whether you're stranded on the road or simply looking to avoid the hassle of gas stations, our trusted Fuel Friends ensure that you get quality fuel delivered right to your location.",
        isAvailable: true,
        createdAt: new Date(),
      },
      {
        id: "ff2",
        fullName: "Cristopert Dastin",
        phoneNumber: "+1234567891",
        email: "cristopert@fuelfriend.com",
        location: "Tennessee",
        deliveryFee: "5.00",
        rating: "4.9",
        totalReviews: 52,
        latitude: "36.1627",
        longitude: "-86.7816",
        profilePhoto: null,
        about: "Professional fuel delivery service with over 5 years of experience.",
        isAvailable: true,
        createdAt: new Date(),
      },
    ];
    fuelFriends.forEach(ff => this.fuelFriends.set(ff.id, ff));

    // Create test order
    // Create test orders
    const orders: Order[] = [
      {
        id: "order1",
        trackingNumber: "162432",
        customerId: "cust1",
        stationId: "station1",
        fuelFriendId: "ff1",
        vehicleId: "veh1",
        deliveryAddress: "123 Main Street, Toronto, Canada",
        deliveryPhone: "923553344550",
        fuelType: "Premium",
        fuelQuantity: "2.00",
        fuelCost: "283.00",
        deliveryFee: "5.00",
        groceriesCost: "20.00",
        totalAmount: "308.00",
        orderType: "instant",
        scheduledDate: null,
        scheduledTime: null,
        estimatedDeliveryTime: "8:30 - 9:15 PM",
        status: "in_progress",
        paymentStatus: "completed",
        paymentMethod: "credit_card",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "order2",
        trackingNumber: "GB8821",
        customerId: "cust1",
        stationId: "station1",
        fuelFriendId: null, // Pending order
        vehicleId: "veh1",
        deliveryAddress: "10 Downing St, London, UK",
        deliveryPhone: "+44 20 7925 0918",
        fuelType: "Diesel",
        fuelQuantity: "15.00",
        fuelCost: "25.00",
        deliveryFee: "3.00",
        groceriesCost: "0.00",
        totalAmount: "28.00",
        orderType: "instant",
        scheduledDate: null,
        scheduledTime: null,
        estimatedDeliveryTime: "15-20 min",
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "paypal",
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        updatedAt: new Date(),
      },
      {
        id: "order3",
        trackingNumber: "US9922",
        customerId: "cust1",
        stationId: "station2",
        fuelFriendId: "ff1",
        vehicleId: "veh1",
        deliveryAddress: "350 5th Ave, New York, NY, USA",
        deliveryPhone: "+1 212-736-3100",
        fuelType: "Regular",
        fuelQuantity: "10.00",
        fuelCost: "40.00",
        deliveryFee: "5.00",
        groceriesCost: "15.00",
        totalAmount: "60.00",
        orderType: "instant",
        scheduledDate: null,
        scheduledTime: null,
        estimatedDeliveryTime: "30-45 min",
        status: "active",
        paymentStatus: "completed",
        paymentMethod: "apple_pay",
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        updatedAt: new Date(),
      },
      {
        id: "order4",
        trackingNumber: "US9923",
        customerId: "cust1",
        stationId: "station2",
        fuelFriendId: null, // Pending
        vehicleId: "veh1",
        deliveryAddress: "40 Wall St, New York, NY, USA",
        deliveryPhone: "+1 212-736-3100",
        fuelType: "Premium",
        fuelQuantity: "5.00",
        fuelCost: "22.00",
        deliveryFee: "5.00",
        groceriesCost: "0.00",
        totalAmount: "27.00",
        orderType: "instant",
        scheduledDate: null,
        scheduledTime: null,
        estimatedDeliveryTime: "10-15 min",
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "credit_card",
        createdAt: new Date(Date.now() - 1000 * 60 * 2),
        updatedAt: new Date(),
      }
    ];
    orders.forEach(o => this.orders.set(o.id, o));

    // Create order items
    const orderItems: OrderItem[] = [
      {
        id: "oi1",
        orderId: "order1",
        productId: "prod4",
        productName: "Chocolate cookies",
        quantity: 2,
        price: "10.00",
        total: "20.00",
        createdAt: new Date(),
      },
    ];
    orderItems.forEach(item => this.orderItems.set(item.id, item));

    // Create payment method
    const paymentMethod: PaymentMethod = {
      id: "pm1",
      customerId: "cust1",
      type: "mastercard",
      cardHolderName: "Robin Sharma",
      cardNumber: "7873", // last 4 digits
      expiryDate: "10/28",
      billingAddress: "123 Main Street, Toronto",
      isDefault: true,
      createdAt: new Date(),
    };
    this.paymentMethods.set(paymentMethod.id, paymentMethod);

    // Create reviews
    const reviews: Review[] = [
      {
        id: "rev1",
        customerId: "cust1",
        orderId: null,
        targetType: "station",
        targetId: "station1",
        rating: 5,
        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod, nunc vel tristique feugiat, libero justo vehicula purus.",
        createdAt: new Date(),
      },
      {
        id: "rev2",
        customerId: "cust1",
        orderId: null,
        targetType: "fuel_friend",
        targetId: "ff1",
        rating: 5,
        comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod, nunc vel tristique feugiat, libero justo vehicula purus.",
        createdAt: new Date(),
      },
    ];
    reviews.forEach(review => this.reviews.set(review.id, review));

    // Create notifications
    const notifications: Notification[] = [
      {
        id: "not1",
        customerId: "cust1",
        title: "Your order arrived",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        type: "order_update",
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: "not2",
        customerId: "cust1",
        title: "Payment Successful",
        message: "Your payment of $308.00 has been successfully processed.",
        type: "payment",
        isRead: false,
        createdAt: new Date(),
      },
    ];
    notifications.forEach(notif => this.notifications.set(notif.id, notif));

    // Create wallet for driver ff1
    const wallet: Wallet = {
      id: "wallet1",
      driverId: "ff1",
      balance: "245.50",
      currency: "USD",
      bankName: "Chase Bank",
      cardNumber: "4532",
      expiryDate: "12/26",
      cvv: "123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.wallets.set(wallet.id, wallet);

    // Create sample transactions
    const transactions: Transaction[] = [
      {
        id: "txn1",
        walletId: "wallet1",
        type: "deposit",
        amount: "25.00",
        status: "completed",
        date: new Date().toISOString().split('T')[0],
        time: "14:30",
        createdAt: new Date(),
      },
      {
        id: "txn2",
        walletId: "wallet1",
        type: "payment",
        amount: "15.00",
        status: "completed",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
        time: "09:15",
        createdAt: new Date(Date.now() - 86400000),
      },
    ];
    transactions.forEach(txn => this.transactions.set(txn.id, txn));
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.email === email);
  }

  async getCustomerByEmailOrPhone(emailOrPhone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      c => c.email === emailOrPhone || c.phoneNumber === emailOrPhone
    );
  }

  async createCustomer(insertCustomer: Omit<InsertCustomer, 'isEmailVerified' | 'createdAt'>): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      gender: null,
      city: null,
      address: null,
      profilePhoto: null,
      otpCode: null,
      otpExpires: null,
      ...insertCustomer,
      id,
      isEmailVerified: false,
      createdAt: new Date()
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Vehicle methods
  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async getVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(v => v.customerId === customerId);
  }

  async getPrimaryVehicle(customerId: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      v => v.customerId === customerId && v.isPrimary
    );
  }

  async createVehicle(insertVehicle: Omit<InsertVehicle, 'createdAt'>): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      isPrimary: null,
      ...insertVehicle,
      id,
      createdAt: new Date()
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    const updatedVehicle = { ...vehicle, ...updates };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Fuel Station methods
  async getFuelStation(id: string): Promise<FuelStation | undefined> {
    return this.fuelStations.get(id);
  }

  async getAllFuelStations(): Promise<FuelStation[]> {
    return Array.from(this.fuelStations.values());
  }

  async searchFuelStations(query?: string): Promise<FuelStation[]> {
    const stations = Array.from(this.fuelStations.values());
    if (!query) return stations;
    const lowerQuery = query.toLowerCase();
    return stations.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.address.toLowerCase().includes(lowerQuery)
    );
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByStation(stationId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.stationId === stationId);
  }

  // Fuel Friend methods
  async getFuelFriend(id: string): Promise<FuelFriend | undefined> {
    return this.fuelFriends.get(id);
  }

  async getAllFuelFriends(): Promise<FuelFriend[]> {
    return Array.from(this.fuelFriends.values());
  }

  async getAvailableFuelFriends(): Promise<FuelFriend[]> {
    return Array.from(this.fuelFriends.values()).filter(ff => ff.isAvailable);
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByTrackingNumber(trackingNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(o => o.trackingNumber === trackingNumber);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.customerId === customerId);
  }

  async getOrdersByStatus(customerId: string, status: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      o => o.customerId === customerId && o.status === status
    );
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: Omit<InsertOrder, 'createdAt' | 'updatedAt'>): Promise<Order> {
    const id = randomUUID();
    const order: any = {
      stationId: null,
      fuelFriendId: null,
      vehicleId: null,
      fuelType: null,
      fuelQuantity: null,
      fuelCost: null,
      scheduledDate: null,
      scheduledTime: null,
      estimatedDeliveryTime: null,
      paymentMethod: null,
      groceriesCost: "0",
      paymentStatus: "pending",
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item methods
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(oi => oi.orderId === orderId);
  }

  async createOrderItem(insertItem: Omit<InsertOrderItem, 'createdAt'>): Promise<OrderItem> {
    const id = randomUUID();
    const item: OrderItem = {
      productId: null,
      quantity: 1,
      ...insertItem,
      id,
      createdAt: new Date()
    };
    this.orderItems.set(id, item);
    return item;
  }

  // Payment Method methods
  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async getPaymentMethodsByCustomer(customerId: string): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter(pm => pm.customerId === customerId);
  }

  async getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | undefined> {
    return Array.from(this.paymentMethods.values()).find(
      pm => pm.customerId === customerId && pm.isDefault
    );
  }

  async createPaymentMethod(insertMethod: Omit<InsertPaymentMethod, 'createdAt'>): Promise<PaymentMethod> {
    const id = randomUUID();
    const method: PaymentMethod = {
      cardHolderName: null,
      cardNumber: null,
      expiryDate: null,
      billingAddress: null,
      isDefault: null,
      ...insertMethod,
      id,
      createdAt: new Date()
    };
    this.paymentMethods.set(id, method);
    return method;
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | undefined> {
    const method = this.paymentMethods.get(id);
    if (!method) return undefined;
    const updatedMethod = { ...method, ...updates };
    this.paymentMethods.set(id, updatedMethod);
    return updatedMethod;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  // Review methods
  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByTarget(targetType: string, targetId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      r => r.targetType === targetType && r.targetId === targetId
    );
  }

  async getReviewsByCustomer(customerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(r => r.customerId === customerId);
  }

  async createReview(insertReview: Omit<InsertReview, 'createdAt'>): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      orderId: null,
      comment: null,
      ...insertReview,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  // Notification methods
  async getNotification(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByCustomer(customerId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.customerId === customerId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUnreadNotifications(customerId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      n => n.customerId === customerId && !n.isRead
    );
  }

  async createNotification(insertNotification: Omit<InsertNotification, 'createdAt'>): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      isRead: null,
      ...insertNotification,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Chat Message methods
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }

  async getMessagesByOrder(orderId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.orderId === orderId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createChatMessage(insertMessage: Omit<InsertChatMessage, 'createdAt'>): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    return message;
  }

  // Wallet methods
  async getWallet(driverId: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(w => w.driverId === driverId);
  }

  async createWallet(driverId: string): Promise<Wallet> {
    const id = randomUUID();
    const wallet: Wallet = {
      id,
      driverId,
      balance: "0.00",
      currency: "USD",
      bankName: null,
      cardNumber: null,
      expiryDate: null,
      cvv: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWalletBalance(driverId: string, amount: number): Promise<Wallet> {
    let wallet = await this.getWallet(driverId);
    if (!wallet) {
      wallet = await this.createWallet(driverId);
    }

    // safe float math?
    const currentBalance = parseFloat(wallet.balance || "0");
    const newBalance = (currentBalance + amount).toFixed(2);

    const updatedWallet = { ...wallet, balance: newBalance, updatedAt: new Date() };
    this.wallets.set(updatedWallet.id, updatedWallet);
    return updatedWallet;
  }

  // Transaction methods
  async getTransactions(driverId: string): Promise<Transaction[]> {
    const wallet = await this.getWallet(driverId);
    if (!wallet) return [];

    return Array.from(this.transactions.values())
      .filter(t => t.walletId === wallet?.id)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createTransaction(insertTransaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
}

export const storage = new MemStorage();
