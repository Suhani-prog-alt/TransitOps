import { Router } from 'express';
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, retireVehicle, bulkOperations } from '../controllers/vehicleController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);
router.post('/:id/retire', retireVehicle);
router.post('/bulk/op', bulkOperations);

export default router;
