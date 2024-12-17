import pg from "pg";
import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

db.connect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

app.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, email, phoneno, name } = req.body;
    console.log(`Signed Up With ${name} and ${password}`);

    const existingUser = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(401).json({ error: "Username already in use" });
    }
    const newUser = await db.query(
      "INSERT INTO users (username, password, email, phoneno, name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, password, email, phoneno, name]
    );
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

app.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const { username, password } = req.body;
    console.log(`Logging in with ${username} and ${password}`);

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Please provide username and password" });
    }

    // Query to check if user exists
    const info = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (info.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User Not Found" });
    }

    const user = info.rows[0];

    // Check if password matches
    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect Password" });
    }

    // Return both username and userId (assuming userId is stored in user.id)
    res.json({
      success: true,
      message: "Login Successful",
      username: user.username,
      userId: user.id, // assuming `user.id` is the user identifier
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/user", async (req, res) => {
  const { username } = req.query; // Use query parameters
  console.log("Requested username:", username); // Debugging
  try {
    const user = await db.query("select * from users where username = ($1)", [
      username,
    ]);
    console.log(user.rows);
    res.json(user.rows);
  } catch (error) {
    console.error("Error Fetching User", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const events = await db.query("SELECT * FROM events");
    res.json(events.rows);
  } catch (error) {
    console.log("Error Fetching Events", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/filter", async (req, res) => {
  try {
    const { city, date } = req.body;
    console.log(`Filtering events in ${city} on ${date}`);
    if (city && date == "") {
      try {
        const events = await db.query("SELECT * FROM events WHERE city = $1", [
          city,
        ]);
        res.json(events.rows);
      } catch (error) {
        console.log("Error Fetching Events", error);
        res.status(500).json({ error: "Server Error" });
      }
    } else if (city == "" && date) {
      try {
        const events = await db.query("SELECT * FROM events WHERE date = $1", [
          date,
        ]);
        res.json(events.rows);
      } catch (error) {
        console.log("Error Fetching Events", error);
        res.status(500).json({ error: "Server Error" });
      }
    } else if (date && city) {
      try {
        const events = await db.query(
          "SELECT * FROM events WHERE city = $1 AND date = $2",
          [city, date]
        );
        res.json(events.rows);
      } catch (error) {
        console.log("Error Fetching Events", error);
        res.status(500).json({ error: "Server Error" });
      }
    } else {
      try {
        const events = await db.query("SELECT * FROM events");
        res.json(events.rows);
      } catch (error) {
        console.log("Error Fetching Events", error);
        res.status(500).json({ error: "Server Error" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/purchase", async (req, res) => {
  try {
    console.log(req.body);
    const { username, id, quant, amount, payment_date, payment_time } =
      req.body; // Updated keys to match schema

    // Query the event to get total_tickets and tickets_sold
    const event = await db.query(
      "SELECT total_tickets, tickets_sold FROM events WHERE id = $1",
      [id]
    );
    console.log(event.rows);

    // Check if the event exists
    if (event.rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const { total_tickets, tickets_sold } = event.rows[0];

    // Validate ticket availability
    if (quant > total_tickets - tickets_sold) {
      return res.status(400).json({ error: "Not enough tickets available" });
    }

    // Update tickets_sold in the events table
    await db.query(
      "UPDATE events SET tickets_sold = tickets_sold + $1 WHERE id = $2",
      [quant, id]
    );
    console.log(`Tickets Sold =${quant + tickets_sold}`);
    // Insert the purchase into the payment table
    await db.query(
      "INSERT INTO payment (username, event_id, quantity, amount, payment_date, payment_time) VALUES ($1, $2, $3, $4, $5, $6)",
      [username, id, quant, amount, payment_date, payment_time]
    );

    res.status(201).json({ message: "Purchase successful" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/trendingEvents", async (req, res) => {
  try {
    const trending = await db.query("SELECT * FROM TrendingEvents");
    res.json(trending.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const reviews = await db.query("SELECT * FROM reviews");
    console.log(reviews.rows);
    res.json(reviews.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/host", async (req, res) => {
  try {
    console.log(req.body);
    const { name, location, city, price, date, organiserid, totalTickets } =
      req.body;

    if (!organiserid) {
      return res.status(400).json({ error: "Organiser ID is required" });
    }

    const event = await db.query(
      "INSERT INTO events (name, location, city, price, date, organiserid, total_tickets) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, location, city, price, date, organiserid, totalTickets]
    );
    console.log(event.rows);
    console.log("Event hosted successfully");
    res.json(event.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/reviewsAdd", async (req, res) => {
  try {
    const { userid, review, rating } = req.body;

    // Validate input
    if (!userid || !review || !rating) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (isNaN(userid) || isNaN(rating)) {
      return res
        .status(400)
        .json({ error: "User ID and rating must be numbers." });
    }

    // Insert review into the database
    const reviews = await db.query(
      "INSERT INTO reviews (userid, review, rating) VALUES ($1, $2, $3) RETURNING *",
      [userid, review, rating]
    );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: reviews.rows[0],
    });
  } catch (error) {
    console.error("Error adding review:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/history/:username", async (req, res) => {
  try {
    const { username } = req.params;
    console.log("Fetching history for", username);
    const result = await db.query(
      "SELECT COUNT(*) AS count FROM Payment WHERE username = $1",
      [username]
    );
    res.json({ count: result.rows[0].count });
  } catch (error) {
    console.error("Error Fetching History", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/organisehistory/:username", async (req, res) => {
  try {
    const { username } = req.params; // Use 'username' directly from the route
    console.log("For", username);

    const result = await db.query(
      "SELECT * FROM events WHERE organiserid = $1",
      [username]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Error Fetching History", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/purchasehistory", async (req, res) => {
  try {
    const { username } = req.body;
    const result = await db.query("SELECT * FROM payment WHERE username = $1", [
      username,
    ]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error Fetching History", error);
    res.status(500).json({ error: "Server Error" });
  }
});
