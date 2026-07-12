"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
// Import Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const vehicleRoutes_1 = __importDefault(require("./routes/vehicleRoutes"));
const maintenanceRoutes_1 = __importDefault(require("./routes/maintenanceRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const alertRoutes_1 = __importDefault(require("./routes/alertRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Connect Database
(0, db_1.connectDB)();
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // For hackathon flexibility, allow all origins
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' })); // Support base64 image uploads in JSON
app.use((0, morgan_1.default)('dev'));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'TransitOps Fleet Manager API' });
});
// Register Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/vehicles', vehicleRoutes_1.default);
app.use('/api/maintenance', maintenanceRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/alerts', alertRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
