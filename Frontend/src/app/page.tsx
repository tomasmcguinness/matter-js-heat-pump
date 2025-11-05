'use client';

import { Manager } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { HourlySchedule } from './hourlySchedule.tsx';

export default function Home() {

  const [isLoadingOutdoorTemperature, setIsLoadingOutdoorTemperature] = useState(true);
  const [outdoorTemperatures, setOutdoorTemperatures] = useState<OutdoorTemperature[]>(null);

  const [isLoadingHeatingSchedule, setIsLoadingHeatingSchedule] = useState(true);
  const [heatingSchedule, setHeatingSchedule] = useState<Transition[]>(null);

  const [isLoadingHotWaterSchedule, setIsLoadingHotWaterSchedule] = useState(true);
  const [hotWaterSchedule, setHotWaterSchedule] = useState<Transition[]>(null);

  const [systemMode, setSystemMode] = useState<number>(0);

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

    socket.on("systemModeChanged", (state) => {
      console.log("systemMode: " + state);
      setSystemMode(state);
    });

  }, []);

   useEffect(() => {
    fetch('http://localhost:3000/status').then(r => r.json()).then(data => { 
      setSystemMode(data.systemMode); 
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

  var outdoorTemperatureChart = <LineChart
    style={{ width: '100%', maxWidth: '1200px', height: '100%', maxHeight: '40vh', aspectRatio: 1.618 }}
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
    <XAxis dataKey="time" />
    <YAxis width="auto" />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
  </LineChart>;

  var heatingSlots = [];
  
  if(!isLoadingHeatingSchedule) {
    heatingSlots = heatingSchedule.map((x) =>{ return { hour: x.hour, temperature: x.targetTemperature, show: true }; });
  }

  var hotWaterSlots = [];
  
  if(!isLoadingHotWaterSchedule) {
    hotWaterSlots = hotWaterSchedule.map((x) =>{ return { hour: x.hour, show: x.on }; });
  }

  var systemModeLabel = systemMode == 0 ? <h2 style={{display:'inline'}}><span className="badge bg-danger">OFF</span></h2> : <h2 style={{display:'inline'}}><span className="badge bg-success">HEATING</span></h2>;

  return (
    <div>
      <h1>28th November 2024</h1>
      <hr />
      
      <div className="card">
  <div className="card-header">
    Status
  </div>
  <div className="card-body">
    {systemModeLabel}

    {systemMode == 4 && <>
      <h2 style={{display:'inline'}}><span className="badge bg-primary">Target: 21°C</span></h2>
      <h2 style={{display:'inline'}}><span className="badge bg-primary">Flow Temperature: 33°C</span></h2>
      <h2 style={{display:'inline'}}><span className="badge bg-primary">Power: 100W°C</span></h2>
      </>
    }
  </div>
</div>

<input type="range" style={{width: '100%', marginBottom: '20px'}} value={0} min={0} max={24} />

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
      <HourlySchedule transitions={heatingSlots} />
  </div>
</div>

<div className="card">
  <div className="card-header">
    Hot Water Schedule
  </div>
  <div className="card-body">
      <HourlySchedule transitions={hotWaterSlots} />
  </div>
</div>
    </div>
  );
}
