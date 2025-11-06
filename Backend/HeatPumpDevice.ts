import express from "express";
import http, { get } from "http"
import { Server } from "socket.io";
import cors from "cors";
import { ServerNode, Logger } from "@matter/main";
import { MeasurementType } from "@matter/main/types";
import { PowerSourceNs } from "@matter/model";
import { HeatPumpDevice } from "@matter/main/devices/heat-pump";
import { ThermostatDevice } from "@matter/main/devices/thermostat";
import { HeatPumpDeviceLogic } from "./HeatPumpDeviceLogic.ts";
import { HeatPumpThermostatServer } from "./HeatPumpThermostatServer.ts";
import { PowerSourceServer } from "@matter/main/behaviors/power-source";
import { PowerTopologyServer } from "@matter/main/behaviors/power-topology";
import { DeviceEnergyManagementServer } from "@matter/main/behaviors/device-energy-management";
import { ElectricalPowerMeasurementServer } from "@matter/main/behaviors/electrical-power-measurement";
import { ElectricalEnergyMeasurementServer } from "@matter/main/behaviors/electrical-energy-measurement";
import { ThermostatServer } from "@matter/main/behaviors/thermostat";
import fs from "fs";

const logger = Logger.get("ComposedDeviceNode");

const node = new ServerNode({
    id: "heat-pump",
    productDescription: {},
    basicInformation: {
        vendorName: "ACME Corporation",
        productName: "Seld-M-Break Heat Pump",
        vendorId: 0xfff1,
        productId: 0x8000,
        serialNumber: "1234-5665-4321",
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
        featureMap: { powerAdjustment: true, powerForecastReporting: true},
    }
});

var thermostatEndpoint = await node.add(ThermostatDevice.with(HeatPumpThermostatServer), {
    id: "heat-pump-thermostat",
    thermostat: {
        featureMap: { heating: true },
        controlSequenceOfOperation: 2, // Heating only
        systemMode: 0, // Off,
        localTemperature: 2000, // 20.00 °C,
        outdoorTemperature: 1500, // 15.00 °C,
    }
});

var currentHour = 0;
var currentHeatingScheduleIndex = 0;
var currentHotWaterScheduleIndex = 0;

thermostatEndpoint.events.thermostat.systemMode$Changed.on(value => {
    var heatingOn = value === 4; // SystemMode 4 is heating

    console.log(`Thermostat is now ${heatingOn ? "ON" : "OFF"}`);

    updateSystemToCurrentHour(currentHour);
    updateForecast();
    updateClients();
});

thermostatEndpoint.events.thermostat.occupiedHeatingSetpoint$Changed.on(value => {
    console.log(`Heating setpoint is now ${value}°C`);

    updateSystemToCurrentHour(currentHour);
    updateForecast();
    updateClients();
});

function updateForecast() {
    // Divide the forecast by the heating schedule, with a slot dedicated to the hot water run.
    //


}

logger.info(node);

await node.start();

var heatingSchedule = [
    {
        hour: 0,
        endHour: 4,
        targetTemperature: 16
    },
    {
        hour: 5,
        endHour: 19,
        targetTemperature: 21
    },
    {
        hour: 20,
        endHour: 23,
        targetTemperature: 16
    },
];

var hotWaterSchedule = [
    {
        hour: 0,
        endHour: 3,
        on: false
    },
    {
        hour: 4,
        endHour: 4,
        on: true
    },
    {
        hour: 5,
        endHour: 23,
        on: false
    },
];

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
        status: "Running",
        systemMode: thermostatEndpoint.state.thermostat.systemMode,
        currentHour,
        targetTemperature: thermostatEndpoint.state.thermostat.occupiedHeatingSetpoint / 100,
        power: heatpumpEndpoint.state.electricalPowerMeasurement.activePower,
        activeHeatingScheduleIndex: currentHeatingScheduleIndex,
        activeHotWaterScheduleIndex: currentHotWaterScheduleIndex
    };

    response.send(status);
});

app.post("/currenthour", async (request, response) => {

    await updateSystemToCurrentHour(request.body.currentHour);

    response.status(201).send();
});

app.get("/outdoortemperatures", async (request, response) => {
    response.send(temperatureByHour);
});

