import express from "express";
import http, { get } from "http"
import { Server } from "socket.io";
import cors from "cors";
import { MaybePromise, ServerNode } from "@matter/main";
import { HeatPumpDevice } from "@matter/main/devices/heat-pump";
import { Thermostat } from "@matter/main/clusters/thermostat";
import { ThermostatServer } from "@matter/main/behaviors/thermostat";
import { fetchWeatherApi } from 'openmeteo';
import { HeatPumpDeviceLogic } from "./HeatPumpDeviceLogic.ts";

class HeatPumpThermostatServer extends ThermostatServer.with(Thermostat.Feature.Heating) {

    override async setpointRaiseLower(value: number): Promise<void> {
        console.log("Setpoint Raise Lower called with value:", value);
    }
}

const node = await ServerNode.create();

const heatpump = await node.add(HeatPumpDevice.with(HeatPumpDeviceLogic, HeatPumpThermostatServer),
    {
        id: "heat-pump",
        thermostat: {
            systemMode: Thermostat.SystemMode.Heat,
            controlSequenceOfOperation: Thermostat.ControlSequenceOfOperation.HeatingOnly,
        }
    }
);

await node.start();


const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST", "DELETE", "PUT"]
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

/***
 * ML
 ***/

async function getData() {
  const carsDataResponse = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
  const carsData = await carsDataResponse.json();
  const cleaned = carsData.map(car => ({
    mpg: car.Miles_per_Gallon,
    horsepower: car.Horsepower,
  }))
  .filter(car => (car.mpg != null && car.horsepower != null));

  return cleaned;
}

/****
 * FORECAST
 ****/

console.log("Fetching weather forecast...");

const params = {
	"latitude": 52.4118,
	"longitude": 1.777652,
	"hourly": "temperature_2m",
	"timezone": "Europe/London",
	"start_date": "2025-09-30",
	"end_date": "2025-09-30", 
};
const url = "https://api.open-meteo.com/v1/forecast";
const responses = await fetchWeatherApi(url, params);

const response = responses[0];

const hourlyOutdoorTemperatureForecast = response.hourly();

console.log(hourlyOutdoorTemperatureForecast);

await node.start();