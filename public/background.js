let settings = {
  focusMinutes: 25,
  breakMinutes: 5,
  autoStartBreak: true,
  autoStartFocus: true,
};

const ext = self.chrome ?? self.browser;

let state = {
  timeLeft: settings.focusMinutes * 60,
  isRunning: false,
  isFocus: true,
  lastUpdate: Date.now(),
};

ext.storage.local.get(
  ["focusMinutes", "breakMinutes", "autoStartBreak", "autoStartFocus"],
  (data) => {
    settings = { ...settings, ...data };
  }
);

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
      ? settings.focusMinutes * 60
      : settings.breakMinutes * 60;

    state.isRunning = state.isFocus
      ? settings.autoStartFocus
      : settings.autoStartBreak;
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
      sendResponse({ ok: true });
      break;

    case "PAUSE":
      state.isRunning = false;
      persist();
      sendResponse({ ok: true });
      break;

    case "RESET":
      state.isRunning = false;
      state.isFocus = true;
      state.timeLeft = settings.focusMinutes * 60;
      state.lastUpdate = Date.now();
      persist();
      sendResponse({ ok: true });
      break;

    case "GET_STATE":
      sendResponse(state);
      break;
  }

  return true;
});
