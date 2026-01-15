const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const ext = self.chrome ?? self.browser;

let state = {
  timeLeft: FOCUS_TIME,
  isRunning: false,
  isFocus: true,
  lastUpdate: Date.now()
};

ext.storage.local.get(null, (data) => {
  if (data?.timeLeft !== undefined) {
    state = { ...state, ...data };
  }
});

function persist() {
  ext.storage.local.set(state);
}

function updateTime() {
  if (!state.isRunning) return;

  const now = Date.now();
  const elapsed = Math.floor((now - state.lastUpdate) / 1000);

  if (elapsed <= 0) return;

  state.lastUpdate = now;
  state.timeLeft -= elapsed;

  if (state.timeLeft <= 0) {
    state.isFocus = !state.isFocus;
    state.timeLeft = state.isFocus
      ? FOCUS_TIME
      : BREAK_TIME;
  }

  persist();
}

ext.alarms.onAlarm.addListener(updateTime);

ext.runtime.onMessage.addListener((msg, _, sendResponse) => {
  updateTime();

  switch (msg.type) {
    case "START":
      state.isRunning = true;
      state.lastUpdate = Date.now();
      ext.alarms.create("wake", { periodInMinutes: 1 });
      persist();
      break;

    case "PAUSE":
      state.isRunning = false;
      persist();
      break;

    case "RESET":
      state.isRunning = false;
      state.isFocus = true;
      state.timeLeft = FOCUS_TIME;
      state.lastUpdate = Date.now();
      persist();
      break;

    case "GET_STATE":
      sendResponse(state);
      break;
  }

  return true;
});
