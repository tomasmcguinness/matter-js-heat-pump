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
  </div>
</div>

<div className="card">
  <div className="card-header">
    Weather Compensation
  </div>
  <div className="card-body">
  </div>
</div>

<button className="btn btn-primary">Save Changes</button>
    </div>
  );
}
