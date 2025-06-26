import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import fs from "fs";
import https from "https";

/* Native NodeJs Library */
import WebSocket, { WebSocketServer } from "ws";

// write your details here

const YOUR_IP = "";
const YOUR_DB_PWD = "";
const YOUR_DB = "";

const host = YOUR_IP; 
const port = 3001;
const saltRounds = 10;

/* A working SSL Implementation */
const privateKey = fs.readFileSync("ssl/private.key", "utf8");
const certificate = fs.readFileSync("ssl/certificate.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: YOUR_DB,
  password: YOUR_DB_PWD,
  port: 5432,
});
db.connect();

const httpsServer = https.createServer(credentials, app);

const wss = new WebSocketServer({ server: httpsServer });
const activeConnections = new Map();

wss.on("connection", (ws) => {
  let currentUser = null;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log("Received:", data);

      if (data.type === "login") {
        currentUser = data.payload.username;
        activeConnections.set(currentUser, ws);
        console.log(`🔗 ${currentUser} connected`);
        return; // Don't broadcast login messages
      }

      if (data.type === "message") {
        console.log(`📨 Message from ${data.payload.sender} to ${data.payload.receiver}: ${data.payload.text}`);
        
        // Send to specific recipient if they're online
        const recipientWs = activeConnections.get(data.payload.receiver);
        if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
          recipientWs.send(JSON.stringify(data));
        }
        
        // Also send back to sender for confirmation
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Invalid WS message:", err);
    }
  });

  ws.on("close", () => {
    if (currentUser) {
      activeConnections.delete(currentUser);
      console.log(`❌ ${currentUser} disconnected`);
    }
  });

  ws.send(JSON.stringify({ type: "info", payload: "Welcome to WebSocket chat!" }));
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, saltRounds);
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashed]
    );

    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  const { username } = req.body;
  const wsClient = activeConnections.get(username);

  if (wsClient) {
    wsClient.close();
    activeConnections.delete(username);
    res.status(200).json({ message: "Logout successful" });
  } else {
    res.status(400).json({ message: "User not logged in" });
  }
});

httpsServer.listen(port, host, () => {
  console.log(`Server running at https://${host}:${port}`);
});