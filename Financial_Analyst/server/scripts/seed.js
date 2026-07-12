import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import Report from '../models/Report.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const VEHICLES = [
  { name: 'Truck-01', reg: 'TX-8839-A', driver: 'John Doe' },
  { name: 'Truck-02', reg: 'TX-9402-B', driver: 'Sarah Connor' },
  { name: 'Truck-03', reg: 'TX-1093-C', driver: 'Marcus Aurelius' },
  { name: 'Truck-04', reg: 'TX-5582-D', driver: 'Dominic Toretto' },
  { name: 'Truck-05', reg: 'TX-3382-E', driver: 'Brian OConner' },
  { name: 'Truck-06', reg: 'TX-7711-F', driver: 'Luke Hobbs' },
  { name: 'Truck-07', reg: 'TX-2283-G', driver: 'Leticia Ortiz' },
  { name: 'Truck-08', reg: 'TX-4402-H', driver: 'Roman Pearce' },
  { name: 'Truck-09', reg: 'TX-9901-I', driver: 'Tej Parker' },
  { name: 'Truck-10', reg: 'TX-8172-J', driver: 'Gisele Yashar' }
];

const EXPENSE_CATEGORIES = ['Maintenance', 'Repair', 'Insurance', 'Toll', 'Miscellaneous'];

const seedData = async () => {
  try {
    // Clear Collections
    await User.deleteMany();
    await FuelLog.deleteMany();
    await Expense.deleteMany();
    await Report.deleteMany();

    console.log('Collections cleared');

    // 1. Create Default Users
    const salt = await bcrypt.genSalt(10);
    const analystPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('password123', salt);

    await User.create([
      {
        username: 'analyst',
        email: 'analyst@transitops.com',
        password: 'password123', // hooks will auto hash
        role: 'Financial Analyst'
      },
      {
        username: 'admin',
        email: 'admin@transitops.com',
        password: 'password123', // hooks will auto hash
        role: 'Admin'
      }
    ]);
    console.log('Users seeded');

    // 2. Generate Fuel Logs
    const fuelLogs = [];
    let fuelLogCounter = 1;

    // Generate logs for the last 6 months (approx 180 days)
    const now = new Date();
    for (let i = 0; i < 50; i++) {
      const vehicle = VEHICLES[i % VEHICLES.length];
      const fuelDate = new Date();
      fuelDate.setDate(now.getDate() - Math.floor(Math.random() * 180)); // past 6 months

      const fuelQuantity = parseFloat((120 + Math.random() * 150).toFixed(2)); // 120L to 270L
      const fuelCost = parseFloat((fuelQuantity * (1.2 + Math.random() * 0.4)).toFixed(2)); // $1.20 - $1.60 per liter
      const distanceCovered = parseFloat((fuelQuantity * (4 + Math.random() * 2.5)).toFixed(2)); // 4 to 6.5 km per liter
      const fuelEfficiency = parseFloat((distanceCovered / fuelQuantity).toFixed(2));

      fuelLogs.push({
        fuelId: `FL-${String(fuelLogCounter++).padStart(4, '0')}`,
        vehicleName: vehicle.name,
        registrationNumber: vehicle.reg,
        tripId: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
        driver: vehicle.driver,
        fuelQuantity,
        fuelCost,
        fuelDate,
        distanceCovered,
        fuelEfficiency,
        status: Math.random() > 0.15 ? 'Approved' : 'Pending Review'
      });
    }

    await FuelLog.insertMany(fuelLogs);
    console.log('Fuel logs seeded');

    // 3. Generate Other Expenses
    const expenses = [];
    let expenseCounter = 1;

    for (let i = 0; i < 60; i++) {
      const vehicle = VEHICLES[i % VEHICLES.length];
      const category = EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)];
      const date = new Date();
      date.setDate(now.getDate() - Math.floor(Math.random() * 180));

      let amount = 0;
      let remarks = '';
      if (category === 'Insurance') {
        amount = parseFloat((800 + Math.random() * 600).toFixed(2));
        remarks = 'Annual vehicle insurance renewal';
      } else if (category === 'Maintenance') {
        amount = parseFloat((150 + Math.random() * 300).toFixed(2));
        remarks = 'Scheduled mileage service and oil change';
      } else if (category === 'Repair') {
        amount = parseFloat((300 + Math.random() * 1200).toFixed(2));
        remarks = 'Brake replacement / Engine diagnostics and fix';
      } else if (category === 'Toll') {
        amount = parseFloat((40 + Math.random() * 80).toFixed(2));
        remarks = 'Monthly highway toll pass';
      } else {
        amount = parseFloat((20 + Math.random() * 60).toFixed(2));
        remarks = 'Windshield wiper fluid and minor parts';
      }

      expenses.push({
        expenseId: `EXP-${String(expenseCounter++).padStart(4, '0')}`,
        vehicleName: vehicle.name,
        category,
        amount,
        date,
        status: Math.random() > 0.1 ? 'Approved' : 'Pending',
        remarks
      });
    }

    await Expense.insertMany(expenses);
    console.log('Expenses seeded');

    // 4. Seed a few reports
    await Report.create([
      {
        reportId: 'REP-0001',
        title: 'Q1 Comprehensive Financial Summary',
        type: 'Financial Summary Report',
        generatedBy: 'analyst',
        dateGenerated: new Date(now.getTime() - 24 * 60 * 60 * 1000 * 30), // 30 days ago
        format: 'PDF',
        filtersUsed: { 'startDate': '2026-01-01', 'endDate': '2026-03-31' },
        status: 'Completed'
      },
      {
        reportId: 'REP-0002',
        title: 'Q2 Operational Fleet Cost Sheet',
        type: 'Operational Cost Report',
        generatedBy: 'analyst',
        dateGenerated: new Date(now.getTime() - 24 * 60 * 60 * 1000 * 5), // 5 days ago
        format: 'CSV',
        filtersUsed: { 'startDate': '2026-04-01', 'endDate': '2026-06-30' },
        status: 'Completed'
      }
    ]);
    console.log('Reports seeded');

    console.log('Data Seeding Completed Successfully');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
