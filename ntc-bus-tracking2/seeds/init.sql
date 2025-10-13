-- Initialize database and create buses table
CREATE TABLE IF NOT EXISTS buses (
  id SERIAL PRIMARY KEY,
  bus_number VARCHAR(100) UNIQUE NOT NULL,
  route VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  current_location GEOMETRY(POINT, 4326) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  last_updated TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
