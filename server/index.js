const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors()); // Cross Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming requests from React app


// Postgres Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)") // single column table to store all indices submitted by user
      .catch((err) => console.error(err));
});


// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // if connection is lost, try to reconnect every 1000ms/1s
});
const redisPublisher = redisClient.duplicate(); // duplicate connection to Redis server to listen for new values submitted by user

// Express route handlers
app.get("/", (req, res) => {
    res.send("Hi");
});

// Get all values submitted by user
app.get("/values/all", async (req, res) => {
    const values = await pgClient.query("SELECT * from values");
    res.send(values.rows);
});

// Get all indices requested by users and their corresponding calculated fibonacci values from Redis server
app.get("/values/current", async (req, res) => {
    redisClient.hgetall("values", (err, values) => {
        res.send(values);
    });
});

// Receive new index from user, calculate corresponding fibonacci value, and store in Redis server
app.post("/values", async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send("Index too high");
    }

    redisClient.hset("values", index, "Nothing yet!"); // Nothing yet! is a placeholder value that will be replaced by the calculated fibonacci value
    redisPublisher.publish("insert", index);
    pgClient.query("INSERT INTO values(number) VALUES($1)", [index]); // insert new index into Postgres database

    res.send({ working: true }); // let user know that the index was received and is being processed
});

app.listen(5000, (err) => {
    console.log("Listening");
});
