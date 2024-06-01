import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import dotenv from "dotenv";

// Declarations
const app = express();
const port = 3000;

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Database
dotenv.config();
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

// Functions
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// Get method
app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM book")
    res.render("index.ejs", {
        result : result.rows
    });
});

// Post request
app.post("/post", async (req, res) => {
  try {
    const date = getCurrentDate();
    const result = await db.query(
      "INSERT INTO book (username, book , isbn, rating, added , note) values($1, $2, $3, $4, $5, $6)",
      [req.body.username, req.body.book, req.body.isbn, req.body.rating, date , req.body.note]
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// Patch Request
app.patch("/edit", async(req,res)=>{
  try {
    const date = getCurrentDate();
    const result = await db.query(
      "UPDATE book SET username = $1, book = $2, isbn = $3, rating = $4, added = $5, note = $6 WHERE id = $7",
      [req.body.username, req.body.book, req.body.isbn, req.body.rating, date, req.body.note, req.body.id]
    );
    res.redirect("/")
  } catch (error) {
    console.log(error);
  }
})

// Listen Method
app.listen(port, () => {
  console.log(`Sever started at Port ${port}`);
});
