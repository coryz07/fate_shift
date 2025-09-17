import React, { useState } from 'react';
import { LifePathScreen } from './screens/LifePathScreen';

function App() {
  const [birthDate, setBirthDate] = useState('');
  return (
    <div>
      <h1>Forensic Astro Chart Reader</h1>
      <label>
        Enter Date of Birth:&nbsp;
        <input
          type="date"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
        />
      </label>
      {birthDate && <LifePathScreen dateISO={birthDate} />}
    </div>
  );
}

export default App;