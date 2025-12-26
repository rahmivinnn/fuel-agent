import { db } from "./db";
import {
  customers, vehicles, fuelStations, products, fuelFriends, orders, orderItems,
  paymentMethods, reviews, notifications, wallets, transactions
} from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data first
  await db.delete(transactions);
  await db.delete(wallets);
  await db.delete(orders);
  await db.delete(products);
  await db.delete(fuelFriends);
  await db.delete(fuelStations);
  await db.delete(vehicles);
  await db.delete(customers);
  
  console.log("🗑️ Cleared existing data");

  // Create test customers (US & UK)
  const [customerUS, customerUK] = await db.insert(customers).values([
    {
      fullName: "John Smith",
      email: "john@example.com",
      phoneNumber: "+1-555-0123",
      password: "password123",
      gender: "Male",
      city: "New York, NY",
      address: "123 Broadway, New York, NY 10001",
      isEmailVerified: true,
    },
    {
      fullName: "Emma Johnson",
      email: "emma@example.com",
      phoneNumber: "+44-20-7946-0958",
      password: "password123",
      gender: "Female",
      city: "London, UK",
      address: "10 Downing Street, London SW1A 2AA",
      isEmailVerified: true,
    }
  ]).returning();

  // Create test vehicles
  await db.insert(vehicles).values([
    {
      customerId: customerUS.id,
      brand: "Ford",
      color: "Blue",
      licenseNumber: "NY-ABC-123",
      fuelType: "Premium",
      isPrimary: true,
    },
    {
      customerId: customerUK.id,
      brand: "BMW",
      color: "Black",
      licenseNumber: "LN18-ABC",
      fuelType: "Diesel",
      isPrimary: true,
    }
  ]);

  // Create fuel stations (US & UK)
  const [stationUS1, stationUS2, stationUK1, stationUK2] = await db.insert(fuelStations).values([
    {
      name: "Shell Station NYC",
      address: "456 5th Avenue, New York, NY 10018",
      latitude: "40.7589",
      longitude: "-73.9851",
      regularPrice: "3.45",
      premiumPrice: "3.85",
      dieselPrice: "3.95",
      rating: "4.5",
      totalReviews: 128,
      averageDeliveryTime: 25,
      isOpen24_7: true,
    },
    {
      name: "Exxon Mobil LA",
      address: "789 Sunset Blvd, Los Angeles, CA 90028",
      latitude: "34.0928",
      longitude: "-118.3287",
      regularPrice: "3.65",
      premiumPrice: "4.05",
      dieselPrice: "4.15",
      rating: "4.3",
      totalReviews: 95,
      averageDeliveryTime: 30,
      isOpen24_7: true,
    },
    {
      name: "BP London Central",
      address: "123 Oxford Street, London W1C 1DX",
      latitude: "51.5154",
      longitude: "-0.1447",
      regularPrice: "1.45",
      premiumPrice: "1.55",
      dieselPrice: "1.50",
      rating: "4.6",
      totalReviews: 87,
      averageDeliveryTime: 20,
      isOpen24_7: true,
    },
    {
      name: "Tesco Petrol Manchester",
      address: "456 Deansgate, Manchester M3 2AY",
      latitude: "53.4808",
      longitude: "-2.2426",
      regularPrice: "1.42",
      premiumPrice: "1.52",
      dieselPrice: "1.48",
      rating: "4.4",
      totalReviews: 64,
      averageDeliveryTime: 25,
      isOpen24_7: false,
    },
  ]).returning();

  // Create products
  await db.insert(products).values([
    {
      stationId: stationUS1.id,
      name: "Lay's Potato Chips",
      category: "Snacks",
      price: "2.99",
      inStock: true,
    },
    {
      stationId: stationUS1.id,
      name: "Coca-Cola 500ml",
      category: "Drinks",
      price: "1.99",
      inStock: true,
    },
    {
      stationId: stationUK1.id,
      name: "Walker's Crisps",
      category: "Snacks",
      price: "1.25",
      inStock: true,
    },
    {
      stationId: stationUK1.id,
      name: "Evian Water 500ml",
      category: "Drinks",
      price: "1.50",
      inStock: true,
    },
  ]);

  // Create fuel friends (US & UK drivers)
  const [ffUS1, ffUS2, ffUK1, ffUK2] = await db.insert(fuelFriends).values([
    {
      fullName: "Michael Johnson",
      phoneNumber: "+1-555-0199",
      email: "michael@fuelfriend.com",
      location: "New York, NY",
      deliveryFee: "8.00",
      rating: "4.8",
      totalReviews: 156,
      latitude: "40.7589",
      longitude: "-73.9851",
      about: "Professional fuel delivery driver serving NYC area with 3+ years experience.",
      isAvailable: true,
    },
    {
      fullName: "Sarah Williams",
      phoneNumber: "+1-555-0288",
      email: "sarah@fuelfriend.com",
      location: "Los Angeles, CA",
      deliveryFee: "7.50",
      rating: "4.9",
      totalReviews: 203,
      latitude: "34.0928",
      longitude: "-118.3287",
      about: "Reliable fuel delivery service in LA with excellent customer ratings.",
      isAvailable: true,
    },
    {
      fullName: "James Thompson",
      phoneNumber: "+44-20-7946-1234",
      email: "james@fuelfriend.co.uk",
      location: "London, UK",
      deliveryFee: "5.00",
      rating: "4.7",
      totalReviews: 89,
      latitude: "51.5154",
      longitude: "-0.1447",
      about: "Experienced fuel delivery driver covering Central London areas.",
      isAvailable: true,
    },
    {
      fullName: "Emily Davis",
      phoneNumber: "+44-161-123-4567",
      email: "emily@fuelfriend.co.uk",
      location: "Manchester, UK",
      deliveryFee: "4.50",
      rating: "4.6",
      totalReviews: 67,
      latitude: "53.4808",
      longitude: "-2.2426",
      about: "Friendly and punctual fuel delivery service in Greater Manchester.",
      isAvailable: true,
    },
  ]).returning();

  // Create orders (US & UK)
  const [orderUS1, orderUK1, orderUS2, orderUS3, orderUK2, orderUK3] = await db.insert(orders).values([
    {
      trackingNumber: "US001234",
      customerId: customerUS.id,
      stationId: stationUS1.id,
      fuelFriendId: ffUS1.id,
      deliveryAddress: "123 Broadway, New York, NY 10001",
      deliveryPhone: "+1-555-0123",
      fuelType: "Premium",
      fuelQuantity: "15.00",
      fuelCost: "57.75",
      deliveryFee: "8.00",
      groceriesCost: "4.98",
      totalAmount: "70.73",
      orderType: "instant",
      estimatedDeliveryTime: "2:30 - 3:15 PM",
      status: "in_progress",
      paymentStatus: "completed",
      paymentMethod: "credit_card",
    },
    {
      trackingNumber: "UK002156",
      customerId: customerUK.id,
      stationId: stationUK1.id,
      fuelFriendId: ffUK1.id,
      deliveryAddress: "10 Downing Street, London SW1A 2AA",
      deliveryPhone: "+44-20-7946-0958",
      fuelType: "Diesel",
      fuelQuantity: "20.00",
      fuelCost: "30.00",
      deliveryFee: "5.00",
      totalAmount: "35.00",
      orderType: "instant",
      estimatedDeliveryTime: "15-25 min",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "paypal",
    },
    {
      trackingNumber: "US001235",
      customerId: customerUS.id,
      stationId: stationUS2.id,
      deliveryAddress: "456 Hollywood Blvd, Los Angeles, CA 90028",
      deliveryPhone: "+1-555-0123",
      fuelType: "Regular",
      fuelQuantity: "12.00",
      fuelCost: "43.80",
      deliveryFee: "7.50",
      totalAmount: "51.30",
      orderType: "scheduled",
      estimatedDeliveryTime: "Tomorrow 9:00 AM",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "credit_card",
    },
    {
      trackingNumber: "US001236",
      customerId: customerUS.id,
      stationId: stationUS1.id,
      fuelFriendId: ffUS1.id,
      deliveryAddress: "789 Times Square, New York, NY 10036",
      deliveryPhone: "+1-555-0123",
      fuelType: "Premium",
      fuelQuantity: "18.00",
      fuelCost: "69.30",
      deliveryFee: "8.00",
      totalAmount: "77.30",
      orderType: "instant",
      status: "completed",
      paymentStatus: "completed",
      paymentMethod: "credit_card",
    },
    {
      trackingNumber: "UK002157",
      customerId: customerUK.id,
      stationId: stationUK2.id,
      fuelFriendId: ffUK2.id,
      deliveryAddress: "456 Deansgate, Manchester M3 2AY",
      deliveryPhone: "+44-161-123-4567",
      fuelType: "Diesel",
      fuelQuantity: "25.00",
      fuelCost: "37.00",
      deliveryFee: "4.50",
      totalAmount: "41.50",
      orderType: "instant",
      status: "completed",
      paymentStatus: "completed",
      paymentMethod: "paypal",
    },
    {
      trackingNumber: "US001237",
      customerId: customerUS.id,
      stationId: stationUS2.id,
      deliveryAddress: "321 Beverly Hills, Los Angeles, CA 90210",
      deliveryPhone: "+1-555-0123",
      fuelType: "Regular",
      fuelQuantity: "10.00",
      fuelCost: "36.50",
      deliveryFee: "7.50",
      totalAmount: "44.00",
      orderType: "instant",
      status: "cancelled",
      paymentStatus: "refunded",
      paymentMethod: "credit_card",
    },
  ]).returning();

  // Create wallets (US & UK)
  const [walletUS, walletUK] = await db.insert(wallets).values([
    {
      driverId: ffUS1.id,
      balance: "1,245.75",
      currency: "USD",
      bankName: "Chase Bank",
      cardNumber: "4532",
      expiryDate: "12/26",
      cvv: "123",
    },
    {
      driverId: ffUK1.id,
      balance: "892.50",
      currency: "GBP",
      bankName: "Barclays Bank",
      cardNumber: "5678",
      expiryDate: "08/27",
      cvv: "456",
    },
  ]).returning();

  // Create transactions (US & UK)
  await db.insert(transactions).values([
    {
      walletId: walletUS.id,
      type: "deposit",
      amount: "75.00",
      status: "completed",
      date: new Date().toISOString().split('T')[0],
      time: "14:30",
    },
    {
      walletId: walletUS.id,
      type: "payment",
      amount: "45.50",
      status: "completed",
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: "09:15",
    },
    {
      walletId: walletUK.id,
      type: "deposit",
      amount: "55.00",
      status: "completed",
      date: new Date().toISOString().split('T')[0],
      time: "16:45",
    },
    {
      walletId: walletUK.id,
      type: "payment",
      amount: "32.50",
      status: "completed",
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: "11:20",
    },
  ]);

  console.log("✅ Database seeded successfully!");
}

seed().catch(console.error);