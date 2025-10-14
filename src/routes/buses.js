import express from 'express';
import { 
  getAllBuses, 
  getBusById, 
  createBus,
  createBulkBuses,
  updateBus,
  updateBulkBuses,
  deleteBus,
  deleteBulkBuses
} from '../controllers/busController.js';
import { validateBus } from '../middleware/busValidation.js';

const router = express.Router();

// Single bus operations
router.route('/')
  .get(getAllBuses)           // GET /api/buses - Get all buses
  .post(validateBus, createBus);    // POST /api/buses - Create new bus

router.route('/:id')
  .get(getBusById)           // GET /api/buses/:id - Get single bus
  .put(validateBus, updateBus)      // PUT /api/buses/:id - Update bus
  .delete(deleteBus);        // DELETE /api/buses/:id - Delete bus

// Bulk operations
router.route('/bulk/create')
  .post(createBulkBuses);    // POST /api/buses/bulk/create - Create multiple buses

router.route('/bulk/update')
  .put(updateBulkBuses);     // PUT /api/buses/bulk/update - Update multiple buses

router.route('/bulk/delete')
  .delete(deleteBulkBuses);  // DELETE /api/buses/bulk/delete - Delete multiple buses

export default router;