import pg from "pg";
const client = new pg.Client({
  host: "ep-super-lake-a147s83m.ap-southeast-1.aws.neon.tech",
  port: 5432,
  user: "vibeZ_owner",
  password: "vpXmPV4AZa1b",
  database: "vibeZ",
  ssl: { rejectUnauthorized: false }, // SSL for Neon DB
});

client
  .connect()
  .then(() => console.log("Connected to Neon DB!"))
  .catch((err) => console.error("Error connecting to DB:", err));
export default db;
