const { Client } = require("pg");

const db = new Client({
  host: "ep-super-lake-a147s83m.ap-southeast-1.aws.neon.tech",
  port: 5432,
  user: "vibeZ_owner",
  password: "vpXmPV4AZa1b",
  database: "vibeZ",
  ssl: { rejectUnauthorized: false }, // SSL for Neon DB
});

export default db;
