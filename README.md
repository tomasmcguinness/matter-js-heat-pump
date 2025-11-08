# Matter Heat Pump

I'm trying to create a Matter Heat Pump to learn more about Matter. This project will serve as a device that supported power adjustment. 

This project uses matterjs and uses nextJs for the frontend and nodeJs for the backend.

It leverages my basic ML - https://github.com/tomasmcguinness/ml-python-heatpump-model

## Running
To run this, you'll need to start both the backend.

For the backend
```
cd Backend
node HeatPumpDevice.js
```

For the frontend

```
cd Frontend
npm run dev
```

Once you open the application, you should see something like this

<img width="2173" height="1860" alt="image" src="https://github.com/user-attachments/assets/9da7fa03-61c4-48d8-8185-5d196414a129" />


## Using

I don't know of any commissioner that supports the Heat Pump, outside of `chip-tool`. Most will render the thermostat, so you can use that to play with the controls.

The weather forecast is fixed to a date in the past that had a nice variation. The heat loss is set to 5kW with a design temp of -3. Weather curve offset is 35 with a slope of 0.5.

If you click OFF/HEATING, it will toggle the heat pump on/off (hot water should still happen!)

You can slide the "Current Time" bar to see the values changes.

Using the iOS App or the Aqara app, you can adjust the set temperature or change the mode. The Aqara app will also show you power consumption!

# Next Up

Saving configuration for heat loss and weather curve.
Show calculated flow temp and flow rates.
Generate a power forecast for my Energy Manager (https://github.com/tomasmcguinness/matter-js-energy-manager)
Implementing heating schedule in Matter (the SDK doesn't support this yet).

## Known problems
I don't have the Descriptor TagList PowerSource.Grid value.
