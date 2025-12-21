import { db } from "./db";
import {
  customers, vehicles, fuelStations, products, fuelFriends, orders, orderItems,
  paymentMethods, reviews, notifications, wallets, transactions
} from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create test customer
  const [customer] = await db.insert(customers).values({
    fullName: "Robin Sharma",
    email: "robin@example.com",
    phoneNumber: "923553344550",
    password: "password123",
    gender: "Male",
    city: "Toronto, Canada",
    address: "123 Main Street, Toronto",
    isEmailVerified: true,
  }).returning();

  // Create test vehicle
  await db.insert(vehicles).values({
    customerId: customer.id,
    brand: "Mercedes-Benz",
    color: "Red",
    licenseNumber: "CAN A980",
    fuelType: "Premium",
    isPrimary: true,
  });

  // Create fuel stations
  const [station1, station2] = await db.insert(fuelStations).values([
    {
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
    },
    {
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
    },
  ]).returning();

  // Create products
  await db.insert(products).values([
    {
      stationId: station1.id,
      name: "Potato Chips",
      category: "Snacks",
      price: "3.49",
      inStock: true,
    },
    {
      stationId: station1.id,
      name: "Still Water 500ml",
      category: "Drinks",
      price: "1.29",
      inStock: true,
    },
  ]);

  // Create fuel friends
  const [ff1] = await db.insert(fuelFriends).values([
    {
      fullName: "Shah Hussain",
      phoneNumber: "+1234567890",
      email: "shah@fuelfriend.com",
      location: "Tennessee",
      deliveryFee: "5.00",
      rating: "4.8",
      totalReviews: 46,
      latitude: "36.1627",
      longitude: "-86.7816",
      about: "Fuel Friend is a reliable on-demand fuel delivery service designed to provide convenience and efficiency to customers.",
      isAvailable: true,
    },
    {
      fullName: "Cristopert Dastin",
      phoneNumber: "+1234567891",
      email: "cristopert@fuelfriend.com",
      location: "Tennessee",
      deliveryFee: "5.00",
      rating: "4.9",
      totalReviews: 52,
      latitude: "36.1627",
      longitude: "-86.7816",
      about: "Professional fuel delivery service with over 5 years of experience.",
      isAvailable: true,
    },
  ]).returning();

  // Create orders
  await db.insert(orders).values([
    {
      trackingNumber: "162432",
      customerId: customer.id,
      stationId: station1.id,
      fuelFriendId: ff1.id,
      deliveryAddress: "123 Main Street, Toronto, Canada",
      deliveryPhone: "923553344550",
      fuelType: "Premium",
      fuelQuantity: "2.00",
      fuelCost: "283.00",
      deliveryFee: "5.00",
      groceriesCost: "20.00",
      totalAmount: "308.00",
      orderType: "instant",
      estimatedDeliveryTime: "8:30 - 9:15 PM",
      status: "in_progress",
      paymentStatus: "completed",
      paymentMethod: "credit_card",
    },
    {
      trackingNumber: "GB8821",
      customerId: customer.id,
      stationId: station1.id,
      deliveryAddress: "10 Downing St, London, UK",
      deliveryPhone: "+44 20 7925 0918",
      fuelType: "Diesel",
      fuelQuantity: "15.00",
      fuelCost: "25.00",
      deliveryFee: "3.00",
      totalAmount: "28.00",
      orderType: "instant",
      estimatedDeliveryTime: "15-20 min",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: "paypal",
    },
  ]);

  // Create wallet
  const [wallet] = await db.insert(wallets).values({
    driverId: ff1.id,
    balance: "245.50",
    currency: "USD",
    bankName: "Chase Bank",
    cardNumber: "4532",
    expiryDate: "12/26",
    cvv: "123",
  }).returning();

  // Create transactions
  await db.insert(transactions).values([
    {
      walletId: wallet.id,
      type: "deposit",
      amount: "25.00",
      status: "completed",
      date: new Date().toISOString().split('T')[0],
      time: "14:30",
    },
    {
      walletId: wallet.id,
      type: "payment",
      amount: "15.00",
      status: "completed",
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: "09:15",
    },
  ]);

  console.log("✅ Database seeded successfully!");
}

seed().catch(console.error);