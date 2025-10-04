# Matter Heat Pump

I'm trying to create a Matter Heat Pump to learn more about Matter. This project will serve as a device that supported power adjustment. 

This project uses matterjs and uses nextJs for the frontend and nodeJs for the backend.

## Running
To run this, you'll need to start both the backend.

For the backend
```
cd Backend
node HeatPumpDevice.js
```

This code is rough around the edges, but should work!

![alt text](image.png)

I haven't tried it with Bluetooth, so you will need to ensure your devices are on-network when commissioning.

## Using
I don't know of any commissioner that supports the Heat Pump, outside of `chip-tool`. Most will render the thermostat, so you can use that to play with the controls.

The weather forecast is fixed to the 30th of September. 

If you switch the Thermostat to 'Heat' and adjust the target temperature, you will see the active power go up and down.

# Next Up

Adding a UI for displaying values.
Next step is adding a power forecast.
Implementing simple heating schedules.

## Known problems
I don't have the Descriptor TagList PowerSource.Grid value.
On shutdown, you might see "destroyed-dependency" errors. This is because the timer is trying to update the activePower.
