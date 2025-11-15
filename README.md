# Matter Heat Pump

I'm trying to create a Matter Heat Pump to learn more about Matter. This project will serve as a device that supported power adjustment. 

This project uses matterjs and uses nextJs for the frontend and nodeJs for the backend.

It leverages my basic ML - https://github.com/tomasmcguinness/ml-python-heatpump-model

## Running
To run this, you'll need to start both the backend.

For the backend
```
cd Backend
npm install
node HeatPumpDevice.js
```

For the frontend

```
cd Frontend
npm install
npm run dev
```

Once you open the application, you should see something like this

<img width="2173" height="1860" alt="image" src="https://github.com/user-attachments/assets/9da7fa03-61c4-48d8-8185-5d196414a129" />


## Using

I don't know of any commissioner that supports the Heat Pump, outside of `chip-tool`. Most will render the thermostat, so you can use that to play with the controls.

The weather forecast is fixed to a date in the past that had a nice cold spell.

If you click OFF/HEATING, it will toggle the heat pump on/off

Using the iOS App or the Aqara app, you can adjust the set temperature or change the mode. The Aqara app will also show you power consumption!

# Next Up

Better calculation of the heat pump's power consumption and flow temperature
Implementing heating schedule in Matter (the SDK doesn't support this yet).

## Known problems
I don't have the Descriptor TagList PowerSource.Grid value.
