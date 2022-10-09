const app = require('express')();
const { Client } = require('pg');
const crypto = require('crypto');
const ConsistentHash = require('consistent-hash');
const hr = new ConsistentHash();
const os = require('os');

const HOSTNAME = os.hostname();
const DB_SERVER_PORTS = [5432, 5433, 5434];
const DB_SERVER_CLIENTS = getDatabaseServerClients(DB_SERVER_PORTS);

function getClientConfig(port) {
  return {
    host: HOSTNAME,
    port: port.toString(),
    user: 'postgres',
    password: 'postgres',
  };
}

function getClient(port) {
  return new Client(getClientConfig(port));
}

function getDatabaseServerClients(serverPorts) {
  return serverPorts.reduce((clients, port) => {
    clients[port] = getClient(port);
    return clients;
  }, {});
}

function initConsistentHash(DB_SERVER_PORTS) {
  DB_SERVER_PORTS.forEach((port) => {
    hr.add(port.toString());
  });
}
initConsistentHash(DB_SERVER_PORTS);

async function connect() {
  await Promise.all(
    Object.values(DB_SERVER_CLIENTS).map((client) => client.connect())
  );
}
connect();

app.get('/', (req, res) => {});

app.post('/', async (req, res) => {
  const url = req.query.url;
  const hash = crypto.createHash('sha256').update(url).digest('base64');
  // use first 5 characters as url id
  const urlId = hash.substr(0, 5);
  const server = hr.get(urlId);

  await DB_SERVER_CLIENTS[server].query(
    'INSERT INTO URL_TABLE (URL, URL_ID) VALUES ($1,$2)',
    [url, urlId]
  );

  return res.send({
    urlId: urlId,
    url,
    server,
  });
  // curl -X POST "http://localhost:8081/?url=https://sidhlee.com"
  // {"urlId":"l8BjM"}%
});

app.listen(8081, () => console.log('listening to 8081..'));
