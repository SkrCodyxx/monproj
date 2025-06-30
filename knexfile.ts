import type { Knex } from 'knex';
import path from 'path';

// Update with your config settings.
const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, './database.sqlite'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, './server/db/migrations'),
      tableName: 'knex_migrations',
      extension: 'ts', // if using TypeScript for migrations
    },
    seeds: {
      directory: path.resolve(__dirname, './server/db/seeds'),
      extension: 'ts', // if using TypeScript for seeds
    },
    // pool: {
    //   afterCreate: (conn: any, done: Function) => {
    //     conn.run('PRAGMA foreign_keys = ON', done); // Enforce foreign key constraints for SQLite
    //   }
    // }
  },

  // Example for production (though this project targets local SQLite deployment)
  // production: {
  //   client: 'postgresql', // Or your preferred production DB
  //   connection: {
  //     database: process.env.DB_NAME,
  //     user: process.env.DB_USER,
  //     password: process.env.DB_PASSWORD,
  //     host: process.env.DB_HOST,
  //     port: Number(process.env.DB_PORT || 5432),
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations',
  //     directory: './server/db/migrations'
  //   }
  // }
};

export default config;
