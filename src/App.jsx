import { useEffect, useRef, useState } from "react";
import './App.css'

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const ext = globalThis.chrome ?? globalThis.browser;

if (!ext?.storage?.local) {
  console.error("Extension storage API not available");
}

const storage = ext?.storage?.local;

function storageGet(keys) {
  return new Promise((resolve) => {
    try {
      const result = storage.get(keys);

      if (result instanceof Promise) {
        result.then(resolve);
      } else {
        storage.get(keys, resolve);
      }
    } catch {
      resolve({});
    }
  });
}

function storageSet(data) {
  return new Promise((resolve) => {
    try {
      const result = storage.set(data);

      if (result instanceof Promise) {
        result.then(resolve);
      } else {
        storage.set(data, resolve);
      }
    } catch {
      resolve();
    }
  });
}

export default function App() {
  const [time, setTime] = useState(FOCUS_TIME);
  const [running, setRunning] = useState(false);
  const [focus, setFocus] = useState(true);

  const intervalRef = useRef(null);
  useEffect(() => {
    if (!storage) return;

    storageGet(["timeLeft", "isRunning", "isFocus", "lastUpdated"]).then(
      (data) => {
        if (!data?.lastUpdated) return;

        let newTime = data.timeLeft ?? FOCUS_TIME;

        if (data.isRunning) {
          const elapsed =
            Math.floor((Date.now() - data.lastUpdated) / 1000);
          newTime = Math.max(newTime - elapsed, 0);
        }

        setTime(newTime);
        setRunning(Boolean(data.isRunning));
        setFocus(Boolean(data.isFocus));
      }
    );
  }, []);

  useEffect(() => {
    if (!storage) return;

    storageSet({
      timeLeft: time,
      isRunning: running,
      isFocus: focus,
      lastUpdated: Date.now()
    });
  }, [time, running, focus]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          const nextFocus = !focus;
          setFocus(nextFocus);
          return nextFocus ? FOCUS_TIME : BREAK_TIME;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
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
          setTime(FOCUS_TIME);
        }}>Reset</button>
      </div>

      <p className='mode'>{focus ? "Focus Timer" : "Break Time"}</p>
    </div>
  )
}
