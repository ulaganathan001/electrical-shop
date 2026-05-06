import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "electrical",
  waitForConnections: true,
  connectionLimit: 5,
});

// --- PRODUCTS ---
app.get("/api/products", async (_req, res) => {
  const [rows] = await pool.execute("SELECT id, name, buy_price, sell_price, created_at FROM products ORDER BY name");
  res.json(rows);
});

app.post("/api/products", async (req, res) => {
  const { name, buy_price = 0, sell_price = 0 } = req.body;
  const id = crypto.randomUUID();
  await pool.execute("INSERT INTO products (id, name, buy_price, sell_price) VALUES (?, ?, ?, ?)", [id, name, buy_price, sell_price]);
  res.status(201).json({ id });
});

app.put("/api/products/:id", async (req, res) => {
  const { name, buy_price = 0, sell_price = 0 } = req.body;
  await pool.execute("UPDATE products SET name = ?, buy_price = ?, sell_price = ? WHERE id = ?", [name, buy_price, sell_price, req.params.id]);
  res.json({ success: true });
});

app.delete("/api/products/:id", async (req, res) => {
  await pool.execute("DELETE FROM products WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// --- STOCK ---
app.get("/api/stock/years", async (_req, res) => {
  const [rows] = await pool.execute("SELECT DISTINCT year FROM stock_entries ORDER BY year DESC");
  res.json((rows as { year: number }[]).map((r) => r.year));
});

app.get("/api/stock", async (req, res) => {
  const year = req.query.year;
  let rows;
  const query = `SELECT se.id, se.product_id, se.quantity, se.buy_price, se.year, se.created_at,
                        p.name AS product_name
                 FROM stock_entries se
                 JOIN products p ON p.id = se.product_id
                 ${year ? "WHERE se.year = ?" : ""}
                 ORDER BY se.created_at DESC`;
  [rows] = year ? await pool.execute(query, [Number(year)]) : await pool.execute(query);
  res.json(rows);
});

app.post("/api/stock", async (req, res) => {
  const { product_id, quantity = 0, buy_price = 0, year } = req.body;
  const id = crypto.randomUUID();
  await pool.execute("INSERT INTO stock_entries (id, product_id, quantity, buy_price, year) VALUES (?, ?, ?, ?, ?)", [id, product_id, quantity, buy_price, year]);
  res.status(201).json({ id });
});

app.delete("/api/stock/:id", async (req, res) => {
  await pool.execute("DELETE FROM stock_entries WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// Serve React frontend
app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "../dist/index.html")));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
