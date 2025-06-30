import knex from 'knex';
import knexConfig from '../../knexfile'; // Adjust path as necessary

// Determine environment (default to development)
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

if (!config) {
  throw new Error(`Knex configuration for environment '${environment}' not found.`);
}

const db = knex(config);

// Optional: Check database connection (can be verbose for every import, better in a startup script)
// db.raw('SELECT 1')
//   .then(() => {
//     console.log('Successfully connected to the database via Knex.');
//   })
//   .catch((err) => {
//     console.error('Failed to connect to the database via Knex:', err);
//     // process.exit(1); // Or handle error appropriately
//   });

export default db;
