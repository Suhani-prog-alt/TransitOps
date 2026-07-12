import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Vehicle from './models/Vehicle';
import Maintenance from './models/Maintenance';
import Alert from './models/Alert';
import Activity from './models/Activity';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Maintenance.deleteMany({});
    await Alert.deleteMany({});
    await Activity.deleteMany({});
    console.log('Cleared existing database entries.');

    // 1. Create Default User (Fleet Manager)
    const user = new User({
      name: 'Rohit Sharma',
      email: 'rohit@transitops.com',
      password: 'admin123', // Will be hashed via pre-save hook
      role: 'Fleet Manager',
      region: 'All Regions',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    });
    await user.save();
    console.log('Seeded User: rohit@transitops.com / admin123');

    // 2. Create Vehicles
    const vehiclesData = [
      {
        registrationNumber: 'DL3C-AB-1234',
        name: 'Truck-12',
        model: 'Tata Signa 4825.T',
        type: 'Heavy Truck',
        fuelType: 'Diesel',
        maxCapacity: 28000,
        currentOdometer: 142350,
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 4500000,
        insuranceExpiry: new Date('2026-08-10'),
        region: 'North',
        imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=60',
        status: 'Available',
        healthScore: 68
      },
      {
        registrationNumber: 'MH02-CD-5678',
        name: 'Van-05',
        model: 'Mahindra Supro Cargo',
        type: 'Light Van',
        fuelType: 'Diesel',
        maxCapacity: 1200,
        currentOdometer: 24600,
        purchaseDate: new Date('2024-05-12'),
        purchaseCost: 750000,
        insuranceExpiry: new Date('2026-07-28'),
        region: 'West',
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60',
        status: 'Available',
        healthScore: 94
      },
      {
        registrationNumber: 'KA03-EF-9012',
        name: 'Truck-08',
        model: 'Ashok Leyland Ecomet',
        type: 'Medium Truck',
        fuelType: 'Diesel',
        maxCapacity: 11000,
        currentOdometer: 85200,
        purchaseDate: new Date('2023-10-20'),
        purchaseCost: 2400000,
        insuranceExpiry: new Date('2026-09-05'),
        region: 'South',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60',
        status: 'In Trip',
        healthScore: 82
      },
      {
        registrationNumber: 'DL1C-GH-3456',
        name: 'Bus-02',
        model: 'JBM ECO-LIFE',
        type: 'Electric Bus',
        fuelType: 'Electric',
        maxCapacity: 50, // passengers
        currentOdometer: 34100,
        purchaseDate: new Date('2024-02-10'),
        purchaseCost: 12000000,
        insuranceExpiry: new Date('2026-07-15'), // Expires soon!
        region: 'North',
        imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop&q=60',
        status: 'Available',
        healthScore: 91
      },
      {
        registrationNumber: 'MH04-IJ-7890',
        name: 'Van-07',
        model: 'Maruti Suzuki Eeco',
        type: 'Light Van',
        fuelType: 'CNG',
        maxCapacity: 700,
        currentOdometer: 54120,
        purchaseDate: new Date('2023-06-18'),
        purchaseCost: 550000,
        insuranceExpiry: new Date('2026-11-20'),
        region: 'West',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60',
        status: 'In Shop', // In Maintenance
        healthScore: 78
      },
      {
        registrationNumber: 'KA51-KL-1234',
        name: 'Truck-09',
        model: 'BharatBenz 2823R',
        type: 'Heavy Truck',
        fuelType: 'Diesel',
        maxCapacity: 25000,
        currentOdometer: 112000,
        purchaseDate: new Date('2022-11-04'),
        purchaseCost: 3800000,
        insuranceExpiry: new Date('2026-12-05'),
        region: 'South',
        imageUrl: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a44?w=500&auto=format&fit=crop&q=60',
        status: 'In Shop', // In Maintenance
        healthScore: 72
      },
      {
        registrationNumber: 'WB02-MN-4567',
        name: 'Van-03',
        model: 'Force Traveller',
        type: 'Medium Van',
        fuelType: 'Diesel',
        maxCapacity: 3500,
        currentOdometer: 165000, // Very High Mileage!
        purchaseDate: new Date('2021-08-15'),
        purchaseCost: 1600000,
        insuranceExpiry: new Date('2026-07-20'),
        region: 'East',
        imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60',
        status: 'Available',
        healthScore: 50
      },
      {
        registrationNumber: 'HR55-OP-8901',
        name: 'Truck-05',
        model: 'Eicher Pro 6028',
        type: 'Heavy Truck',
        fuelType: 'Diesel',
        maxCapacity: 28000,
        currentOdometer: 94000,
        purchaseDate: new Date('2023-04-12'),
        purchaseCost: 4100000,
        insuranceExpiry: new Date('2026-10-18'),
        region: 'North',
        imageUrl: 'https://images.unsplash.com/photo-1516576885502-b286f0c3d973?w=500&auto=format&fit=crop&q=60',
        status: 'In Trip',
        healthScore: 84
      },
      {
        registrationNumber: 'DL2C-QR-2345',
        name: 'Truck-11',
        model: 'Mahindra Blazo X 49',
        type: 'Heavy Truck',
        fuelType: 'Diesel',
        maxCapacity: 35000,
        currentOdometer: 72100,
        purchaseDate: new Date('2024-01-08'),
        purchaseCost: 4900000,
        insuranceExpiry: new Date('2027-01-10'),
        region: 'North',
        imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=60',
        status: 'In Trip',
        healthScore: 89
      },
      {
        registrationNumber: 'KA04-ST-6789',
        name: 'Van-02',
        model: 'Tata Winger Cargo',
        type: 'Medium Van',
        fuelType: 'Petrol',
        maxCapacity: 2000,
        currentOdometer: 18400,
        purchaseDate: new Date('2025-02-15'),
        purchaseCost: 1100000,
        insuranceExpiry: new Date('2026-08-30'),
        region: 'South',
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60',
        status: 'Available',
        healthScore: 96
      },
      {
        registrationNumber: 'WB01-UV-0123',
        name: 'Truck-04',
        model: 'Tata LPT 1613',
        type: 'Medium Truck',
        fuelType: 'Diesel',
        maxCapacity: 10000,
        currentOdometer: 210000,
        purchaseDate: new Date('2019-05-10'),
        purchaseCost: 1800000,
        insuranceExpiry: new Date('2025-03-10'), // Expired!
        region: 'East',
        imageUrl: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a44?w=500&auto=format&fit=crop&q=60',
        status: 'Retired',
        healthScore: 35
      }
    ];

    const savedVehicles = await Vehicle.create(vehiclesData);
    console.log(`Seeded ${savedVehicles.length} vehicles.`);

    // Helper to find vehicle by name
    const getVehId = (name: string) => savedVehicles.find(v => v.name === name)?._id;

    // 3. Create Maintenance Logs
    const maintenanceData = [
      {
        vehicle: getVehId('Van-07'),
        type: 'Brake Inspection',
        priority: 'High',
        description: 'Front brakes squealing, checking pads and rotors.',
        mechanic: 'Mr. Rakesh Verma',
        estimatedCost: 15000,
        startDate: new Date('2026-07-10'),
        expectedCompletion: new Date('2026-07-14'),
        status: 'In Progress'
      },
      {
        vehicle: getVehId('Truck-09'),
        type: 'Oil Change',
        priority: 'Low',
        description: 'Routine engine oil and filter replacement.',
        mechanic: 'Mr. Satish Pal',
        estimatedCost: 8000,
        startDate: new Date('2026-07-11'),
        expectedCompletion: new Date('2026-07-13'),
        status: 'In Progress'
      },
      {
        vehicle: getVehId('Truck-12'),
        type: 'Tire Replacement',
        priority: 'Medium',
        description: 'Replacing rear radial tires due to tread wear.',
        mechanic: 'Mr. Satish Pal',
        estimatedCost: 45000,
        actualCost: 42000,
        startDate: new Date('2026-06-20'),
        expectedCompletion: new Date('2026-06-22'),
        completionDate: new Date('2026-06-22'),
        status: 'Completed'
      },
      {
        vehicle: getVehId('Van-05'),
        type: 'General Service',
        priority: 'Low',
        description: 'First dynamic servicing and filter check.',
        mechanic: 'Mr. Rakesh Verma',
        estimatedCost: 5000,
        actualCost: 4800,
        startDate: new Date('2026-05-18'),
        expectedCompletion: new Date('2026-05-19'),
        completionDate: new Date('2026-05-19'),
        status: 'Completed'
      },
      {
        vehicle: getVehId('Bus-02'),
        type: 'Engine Check',
        priority: 'Critical',
        description: 'Diagnosing battery management system alarm.',
        mechanic: 'Mr. Anthony G.',
        estimatedCost: 65000,
        startDate: new Date('2026-07-15'),
        expectedCompletion: new Date('2026-07-18'),
        status: 'Scheduled'
      }
    ];

    const savedMaintenance = await Maintenance.create(maintenanceData);
    console.log(`Seeded ${savedMaintenance.length} maintenance records.`);

    // 4. Create Activity Logs
    const activitiesData = [
      {
        vehicle: getVehId('Truck-12'),
        type: 'Maintenance Completed',
        description: 'Tire Replacement completed for Truck-12. Actual cost: ₹42,000. Vehicle status updated to Available.',
        timestamp: new Date('2026-06-22T14:30:00')
      },
      {
        vehicle: getVehId('Van-07'),
        type: 'Maintenance Started',
        description: 'Brake Inspection started for Van-07 by mechanic Rakesh Verma. Status updated to In Shop.',
        timestamp: new Date('2026-07-10T10:15:00')
      },
      {
        vehicle: getVehId('Truck-09'),
        type: 'Maintenance Started',
        description: 'Oil Change started for Truck-09 by mechanic Satish Pal. Status updated to In Shop.',
        timestamp: new Date('2026-07-11T09:00:00')
      },
      {
        vehicle: getVehId('Truck-04'),
        type: 'Vehicle Retired',
        description: 'Vehicle Truck-04 (WB01-UV-0123) retired due to high age and mileage.',
        timestamp: new Date('2026-07-01T16:00:00')
      },
      {
        vehicle: getVehId('Van-02'),
        type: 'Vehicle Added',
        description: 'New vehicle Van-02 (KA04-ST-6789) added to South region fleet registry.',
        timestamp: new Date('2026-07-02T11:00:00')
      }
    ];

    await Activity.create(activitiesData);
    console.log('Seeded Activities logs.');

    // 5. Create Smart Alerts (Active alerts based on rules)
    const alertsData = [
      {
        vehicle: getVehId('Bus-02'),
        type: 'Insurance Expiry',
        message: 'Insurance for Electric Bus-02 (DL1C-GH-3456) expires in 3 days (15 July 2026).',
        severity: 'critical',
        isResolved: false
      },
      {
        vehicle: getVehId('Van-03'),
        type: 'Mileage Limit',
        message: 'Vehicle Van-03 has crossed the mileage limit with 165,000 km. Schedule servicing.',
        severity: 'warning',
        isResolved: false
      },
      {
        vehicle: getVehId('Truck-12'),
        type: 'High Cost',
        message: 'Total maintenance cost for Truck-12 has exceeded 40% of its initial purchase price.',
        severity: 'warning',
        isResolved: false
      }
    ];

    await Alert.create(alertsData);
    console.log('Seeded Alerts data.');

    console.log('Seeding process completed successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
