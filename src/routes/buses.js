import express from 'express';
import { 
  getAllBuses, 
  getBusById, 
  createBus,
  createBulkBuses,
  updateBus,
  updateBulkBuses,
  deleteBus,
  deleteBulkBuses,
  getBusByNumber, 
  updateBusByNumber, 
  deleteBusByNumber,
  getBusesByRoute 
} from '../controllers/busController.js';
import { validateBus } from '../middleware/busValidation.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Single bus operations
router.route('/')
  .get(getAllBuses)                 // GET /api/buses - Get all buses
  .post(validateBus, createBus);    // POST /api/buses - Create new bus

// Route-specific operations (must come before /:id to avoid conflicts)
router.route('/route/:route')
  .get(getBusesByRoute);            // GET /api/buses/route/:route - Get buses by route

// Bus number operations (must come before /:id to avoid conflicts)
router.route('/number/:busNumber')
  .get(getBusByNumber)              // GET /api/buses/number/:busNumber - Get bus by busNumber
  .put(auth, validateBus, updateBusByNumber) // PUT /api/buses/number/:busNumber - Update bus by busNumber (protected)
  .delete(auth, deleteBusByNumber); // DELETE /api/buses/number/:busNumber - Delete bus by busNumber (protected)

router.route('/:id')
  .get(getBusById)                  // GET /api/buses/:id - Get single bus
  .put(auth, validateBus, updateBus) // PUT /api/buses/:id - Update bus (protected)
  .delete(auth, deleteBus);         // DELETE /api/buses/:id - Delete bus (protected)

// Bulk operations
router.route('/bulk/create')
  .post(createBulkBuses);           // POST /api/buses/bulk/create - Create multiple buses

router.route('/bulk/update')
  .put(auth, updateBulkBuses);      // PUT /api/buses/bulk/update - Update multiple buses (protected)

router.route('/bulk/delete')
  .delete(auth, deleteBulkBuses);   // DELETE /api/buses/bulk/delete - Delete multiple buses (protected)

export default router;