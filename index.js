const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const pg = require('pg');
const bodyParser = require('body-parser');

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "users",
  password: "Postgres@1234",
  port: 5432,
});

db.connect();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("user-message", (message) => {
    io.emit("message", message);
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./public")));

app.get("/login", (req, res) => {
  return res.render("login.html");
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      if (password === storedPassword) {
        res.render("index.html");
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});


server.listen(9000, () => 
  console.log(`Server Started at Port 9000`)
);