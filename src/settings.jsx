import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const ext = globalThis.chrome ?? globalThis.browser;

function Settings() {
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [autoStartFocus, setAutoStartFocus] = useState(true);
    const [autoStartBreak, setAutoStartBreak] = useState(true);

    useEffect(() => {
        ext.storage.local.get(
            [
                "focusMinutes",
                "breakMinutes",
                "autoStartBreak",
                "autoStartFocus"
            ],
            (data) => {
                if (data.focusMinutes) setFocusMinutes(data.focusMinutes);
                if (data.breakMinutes) setBreakMinutes(data.breakMinutes);
                if (data.autoStartBreak !== undefined)
                    setAutoStartBreak(data.autoStartBreak);
                if (data.autoStartFocus !== undefined)
                    setAutoStartFocus(data.autoStartFocus);
            }
        );
    }, []);

    function save() {
        ext.storage.local.set({
            focusMinutes,
            breakMinutes,
            autoStartFocus,
            autoStartBreak
        });
        alert("Settings Saved!");
    }

    return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
            <h2>FOKUSS Settings</h2>

            <label>
                Focus duration (minutes)
                <br />
                <input
                    type="number"
                    min="1"
                    value={focusMinutes}
                    onChange={(e) => setFocusMinutes(+e.target.value)}
                />
            </label>

            <br /><br />

            <label>
                Break duration (minutes)
                <br />
                <input
                    type="number"
                    min="1"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(+e.target.value)}
                />
            </label>

            <br /><br />

            <label>
                <input
                    type="checkbox"
                    checked={autoStartBreak}
                    onChange={(e) => setAutoStartBreak(e.target.checked)}
                />
                Auto-start break
            </label>

            <br />

            <label>
                <input
                    type="checkbox"
                    checked={autoStartFocus}
                    onChange={(e) => setAutoStartFocus(e.target.checked)}
                />
                Auto-start focus
            </label>

            <br /><br />

            <button onClick={save}>Save</button>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Settings />);