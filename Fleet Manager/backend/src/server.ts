import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Import Routes
import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import alertRoutes from './routes/alertRoutes';
import reportRoutes from './routes/reportRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: '*', // For hackathon flexibility, allow all origins
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads in JSON
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TransitOps Fleet Manager API' });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);

// Error Handling Middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
