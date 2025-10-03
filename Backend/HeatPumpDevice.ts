import express from "express";
import http, { get } from "http"
import { Server } from "socket.io";
import cors from "cors";
import { ServerNode, Logger } from "@matter/main";
import { MeasurementType } from "@matter/main/types";
import { PowerSourceNs } from "@matter/model";
import { HeatPumpDevice } from "@matter/main/devices/heat-pump";
import { HeatPumpDeviceLogic } from "./HeatPumpDeviceLogic.ts";
import { HeatPumpThermostatServer } from "./HeatPumpThermostatServer.ts";
import { PowerSourceServer } from "@matter/main/behaviors/power-source";
import { PowerTopologyServer } from "@matter/main/behaviors/power-topology";
import { DeviceEnergyManagementServer } from "@matter/main/behaviors/device-energy-management";
import { ElectricalPowerMeasurementServer } from "@matter/main/behaviors/electrical-power-measurement";
import { ElectricalEnergyMeasurementServer } from "@matter/main/behaviors/electrical-energy-measurement";
import { fetchWeatherApi } from 'openmeteo';

const logger = Logger.get("ComposedDeviceNode");

const node = new ServerNode({
    id: "heat-pump",
    endpointId: 1,
    productDescription: {},

    basicInformation: {
        vendorName: "Acme Corporation",
        productName: "Seld-M-Break Heat Pump",
        vendorId: 0xfff1,
        productId: 0x8000,
        serialNumber: "1234-12345-123",
    },

});

var heatpumpEndpoint = await node.add(HeatPumpDevice.with(HeatPumpDeviceLogic,
    PowerSourceServer,
    PowerTopologyServer,
    ElectricalPowerMeasurementServer,
    ElectricalEnergyMeasurementServer,
    DeviceEnergyManagementServer), {
    id: "heat-pump",
    // heatPump: {
    //     tagList: [PowerSourceNs.Grid],
    // },
    powerSource: {
        featureMap: { wired: true },
        status: 1,
        order: 1,
        description: "Grid",
    },
    powerTopology: {
        featureMap: { nodeTopology: true },
    },
    electricalPowerMeasurement: {
        featureMap: { alternatingCurrent: true },
        powerMode: 2,
        numberOfMeasurementTypes: 1,
        accuracy: [{
            measurementType: MeasurementType.ActivePower,
            measured: true,
            minMeasuredValue: 0,
            maxMeasuredValue: 10000,
            accuracyRanges: [{
                rangeMin: 0,
                rangeMax: 10000,
                percentMax: 100
            }],
        }],
    },
    electricalEnergyMeasurement: {
        featureMap: { importedEnergy: true },
        accuracy: {
            measurementType: MeasurementType.ElectricalEnergy,
            measured: true,
            minMeasuredValue: 0,
            maxMeasuredValue: 10000,
            accuracyRanges: [{
                rangeMin: 0,
                rangeMax: 10000,
                percentMax: 100
            }],
        }
    },
    deviceEnergyManagement: {
        featureMap: { powerAdjustment: true },
    }
});

logger.info(node);

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

app.post("/power", async (request, response) => {

    console.log('Setting power!');

    await heatpumpEndpoint.setStateOf(ElectricalPowerMeasurementServer, {
        activePower: 1000,
    });

    response.status(201).send();
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

// async function getData() {
//   const carsDataResponse = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
//   const carsData = await carsDataResponse.json();
//   const cleaned = carsData.map(car => ({
//     mpg: car.Miles_per_Gallon,
//     horsepower: car.Horsepower,
//   }))
//   .filter(car => (car.mpg != null && car.horsepower != null));

//   return cleaned;
// }

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