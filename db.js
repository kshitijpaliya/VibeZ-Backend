import pg from "pg";
const db = new pg.Client({
  user: "postgres",
  password: "Kshitij15",
  host: "localhost",
  port: 5432,
  database: "vibez",
});

export default db;
