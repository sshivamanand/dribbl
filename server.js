import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import axios from "axios";
import cors from "cors";

const app = express();
const port = 3000;
const host = "192.168.56.1"; // Replace this with your actual local IP
const saltRounds = 10;
import WebSocket, { WebSocketServer } from "ws";
const wss = new WebSocketServer({ host, port: 3001 });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

let activeConnections = new Map(); // To store active WebSocket connections by username

wss.on("connection", (ws) => {
  let currentUser = null;

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("Received:", data);

    // If the message type is 'login', associate the WebSocket with the username
    if (data.type === "login") {
      currentUser = data.payload.username;
      activeConnections.set(currentUser, ws);
      console.log(`User ${currentUser} connected`);
    }

    // Broadcast message to other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  // When a client disconnects, remove them from the active connections
  ws.on("close", () => {
    if (currentUser) {
      activeConnections.delete(currentUser);
      console.log(`User ${currentUser} disconnected`);
    }
  });

  ws.send(
    JSON.stringify({ type: "info", payload: "Welcome to WebSocket chat!" })
  );
});

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "dribbl_db",
  password: "Singh@786",
  port: 5432,
});
db.connect();

// sign up
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const checkUser = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

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

// login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({
      message: "Login successful",
      user: { username: user.username, email: user.email },
    });

    // Send login info to WebSocket clients
    const clientSocket = activeConnections.get(username);
    if (clientSocket) {
      clientSocket.send(
        JSON.stringify({ type: "login", payload: { username: user.username } })
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// logout
app.post("/logout", (req, res) => {
  const { username } = req.body;

  // Check if the user is logged in and remove their socket
  const clientSocket = activeConnections.get(username);
  if (clientSocket) {
    clientSocket.close();
    activeConnections.delete(username);
    res.status(200).json({ message: "Logout successful" });
  } else {
    res.status(400).json({ message: "User not logged in" });
  }
});

app.listen(port, host, () => {
  console.log(`Server is now live at http://${host}:${port}`);
});
