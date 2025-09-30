import { Behavior, Node } from "@matter/main";

export class HeatPumpDeviceLogic extends Behavior {
    static override readonly id = "heatPumpDeviceLogic";
    static override readonly early = true;

    override async initialize() {
        // Delay setting up all the listeners to make sure we have a clean state
        this.reactTo((this.endpoint as Node).lifecycle.partsReady, this.#initializeNode);
    }

    async #initializeNode() {
    }
}   