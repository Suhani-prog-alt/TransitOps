const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/transitops').then(async () => {
  const db = mongoose.connection.db;
  const vehicles = await db.collection('vehicles').find().toArray();
  const drivers = await db.collection('drivers').find().toArray();
  
  if (vehicles.length > 0 && drivers.length > 0) {
    await db.collection('trips').insertMany([
      { source: 'Warehouse A', destination: 'Distribution Center B', vehicle: vehicles[0]._id, driver: drivers[0]._id, cargoWeight: 1500, plannedDistance: 320, revenue: 15000, status: 'Completed', finalOdometer: 5320, fuelConsumed: 45, completedAt: new Date(), createdAt: new Date() },
      { source: 'Port', destination: 'Warehouse C', vehicle: vehicles[1]._id, driver: drivers[1]._id, cargoWeight: 2200, plannedDistance: 450, revenue: 25000, status: 'Dispatched', dispatchedAt: new Date(), createdAt: new Date() },
      { source: 'Factory', destination: 'Local Hub', vehicle: vehicles[2]._id, driver: drivers[2]._id, cargoWeight: 800, plannedDistance: 50, revenue: 3000, status: 'Draft', createdAt: new Date() }
    ]);
    
    await db.collection('maintenancelogs').insertMany([
      { vehicle: vehicles[0]._id, serviceType: 'Oil Change', status: 'Completed', cost: 1200, date: new Date(), description: 'Routine oil change' },
      { vehicle: vehicles[1]._id, serviceType: 'Brake Inspection', status: 'Scheduled', scheduledDate: new Date(Date.now() + 86400000 * 3), estimatedCost: 3500, description: 'Brake pad wear check' }
    ]);
    
    console.log('Data seeded successfully!');
  } else {
    console.log('Need vehicles and drivers first');
  }
  process.exit(0);
});
