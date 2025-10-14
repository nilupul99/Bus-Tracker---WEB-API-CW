import * as BusModel from '../models/busModel.js';

// Bulk create buses
export const createBulkBuses = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be an array of buses'
      });
    }

    const created = await BusModel.bulkCreate(req.body);
    res.status(201).json({
      success: true,
      count: created.length,
      data: created
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Bulk update buses
export const updateBulkBuses = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be an array of updates'
      });
    }

    await BusModel.bulkUpdate(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Bulk delete buses
export const deleteBulkBuses = async (req, res) => {
  try {
    if (!Array.isArray(req.body.ids)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must contain an array of ids'
      });
    }

    const deletedCount = await BusModel.bulkDelete(req.body.ids);
    res.status(200).json({ success: true, count: deletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get all buses
export const getAllBuses = async (req, res) => {
  try {
    const buses = await BusModel.findAll();
    res.status(200).json({ success: true, count: buses.length, data: buses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get single bus
export const getBusById = async (req, res) => {
  try {
    const bus = await BusModel.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
    }
    res.status(200).json({
      success: true,
      data: bus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create new bus
export const createBus = async (req, res) => {
  try {
    console.log('Creating new bus with data:', req.body);
    const bus = await BusModel.create(req.body);
    console.log('Bus created successfully:', bus);
    res.status(201).json({ success: true, data: bus });
  } catch (error) {
    console.error('Error creating bus:', error);
    
    // Basic error mapping
    if (error.code && error.code === '23505') { // unique_violation
      return res.status(400).json({ success: false, error: 'Bus number already exists' });
    }
    res.status(500).json({ success: false, error: 'Server Error', details: error.message });
  }
};

// Update bus
export const updateBus = async (req, res) => {
  try {
    const existing = await BusModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Bus not found' });
    const updatedBus = await BusModel.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedBus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Delete bus
export const deleteBus = async (req, res) => {
  try {
    const existing = await BusModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Bus not found' });
    await BusModel.remove(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};