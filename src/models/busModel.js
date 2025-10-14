import { pool } from '../config/db.js';

// Helpers to map rows -> bus objects
const mapRowToBus = (row) => ({
  id: row.id,
  busNumber: row.bus_number,
  route: row.route,
  capacity: row.capacity,
  currentLocation: row.current_location ? { type: 'Point', coordinates: [row.current_location.x, row.current_location.y] } : null,
  status: row.status,
  lastUpdated: row.last_updated,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const findAll = async () => {
  const res = await pool.query('SELECT *, ST_X(current_location) as x, ST_Y(current_location) as y FROM buses');
  return res.rows.map(mapRowToBus);
};

export const findById = async (id) => {
  const res = await pool.query('SELECT *, ST_X(current_location) as x, ST_Y(current_location) as y FROM buses WHERE id = $1', [id]);
  if (!res.rows[0]) return null;
  return mapRowToBus(res.rows[0]);
};

export const create = async (data) => {
  const { busNumber, route, capacity, currentLocation, status } = data;
  const point = `SRID=4326;POINT(${currentLocation.coordinates[0]} ${currentLocation.coordinates[1]})`;
  const res = await pool.query(
    `INSERT INTO buses (bus_number, route, capacity, current_location, status)
     VALUES ($1,$2,$3, ST_GeomFromText($4), $5) RETURNING *`,
    [busNumber, route, capacity, point, status || 'active']
  );
  return mapRowToBus(res.rows[0]);
};

export const update = async (id, data) => {
  // Build dynamic update
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.busNumber) { fields.push(`bus_number = $${idx++}`); values.push(data.busNumber); }
  if (data.route) { fields.push(`route = $${idx++}`); values.push(data.route); }
  if (data.capacity) { fields.push(`capacity = $${idx++}`); values.push(data.capacity); }
  if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
  if (data.currentLocation) {
    const point = `SRID=4326;POINT(${data.currentLocation.coordinates[0]} ${data.currentLocation.coordinates[1]})`;
    fields.push(`current_location = ST_GeomFromText($${idx++})`);
    values.push(point);
  }

  if (fields.length === 0) return findById(id);

  // updated_at
  fields.push(`updated_at = now()`);

  const query = `UPDATE buses SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *, ST_X(current_location) as x, ST_Y(current_location) as y`;
  values.push(id);

  const res = await pool.query(query, values);
  return res.rows[0] ? mapRowToBus(res.rows[0]) : null;
};

export const remove = async (id) => {
  const res = await pool.query('DELETE FROM buses WHERE id = $1 RETURNING *', [id]);
  return res.rows[0] ? true : false;
};

export const bulkCreate = async (items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const item of items) {
      const { busNumber, route, capacity, currentLocation, status } = item;
      const point = `SRID=4326;POINT(${currentLocation.coordinates[0]} ${currentLocation.coordinates[1]})`;
      const res = await client.query(
        `INSERT INTO buses (bus_number, route, capacity, current_location, status)
         VALUES ($1,$2,$3, ST_GeomFromText($4), $5) RETURNING *`,
        [busNumber, route, capacity, point, status || 'active']
      );
      results.push(mapRowToBus(res.rows[0]));
    }
    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const bulkUpdate = async (updates) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const u of updates) {
      const { id, data } = u;
      await update(id, data);
    }
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const bulkDelete = async (ids) => {
  const res = await pool.query('DELETE FROM buses WHERE id = ANY($1::int[])', [ids]);
  return res.rowCount;
};
