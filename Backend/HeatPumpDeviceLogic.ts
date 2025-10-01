import { Behavior, Node } from "@matter/main";
import { Thermostat } from "@matter/main/clusters/thermostat";
import { HeatPumpThermostatServer } from "./HeatPumpThermostatServer.ts";

export class HeatPumpDeviceLogic extends Behavior {
    static override readonly id = "heatPumpDeviceLogic";
    static override readonly early = true;

    override async initialize() {
        // Delay setting up all the listeners to make sure we have a clean state
        this.reactTo((this.endpoint as Node).lifecycle.partsReady, this.#initializeNode);
    }

    async #initializeNode() {
        const operationalState = await this.agent.load(HeatPumpThermostatServer);
        this.reactTo(operationalState.events.systemMode$Changed, this.#handleSystemModeChanged, {
            offline: true,
        });
        this.reactTo(operationalState.events.occupiedHeatingSetpoint$Changed, this.#handleOccupiedHeatingSetpointChanged, {
            offline: true,
        });
    }

    async #handleSystemModeChanged(newMode: Thermostat.SystemMode, oldMode: Thermostat.SystemMode) {
        console.log("System Mode changed to:", newMode);
    }

    async #handleOccupiedHeatingSetpointChanged(newMode: number, oldMode: number) {
        console.log("Occupied Heating Setpoint changed to:", newMode);
    }
}   