import express from "express";
import http, { get } from "http"
import { Server } from "socket.io";
import cors from "cors";
import { ServerNode } from "@matter/main";
import { HeatPumpDevice } from "@matter/main/devices/heat-pump";

const node = await ServerNode.create();

const heatpump = await node.add(HeatPumpDevice);

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

app.get("/status", (request, response) => {
    const status = {
        "status": "Running"
    };

    response.send(status);
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

await node.start();