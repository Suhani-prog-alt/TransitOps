"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maintenanceController_1 = require("../controllers/maintenanceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply JWT authentication to all maintenance endpoints
router.use(auth_1.authenticateJWT);
router.get('/', maintenanceController_1.getMaintenances);
router.post('/', maintenanceController_1.createMaintenance);
router.put('/:id', maintenanceController_1.updateMaintenance);
router.delete('/:id', maintenanceController_1.deleteMaintenance);
exports.default = router;
