// js/timer.js
// Prosty odliczający timer sekundowy, identyczny w działaniu z oryginalnym
// setInterval w kodzie źródłowym, tylko wydzielony do osobnego modułu.

export function createTimer({ onTick, onExpire }) {
  let timeLeft = 0;
  let intervalId = null;

  return {
    start(seconds) {
      clearInterval(intervalId);
      timeLeft = seconds;
      onTick(timeLeft);
      intervalId = setInterval(() => {
        timeLeft--;
        onTick(timeLeft);
        if (timeLeft <= 0) {
          onExpire();
        }
      }, 1000);
    },
    stop() {
      clearInterval(intervalId);
    },
    get remaining() {
      return timeLeft;
    },
  };
}
