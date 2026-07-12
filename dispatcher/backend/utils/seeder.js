const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const MaintenanceLog = require('../models/MaintenanceLog');
const FuelLog = require('../models/FuelLog');

const seedData = async () => {
  try {
    // 1. Check if seeded already
    const userCount = await User.countDocuments();
    if (userCount >= 4) {
      console.log('Database already seeded. Skipping seeder...');
      return;
    }

    console.log('Database is empty. Seeding default data...');

    // 2. Clear anything existing
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Trip.deleteMany();
    await Expense.deleteMany();
    await MaintenanceLog.deleteMany();
    await FuelLog.deleteMany();

    await User.create([
      { name: 'D-1', email: 'dispatcher@transitops.com', password: 'password123', role: 'Dispatcher' },
      { name: 'FM-1', email: 'fleet@transitops.com', password: 'password123', role: 'Fleet Manager' },
      { name: 'SO-1', email: 'safety@transitops.com', password: 'password123', role: 'Safety Officer' },
      { name: 'FA-1', email: 'analyst@transitops.com', password: 'password123', role: 'Financial Analyst' }
    ]);

    // 4. Create Vehicles
    const vehiclesData = [
      { registrationNumber: 'VAN-05', name: 'Ford Transit', type: 'Van', maxCapacity: 500, odometer: 12500, acquisitionCost: 25000, status: 'Available' },
      { registrationNumber: 'TRUCK-12', name: 'Volvo FH16', type: 'Truck', maxCapacity: 12000, odometer: 84000, acquisitionCost: 95000, status: 'Available' },
      { registrationNumber: 'TRUCK-08', name: 'Scania R500', type: 'Truck', maxCapacity: 8000, odometer: 62000, acquisitionCost: 85000, status: 'Available' },
      { registrationNumber: 'VAN-02', name: 'Mercedes Sprinter', type: 'Van', maxCapacity: 600, odometer: 18400, acquisitionCost: 32000, status: 'Available' },
      { registrationNumber: 'VAN-07', name: 'Ram ProMaster', type: 'Van', maxCapacity: 700, odometer: 22000, acquisitionCost: 28000, status: 'Available' },
      { registrationNumber: 'VAN-03', name: 'Nissan NV2500', type: 'Van', maxCapacity: 800, odometer: 15300, acquisitionCost: 27000, status: 'Available' },
      { registrationNumber: 'TRUCK-05', name: 'Isuzu NPR', type: 'Truck', maxCapacity: 4500, odometer: 42100, acquisitionCost: 45000, status: 'Available' },
      { registrationNumber: 'TRUCK-09', name: 'MAN TGX', type: 'Truck', maxCapacity: 15000, odometer: 95000, acquisitionCost: 110000, status: 'Available' }
    ];

    const vehicles = await Vehicle.create(vehiclesData);

    // 5. Create Drivers
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const halfYear = new Date();
    halfYear.setMonth(halfYear.getMonth() + 6);

    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 10); // 10 days ago

    const driversData = [
      { name: 'Alex', licenseNumber: 'DL-938210', licenseCategory: 'Class B Commercial', licenseExpiryDate: nextYear, contactNumber: '+1 555-0192', safetyScore: 95, status: 'Available' },
      { name: 'Ravi', licenseNumber: 'DL-482012', licenseCategory: 'Class A Commercial', licenseExpiryDate: halfYear, contactNumber: '+1 555-0143', safetyScore: 88, status: 'Available' },
      { name: 'Suresh', licenseNumber: 'DL-720194', licenseCategory: 'Class A Commercial', licenseExpiryDate: halfYear, contactNumber: '+1 555-0177', safetyScore: 92, status: 'Available' },
      { name: 'Karthik', licenseNumber: 'DL-810294', licenseCategory: 'Class B Commercial', licenseExpiryDate: nextYear, contactNumber: '+1 555-0112', safetyScore: 90, status: 'Available' },
      { name: 'Arun (Expired License)', licenseNumber: 'DL-201947', licenseCategory: 'Class B Commercial', licenseExpiryDate: expiredDate, contactNumber: '+1 555-0185', safetyScore: 75, status: 'Available' },
      { name: 'Vijay (Suspended)', licenseNumber: 'DL-392019', licenseCategory: 'Class A Commercial', licenseExpiryDate: nextYear, contactNumber: '+1 555-0199', safetyScore: 60, status: 'Suspended' }
    ];

    const drivers = await Driver.create(driversData);

    // Get created documents mapping
    const vMap = {};
    vehicles.forEach(v => { vMap[v.registrationNumber] = v._id; });

    const dMap = {};
    drivers.forEach(d => { dMap[d.name.split(' ')[0]] = d._id; });

    // 6. Create some Completed, Dispatched, Draft and Cancelled Trips
    const tripsData = [
      {
        source: 'Delhi',
        destination: 'Jaipur',
        vehicle: vMap['VAN-05'],
        driver: dMap['Alex'],
        cargoWeight: 450,
        plannedDistance: 270,
        revenue: 12000,
        status: 'Completed',
        dispatchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        finalOdometer: 12500,
        fuelConsumed: 38
      },
      {
        source: 'Mumbai',
        destination: 'Pune',
        vehicle: vMap['TRUCK-12'],
        driver: dMap['Ravi'],
        cargoWeight: 8500,
        plannedDistance: 150,
        revenue: 25000,
        status: 'Completed',
        dispatchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        finalOdometer: 84000,
        fuelConsumed: 60
      },
      {
        source: 'Bangalore',
        destination: 'Mysore',
        vehicle: vMap['TRUCK-08'],
        driver: dMap['Suresh'],
        cargoWeight: 6500,
        plannedDistance: 145,
        revenue: 18000,
        status: 'Completed',
        dispatchedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        finalOdometer: 62000,
        fuelConsumed: 48
      },
      {
        source: 'Chennai',
        destination: 'Coimbatore',
        vehicle: vMap['VAN-02'],
        driver: dMap['Karthik'],
        cargoWeight: 400,
        plannedDistance: 500,
        revenue: 15000,
        status: 'Draft',
      },
      {
        source: 'Hyderabad',
        destination: 'Vijayawada',
        vehicle: vMap['TRUCK-08'],
        driver: dMap['Ravi'],
        cargoWeight: 5000,
        plannedDistance: 275,
        revenue: 22000,
        status: 'Cancelled',
        cancelledAt: new Date()
      }
    ];

    const trips = await Trip.create(tripsData);

    // 7. Create Fuel logs and Expenses
    const fuelLogsData = [
      { vehicle: vMap['VAN-05'], trip: trips[0]._id, liters: 38, cost: 3800, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { vehicle: vMap['TRUCK-12'], trip: trips[1]._id, liters: 60, cost: 6000, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { vehicle: vMap['TRUCK-08'], trip: trips[2]._id, liters: 48, cost: 4800, date: new Date(Date.now() - 12 * 60 * 60 * 1000) }
    ];
    await FuelLog.create(fuelLogsData);

    const expensesData = [
      { vehicle: vMap['VAN-05'], trip: trips[0]._id, type: 'Fuel', cost: 3800, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), description: 'Fuel for Delhi-Jaipur Trip' },
      { vehicle: vMap['TRUCK-12'], trip: trips[1]._id, type: 'Fuel', cost: 6000, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), description: 'Fuel for Mumbai-Pune Trip' },
      { vehicle: vMap['TRUCK-08'], trip: trips[2]._id, type: 'Fuel', cost: 4800, date: new Date(Date.now() - 12 * 60 * 60 * 1000), description: 'Fuel for Bangalore-Mysore Trip' },
      // Maintenance Expenses
      { vehicle: vMap['VAN-07'], type: 'Maintenance', cost: 4500, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), description: 'Oil Change and Filter replacement' },
      { vehicle: vMap['TRUCK-05'], type: 'Maintenance', cost: 12000, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), description: 'Engine Tune Up' }
    ];
    await Expense.create(expensesData);

    // 8. Create Maintenance Logs
    const maintenanceLogsData = [
      { vehicle: vMap['VAN-07'], serviceType: 'Oil Change', scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), cost: 4500, status: 'Scheduled', notes: 'Scheduled standard checkup' },
      { vehicle: vMap['VAN-03'], serviceType: 'Brake Inspection', scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), cost: 2500, status: 'Scheduled', notes: 'Brakes squeaking alert' },
      { vehicle: vMap['TRUCK-05'], serviceType: 'Engine Check', scheduledDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), cost: 12000, status: 'Completed', notes: 'Engine service complete' }
    ];
    await MaintenanceLog.create(maintenanceLogsData);

    console.log('Seeder completed successfully!');
  } catch (err) {
    console.error(`Seeder failed: ${err.message}`);
  }
};

module.exports = seedData;
