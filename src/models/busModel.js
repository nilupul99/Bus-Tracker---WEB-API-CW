import { databases, ID, Query } from '../config/appwrite.js';
import { config } from '../config/config.js';

const { databaseId, collectionId } = config.appwrite;

// Helper to map Appwrite document to bus object
const mapDocToBus = (doc) => ({
  id: doc.$id,
  busNumber: doc.busNumber,
  route: doc.route,
  capacity: doc.capacity,
  currentLocation: {
    type: 'Point',
    coordinates: [doc.longitude, doc.latitude]
  },
  status: doc.status,
  startTime: doc.startTime,
  endTime: doc.endTime,
  lastUpdated: doc.lastUpdated,
  createdAt: doc.$createdAt,
  updatedAt: doc.$updatedAt
});

export const findAll = async () => {
  try {
    const response = await databases.listDocuments(databaseId, collectionId);
    return response.documents.map(mapDocToBus);
  } catch (error) {
    console.error('Error finding all buses:', error);
    throw error;
  }
};

export const findById = async (id) => {
  try {
    const doc = await databases.getDocument(databaseId, collectionId, id);
    return mapDocToBus(doc);
  } catch (error) {
    if (error.code === 404) return null;
    console.error('Error finding bus by ID:', error);
    throw error;
  }
};

export const create = async (data) => {
  try {
    const { busNumber, route, capacity, currentLocation, status, startTime, endTime } = data;
    const [longitude, latitude] = currentLocation.coordinates;
    
    const docData = {
      busNumber,
      route,
      capacity,
      longitude,
      latitude,
      status: status || 'active',
      startTime: startTime || null,
      endTime: endTime || null,
      lastUpdated: new Date().toISOString()
    };

    const doc = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      docData
    );
    
    return mapDocToBus(doc);
  } catch (error) {
    console.error('Error creating bus:', error);
    throw error;
  }
};

export const update = async (id, data) => {
  try {
    const updateData = { lastUpdated: new Date().toISOString() };
    
    if (data.busNumber) updateData.busNumber = data.busNumber;
    if (data.route) updateData.route = data.route;
    if (data.capacity) updateData.capacity = data.capacity;
    if (data.status) updateData.status = data.status;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.currentLocation) {
      updateData.longitude = data.currentLocation.coordinates[0];
      updateData.latitude = data.currentLocation.coordinates[1];
    }

    const doc = await databases.updateDocument(databaseId, collectionId, id, updateData);
    return mapDocToBus(doc);
  } catch (error) {
    if (error.code === 404) return null;
    console.error('Error updating bus:', error);
    throw error;
  }
};

export const remove = async (id) => {
  try {
    await databases.deleteDocument(databaseId, collectionId, id);
    return true;
  } catch (error) {
    if (error.code === 404) return false;
    console.error('Error deleting bus:', error);
    throw error;
  }
};

export const bulkCreate = async (items) => {
  try {
    const results = [];
    for (const item of items) {
      const created = await create(item);
      results.push(created);
    }
    return results;
  } catch (error) {
    console.error('Error bulk creating buses:', error);
    throw error;
  }
};

export const bulkUpdate = async (updates) => {
  try {
    for (const { id, data } of updates) {
      await update(id, data);
    }
    return true;
  } catch (error) {
    console.error('Error bulk updating buses:', error);
    throw error;
  }
};

export const bulkDelete = async (ids) => {
  try {
    let count = 0;
    for (const id of ids) {
      const deleted = await remove(id);
      if (deleted) count++;
    }
    return count;
  } catch (error) {
    console.error('Error bulk deleting buses:', error);
    throw error;
  }
};

export const findByBusNumber = async (busNumber) => {
  try {
    const response = await databases.listDocuments(
      databaseId, 
      collectionId, 
      [Query.equal('busNumber', busNumber)]
    );
    
    if (response.documents.length === 0) return null;
    return mapDocToBus(response.documents[0]);
  } catch (error) {
    console.error('Error finding bus by busNumber:', error);
    throw error;
  }
};

export const updateByBusNumber = async (busNumber, data) => {
  try {
    const existingBus = await findByBusNumber(busNumber);
    if (!existingBus) return null;

    const updatedBus = await update(existingBus.id, data);
    return updatedBus;
  } catch (error) {
    console.error('Error updating bus by busNumber:', error);
    throw error;
  }
};

export const removeByBusNumber = async (busNumber) => {
  try {
    const existingBus = await findByBusNumber(busNumber);
    if (!existingBus) return null;

    await remove(existingBus.id);
    return true;
  } catch (error) {
    console.error('Error deleting bus by busNumber:', error);
    throw error;
  }
};

export const findByRoute = async (route) => {
  try {
    const response = await databases.listDocuments(
      databaseId, 
      collectionId, 
      [Query.equal('route', route)]
    );
    
    return response.documents.map(mapDocToBus);
  } catch (error) {
    console.error('Error finding buses by route:', error);
    throw error;
  }
};
