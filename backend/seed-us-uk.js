#!/usr/bin/env node

/**
 * Seed script to populate database with US & UK data only
 * Run: node seed-us-uk.js
 */

const { execSync } = require('child_process');

console.log('🌱 Seeding database with US & UK data...');

try {
  // Run the seed script directly
  execSync('tsx src/seed.ts', { stdio: 'inherit', cwd: __dirname });
  
  console.log('✅ Database seeded successfully with US & UK data!');
  console.log('📍 Locations: New York, Los Angeles, London, Manchester');
  console.log('💰 Currencies: USD, GBP');
  
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}