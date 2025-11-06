'use client';

import { useState, useEffect } from 'react';

export default function Config() {

return (<div>
   <h1>Configuration</h1>
   <hr />
<div className="card">
  <div className="card-header">
    Heat Loss
  </div>
  <div className="card-body">
    <form>
      <div className="input-group mb-3">
        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"  />
        <span class="input-group-text" id="basic-addon2">°C</span>
      </div>
      <div className="input-group mb-3">
        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
        <span class="input-group-text" id="basic-addon2">kW</span>
      </div>
    </form>
  </div>
</div>

<div className="card">
  <div className="card-header">
    Weather Compensation
  </div>
  <div className="card-body">
     <form>
      <div className="input-group mb-3">
        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"  />
        <span class="input-group-text" id="basic-addon2">°C</span>
      </div>
      <div className="input-group mb-3">
        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
      </div>
    </form>
  </div>
</div>

<button className="btn btn-primary">Save Changes</button>
    </div>
  );
}
