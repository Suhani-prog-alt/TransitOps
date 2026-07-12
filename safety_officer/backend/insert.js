const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/transitops').then(async () => {
  const db = mongoose.connection.db;
  await db.collection('drivers').updateOne({name: 'John Doe'}, {$set: {driverId: 'DRV-001'}});
  await db.collection('drivers').insertMany([
    { driverId: 'DRV-002', name: 'Jane Smith', licenseNumber: 'DL654321', licenseExpiryDate: new Date('2027-11-20'), status: 'On Trip', safetyScore: 88, contactNumber: '555-0102', address: '456 Oak Ave' },
    { driverId: 'DRV-003', name: 'Bob Wilson', licenseNumber: 'DL987654', licenseExpiryDate: new Date('2026-08-01'), status: 'Available', safetyScore: 75, contactNumber: '555-0103', address: '789 Pine Rd' },
    { driverId: 'DRV-004', name: 'Alice Brown', licenseNumber: 'DL456789', licenseExpiryDate: new Date('2026-07-20'), status: 'Suspended', safetyScore: 55, contactNumber: '555-0104', address: '321 Elm St' },
    { driverId: 'DRV-005', name: 'Charlie Davis', licenseNumber: 'DL321654', licenseExpiryDate: new Date('2025-12-10'), status: 'Available', safetyScore: 92, contactNumber: '555-0105', address: '654 Maple Dr' }
  ]);
  console.log('Drivers inserted');
  process.exit(0);
});
