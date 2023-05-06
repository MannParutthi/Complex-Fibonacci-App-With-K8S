const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000 // if connection is lost, try to reconnect every 1000ms / 1s
});

const sub = redisClient.duplicate(); // sub stands for subscription => watch redis for new values and calculate new fib values

function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => { // anytime we get a new message (for new value), run the callback function
    redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert'); // anytime we see a new value inserted into redis, run the callback function
