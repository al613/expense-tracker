require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection setup using Pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Allowed Categories for Validation
const ALLOWED_CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

// 1. GET /api/expenses - Get all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY date DESC, id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses from database" });
  }
});

// 2. POST /api/expenses - Add a new expense
app.post("/api/expenses", async (req, res) => {
  const { title, amount, category, date } = req.body;

  // Input Validation
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ 
      error: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}` 
    });
  }

  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "Valid date is required (YYYY-MM-DD)" });
  }

  try {
    const queryText = `
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [title.trim(), parsedAmount, category, date];
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// 3. PUT /api/expenses/:id - Update an existing expense
app.put("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date } = req.body;

  if (isNaN(id)) {
    return res.status(404).json({ error: "Expense not found (Invalid ID format)" });
  }

  // Input Validation
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ 
      error: `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}` 
    });
  }

  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ error: "Valid date is required (YYYY-MM-DD)" });
  }

  try {
    const queryText = `
      UPDATE expenses
      SET title = $1, amount = $2, category = $3, date = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [title.trim(), parsedAmount, category, date, id];
    const result = await pool.query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// 4. DELETE /api/expenses/:id - Delete an expense
app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(404).json({ error: "Expense not found (Invalid ID format)" });
  }

  try {
    const queryText = "DELETE FROM expenses WHERE id = $1 RETURNING *";
    const result = await pool.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully", deletedExpense: result.rows[0] });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Handling 404 Routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found (404)" });
});

app.listen(PORT, () => {
  console.log(`Expense Tracker API running on http://localhost:${PORT}`);
});