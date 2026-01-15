import { useEffect, useState } from 'react'
import './App.css'

const FOKUS = 25 * 60;
const BREAK = 5 * 60;

function App() {
  const [time, setTime] = useState(FOKUS)
  const [running, setRunning] = useState(false);
  const [focus, setFocus] = useState(true);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          setFocus((f) => !f);
          return focus ? BREAK : FOKUS;
        }
        return t - 1;
      })
    }, 1000);

    return () => clearInterval(id);
  }, [running, focus]);

  const min = Math.floor(time / 60);
  const sec = time % 60;

  return (
    <div className='container'>
      <h1>FOKUSS</h1>

      <div className='timer'>
        {min}:{sec.toString().padStart(2, "0")}
      </div>

      <div className='buttons'>
        <button onClick={() => setRunning(true)}>Start</button>
        <button onClick={() => setRunning(false)}>Pause</button>
        <button onClick={() => {
          setRunning(false);
          setFocus(true);
          setTime(FOKUS);
        }}>Reset</button>
      </div>

      <p className='mode'>{focus ? "Focus Timer" : "Break Time"}</p>
    </div>
  )
}

export default App
