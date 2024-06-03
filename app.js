import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import pg from "pg";
import dotenv from "dotenv";

// Declarations
const app = express();
const port = 3000;

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Database
dotenv.config();
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect().catch(error => console.log('Database connection error:', error));

// Functions
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// Set view engine to EJS
app.set("view engine", "ejs");

// Get method
app.get("/", async (req, res) => {
  try {
    let result;
    const sortQuery = req.query.sort;
    
    if (sortQuery === "bookName") {
      result = await db.query("SELECT * FROM book ORDER BY book ASC");
      res.render("index.ejs", {
        result: result.rows
      });
    } else if (sortQuery === "ratings") {
      result = await db.query("SELECT * FROM book ORDER BY rating DESC");
      res.render("index.ejs", {
        result: result.rows
      });
    } else if (sortQuery === "recentlyAdded") {
      result = await db.query("SELECT * FROM book ORDER BY added asc");
      res.render("index.ejs", {
        result: result.rows
      });
    } else {
      result = await db.query("SELECT * FROM book ORDER BY id");
      res.render("index.ejs", {
        result: result.rows
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});


// Post request
app.post("/post", async (req, res) => {
  try {
    const date = getCurrentDate();
    await db.query(
      "INSERT INTO book (username, book, isbn, rating, added, note) values($1, $2, $3, $4, $5, $6)",
      [req.body.username, req.body.book, req.body.isbn, req.body.rating, date, req.body.note]
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Patch Request
app.patch("/update", async (req, res) => {
  try {
    const fields = [];
    const values = [];
    let query = "UPDATE book SET ";
    let counter = 1;

    if (req.body.newusername) {
      fields.push(`username = $${counter++}`);
      values.push(req.body.newusername);
    }
    if (req.body.newbook) {
      fields.push(`book = $${counter++}`);
      values.push(req.body.newbook);
    }
    if (req.body.newisbn) {
      fields.push(`isbn = $${counter++}`);
      values.push(req.body.newisbn);
    }
    if (req.body.newrating) {
      fields.push(`rating = $${counter++}`);
      values.push(req.body.newrating);
    }
    if (req.body.newnote) {
      fields.push(`note = $${counter++}`);
      values.push(req.body.newnote);
    }

    if (fields.length > 0) {
      query += fields.join(", ");
      query += ` WHERE id = $${counter}`;
      values.push(req.body.newid);

      await db.query(query, values);
    }

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Request
app.delete("/", async (req, res) => {
  try {
    await db.query("DELETE FROM book WHERE id = $1", [req.body.id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Listen Method
app.listen(port, () => {
  console.log(`Server started at Port ${port}`);
});
