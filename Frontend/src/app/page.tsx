'use client';

import { Manager } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { HourlySchedule } from './hourlySchedule.tsx';

export default function Home() {

  const [isLoadingOutdoorTemperature, setIsLoadingOutdoorTemperature] = useState(true);
  const [outdoorTemperatures, setOutdoorTemperatures] = useState<OutdoorTemperature[]>(null);

  const [isLoadingHeatingSchedule, setIsLoadingHeatingSchedule] = useState(true);
  const [heatingSchedule, setHeatingSchedule] = useState<Transition[]>(null);

  const [isLoadingHotWaterSchedule, setIsLoadingHotWaterSchedule] = useState(true);
  const [hotWaterSchedule, setHotWaterSchedule] = useState<Transition[]>(null);

  const [systemMode, setSystemMode] = useState<number>(0);
  const [currentHour, setCurrentHour] = useState<number>(0);
  const [currentPower, setCurrentPower] = useState<number>(0);
  const [targetTemperature, setTargetTemperature] = useState<number>(0);
  const [activeHeatingScheduleIndex, setActiveHeatingScheduleIndex] = useState<number>(0);
  const [activeHotWaterScheduleIndex, setActiveHotWaterScheduleIndex] = useState<number>(0);

  useEffect(() => {
    fetch('http://localhost:3000/currenthour', { method: "POST",
      headers: {
    "Content-Type": "application/json",
  },
       body: JSON.stringify({ currentHour })});
    console.log(currentHour, '- Has changed')
  },[currentHour]) /

  useEffect(() => {

    const manager = new Manager("http://localhost:3000", {
      reconnectionDelayMax: 10000,
    });

    const socket = manager.socket("/");

    manager.open(err => {
      if (err) {
        // an error has occurred
      } else {
        // the connection was successfully established
        console.log("Socket connection established");
      }
    });

    socket.on("systemUpdated", (state) => {
      console.log("systemUpdated: " + state);
      setSystemMode(state.systemMode);
      setCurrentHour(state.currentHour);
      setCurrentPower(Math.floor(state.power));
      setTargetTemperature(state.targetTemperature);
      setActiveHeatingScheduleIndex(state.activeHeatingScheduleIndex);
      setActiveHotWaterScheduleIndex(state.activeHotWaterScheduleIndex);
    });

  }, []);

   useEffect(() => {
    fetch('http://localhost:3000/status').then(r => r.json()).then(state => { 
      setSystemMode(state.systemMode);
      setCurrentHour(state.currentHour);
      setCurrentPower(Math.floor(state.power));
      setTargetTemperature(state.targetTemperature);
      setActiveHeatingScheduleIndex(state.activeHeatingScheduleIndex);
      setActiveHotWaterScheduleIndex(state.activeHotWaterScheduleIndex);
    });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/outdoortemperatures').then(r => r.json()).then(data => { 
      setOutdoorTemperatures(data); 
      setIsLoadingOutdoorTemperature(false); });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/heatingschedule').then(r => r.json()).then(data => { 
      setHeatingSchedule(data); 
      setIsLoadingHeatingSchedule(false); });
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/hotwaterschedule').then(r => r.json()).then(data => { 
      setHotWaterSchedule(data); 
      setIsLoadingHotWaterSchedule(false); });
  }, []);

  var turnOn =() => {
    fetch('http://localhost:3000/on', { method: "POST" });
  }

  var turnOff =() => {
    fetch('http://localhost:3000/off', { method: "POST" });
  }

  var outdoorTemperatureChart = <LineChart
    style={{ width: '100%', maxWidth: '1200px', height: '100%', maxHeight: '30vh', aspectRatio: 1.618 }}
    responsive
    data={outdoorTemperatures}
    margin={{
      top: 5,
      right: 0,
      left: 0,
      bottom: 5,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="hour" />
    <YAxis width="auto" />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
    <ReferenceLine strokeDasharray="3 3" x={parseInt(currentHour)} stroke="red" />                 
  </LineChart>;

  var heatingSlots: [] = [];
  
  if(!isLoadingHeatingSchedule) {
    heatingSlots = heatingSchedule.map((x) =>{ return { hour: x.hour, temperature: x.targetTemperature, show: true }; });
  }

  var hotWaterSlots = [];
  
  if(!isLoadingHotWaterSchedule) {
    hotWaterSlots = hotWaterSchedule.map((x) =>{ return { hour: x.hour, show: x.on }; });
  }

  var systemModeLabel = systemMode == 0 ? <span className="badge bg-danger" onClick={turnOn}>OFF</span> : <span onClick={turnOff} className="badge bg-success">HEATING</span>;

  var handleChange = (event) => {
    setCurrentHour(event.target.value);
  };

  return (
    <div>
      <h1>28th November 2024 - {currentHour}:00</h1>
      <hr />
      
      <div className="card">
  <div className="card-header">
    Status
  </div>
  <div className="card-body">
    <h2 style={{display:'inline', cursor: 'pointer'}}>
    {systemModeLabel}
    </h2>

    {systemMode == 4 && <>
      <h2 style={{display:'inline'}}><span className="badge bg-primary">Target: {targetTemperature}°C</span></h2>
      {/* <h2 style={{display:'inline'}}><span className="badge bg-primary">Flow Temperature: 33°C</span></h2> */}
      </>
    }

    <h2 style={{display:'inline'}}><span className="badge bg-primary">{Math.floor(currentPower/1000)}W</span></h2>
  </div>
</div>

<div className="card">
  <div className="card-header">
    Current Hour
  </div>
  <div className="card-body">
<input type="range" style={{width: '100%'}} value={currentHour} min="0" max="23" onChange={handleChange} />

  </div>
</div>

      <div className="card">
  <div className="card-header">
    Outdoor Temperature
  </div>
  <div className="card-body">
     {isLoadingOutdoorTemperature === false && <div>{outdoorTemperatureChart}</div>}
  </div>
</div>

<div className="card">
  <div className="card-header">
    Heating Schedule
  </div>
  <div className="card-body">
      <HourlySchedule transitions={heatingSlots} activeIndex={activeHeatingScheduleIndex} currentHour={currentHour} />
  </div>
</div>

<div className="card">
  <div className="card-header">
    Hot Water Schedule
  </div>
  <div className="card-body">
      <HourlySchedule transitions={hotWaterSlots} activeIndex={activeHotWaterScheduleIndex} currentHour={currentHour} />
  </div>
</div>
    </div>
  );
}
