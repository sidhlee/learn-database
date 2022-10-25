import Express from 'express';
import * as pg from 'pg';
const port = process.env.PORT || 8000;
const app = Express();
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const pool = new pg.Pool({
  host: '172.31.116.91',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

app.get('/', (req, res) => {
  return res.sendFile(__dirname + '/index.html');
});

app.get('/seats', async (req, res) => {
  const result = await pool.query('select * from seats');
  res.send(result.rows);
});

app.put('/:id/:name', async (req, res) => {
  try {
    const { id, name } = req.params;
    const connection = await pool.connect();

    // Begin transaction
    await connection.query('BEGIN');
    const result = await connection.query(
      'SELECT * FROM seats where id = $1 and is_booked = False FOR UPDATE',
      [id]
    );
    if (result.rowCount === 0) {
      return res.send({ error: 'Seat already booked' });
    }

    const updateResult = await connection.query(
      'UPDATE seats SET is_booked = True, name = $2 where id = $1',
      [id, name]
    );

    await connection.query('COMMIT');
    connection.release();

    return res.send(updateResult);
  } catch (err) {
    console.log(err);
    res.send(500);
  }
});

app.listen(port, () => {
  console.log('listening on: ' + port);
});