app.get("/heatingschedule", async (request, response) => {
    response.send(heatingSchedule);
});

app.get("/hotwaterschedule", async (request, response) => {
    response.send(hotWaterSchedule);
});

app.post("/on", async (request, response) => {
    console.log('Turning On...');
    await thermostatEndpoint.setStateOf(ThermostatServer, {
        systemMode: 4,
    });
    updateClients();
    response.status(201).send();
});

app.post("/off", async (request, response) => {
    console.log('Turning Off...');
    await thermostatEndpoint.setStateOf(ThermostatServer, {
        systemMode: 0,
    });
    updateClients();
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
 * ML - Load the linear regression model
 ***/

const data = fs.readFileSync('./model/model_params.json', 'utf8');
const modelParams = JSON.parse(data);

function predict(features: any) {
    let prediction = modelParams.intercept;
    for (let i = 0; i < features.length; i++) {
        prediction += features[i] * modelParams.coef[i];
    }
    return prediction;
}

/****
 * Load the Outdoor temperature Forecast
 ****/

console.log("Fetching weather forecast...");

const params = {
    "latitude": 52.4118,
    "longitude": 1.777652,
    "hourly": "temperature_2m",
    "timezone": "Europe/London",
    "start_date": "2024-11-28",
    "end_date": "2024-11-28",
};

const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${params.latitude}&longitude=${params.longitude}&timezone=${params.timezone}&hourly=temperature_2m&start_date=${params.start_date}&end_date=${params.end_date}`;

const response = await fetch(url);

const responseData = await response.json();

const hourlyData = responseData.hourly;

const temperatureByHour = hourlyData.time.map((t, i) => 
{
    var time = new Date(t);

    return {
        hour: time.getHours(),
        temperature: hourlyData.temperature_2m[i]
    }
});

async function updateSystemToCurrentHour(hour) {

    currentHour = hour;

    // Check if the schedule has changed...
    //
    var matchingHeatingSchedule = heatingSchedule.find(hs => hs.hour <= hour && hs.endHour >= hour);

    var matchingHeatingScheduleIndex = heatingSchedule.indexOf(matchingHeatingSchedule);

    if(matchingHeatingScheduleIndex != currentHeatingScheduleIndex) {

        currentHeatingScheduleIndex = matchingHeatingScheduleIndex;

        var newTemperature =  matchingHeatingSchedule.targetTemperature * 100;

        await thermostatEndpoint.setStateOf(ThermostatServer, {
             occupiedHeatingSetpoint: newTemperature
        });
    }

    var matchingHotWaterSchedule = hotWaterSchedule.find(hs => hs.hour <= hour && hs.endHour >= hour);

    currentHotWaterScheduleIndex = hotWaterSchedule.indexOf(matchingHotWaterSchedule);

    var outdoorTemperature = temperatureByHour.find(t => t.hour == hour).temperature;

    var targetTemperature = thermostatEndpoint.state.thermostat.occupiedHeatingSetpoint / 100;

    var deltaT = targetTemperature - outdoorTemperature;

    var heatRequired = deltaT * 200;

    if(matchingHeatingSchedule.on) {
        heatRequired = 5000;
    }

    var power: number = 0;

    // We're heating or we need hot water. Either way, we're pulling power!
    //
    if (thermostatEndpoint.state.thermostat.systemMode === 4 || matchingHotWaterSchedule.on) {
        power = predict([heatRequired, outdoorTemperature]) * 1000; // mW;
    }

    var currentPower = Math.floor(power);

    await heatpumpEndpoint.setStateOf(ElectricalPowerMeasurementServer, {
        activePower: currentPower,
    });

    updateClients();
}

function updateClients() {
    io.emit('systemUpdated', {
        systemMode: thermostatEndpoint.state.thermostat.systemMode,
        currentHour,
        targetTemperature: thermostatEndpoint.state.thermostat.occupiedHeatingSetpoint / 100,
        power: heatpumpEndpoint.state.electricalPowerMeasurement.activePower,
        activeHeatingScheduleIndex: currentHeatingScheduleIndex,
        activeHotWaterScheduleIndex: currentHotWaterScheduleIndex
    });
}

await updateSystemToCurrentHour(0);