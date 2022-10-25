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

app.listen(port, () => {
  console.log('listening on: ' + port);
});
