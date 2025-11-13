import { Thermostat } from "@matter/main/clusters/thermostat";
import { ThermostatServer } from "@matter/main/behaviors/thermostat";

export class HeatPumpThermostatServer extends ThermostatServer.with(Thermostat.Feature.Heating, Thermostat.Feature.MatterScheduleConfiguration) {

    override async setpointRaiseLower(request: Thermostat.SetpointRaiseLowerRequest): Promise<void> {
        console.log("Setpoint Raise Lower called with amount:", request.amount);
    }
    
}