require('dotenv').config();
const axios = require('axios').default;
const logger = require('./logger');

const OMDB_URL = 'https://www.omdbapi.com/';

async function Run() {
  logger.debug('hello from Run()!');
  const apiKey = process.env.OMDB_API_KEY;
  try {
    throw new Error('OH NO!');
    const s = 'star';
    const i = 'tt0078788';
    const page = 2;
    const res = await axios.get(OMDB_URL, { params: { apiKey, s, page } });
    const req = res.request;
    logger.debug(`${req.path}: ${res.status} ${res.statusText}`);
    logger.debug(JSON.stringify(res.data, null, 2));
  } catch (err) {
    logger.error(err);
  }
}

Run();
