const Websocket = require("ws");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const clients = new Set();

const PORT = process.env.PORT || 5000;

const wss = new Websocket.Server({ port: PORT });

wss.on("connection", (ws, req) => {
    console.log("Client connected");

    const urlParams = new URLSearchParams(req.url.slice(1));
    if (jwt.verify(urlParams.get('token'), process.env.JWT_SECRET) === false) {
        console.log('Invalid token: ' + urlParams.get('token'));
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Invalid token.'
        }));
        ws.close();
    }

    if (!clients.has(ws)) {
        clients.add(ws);
    }

    ws.on("message", (message) => {
        console.log("Received: ", message);

        clients.forEach(client => {
            if (client === ws) {
                client.send(JSON.stringify({
                    status: 1,
                    clients: clients.size-1
                }));
                return
            }

            client.send(JSON.stringify({
                status: 0,
                msg: String(message)
            }));
        });
    });

    ws.on("close", () => {
        console.log("Client disconnected")
    })
})
