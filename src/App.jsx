import { useEffect, useState } from "react";
import './App.css';

const ext = globalThis.chrome ?? globalThis.browser;

export default function App() {
  const [state, setState] = useState({
    timeLeft: 0,
    isRunning: false,
    isFocus: true
  });

  async function fetchState() {
    try {
      const res = await ext.runtime.sendMessage({
        type: "GET_STATE"
      });
      if (res) setState(res);
    } catch (e) {
      console.warn("Background not ready yet");
    }
  }

  useEffect(() => {
    let ready = false;

    async function init() {
      try {
        await ext.runtime.sendMessage({ type: "GET_STATE" });
        ready = true;
        fetchState();
      } catch {
        setTimeout(init, 200);
      }
    }

    init();

    const id = setInterval(() => {
      if (ready) fetchState();
    }, 1000);

    return () => clearInterval(id);
  }, []);


  async function send(type) {
    try {
      await ext.runtime.sendMessage({ type });
      fetchState();
    } catch (e) {
      console.warn("Failed to send message:", type, e);
    }
  }

  const min = Math.floor(state.timeLeft / 60);
  const sec = state.timeLeft % 60;

  return (
    <div className='container'>
      <h1>FOKUSS</h1>

      <div className='timer'>
        {min}:{sec.toString().padStart(2, "0")}
      </div>

      <div className='buttons'>
        <button onClick={() => send("START")}>Start</button>
        <button onClick={() => send("PAUSE")}>Pause</button>
        <button onClick={() => send("RESET")}>Reset</button>
      </div>

      <p className='mode'>{state.isFocus ? "Focus Timer" : "Break Time"}</p>
    </div>
  );
}
