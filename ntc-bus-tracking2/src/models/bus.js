import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  route: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'outOfService'],
    default: 'active'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
busSchema.index({ currentLocation: '2dsphere' });

const Bus = mongoose.model('Bus', busSchema);

export default Bus;