"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicleController_1 = require("../controllers/vehicleController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply JWT authentication to all vehicle endpoints
router.use(auth_1.authenticateJWT);
router.get('/', vehicleController_1.getVehicles);
router.get('/:id', vehicleController_1.getVehicleById);
router.post('/', vehicleController_1.createVehicle);
router.put('/:id', vehicleController_1.updateVehicle);
router.delete('/:id', vehicleController_1.deleteVehicle);
router.post('/:id/retire', vehicleController_1.retireVehicle);
router.post('/bulk/op', vehicleController_1.bulkOperations);
exports.default = router;
