import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import axios from "axios";
import cors from "cors";

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin : "http://localhost:5173",
  credentials : true,
}));

/*if css or images don't run at some point, shift em all to the public folder and uncomment
this code */

// app.use(express.static("public")); 

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "dribble_db",
  password: "shivam",
  port: 5432,
});
db.connect();

//sign up
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ message: "Login successful", user: { username: user.username, email: user.email } });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
    console.log("Server is now live on port", port);
})