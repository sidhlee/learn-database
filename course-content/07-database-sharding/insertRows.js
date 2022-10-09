const axios = require('axios');

for (let i = 0; i < 999; i++) {
  axios.post(`http://localhost:8081?url=test${i}.com`);
}
