import { useEffect, useRef, useState } from "react";

const IDLE_DELAY = 30_000;

const activityEvents: Array<keyof WindowEventMap> = [
  "mousedown",
  "pointerdown",
  "click",
  "keydown",
  "touchstart",
  "wheel",
  "scroll",
];

export function useIdleScreensaver() {
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const lastActivityRef = useRef(performance.now());
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const scheduleCheck = () => {
      const remaining =
        IDLE_DELAY - (performance.now() - lastActivityRef.current);
      timerRef.current = window.setTimeout(
        () => {
          if (performance.now() - lastActivityRef.current >= IDLE_DELAY) {
            activeRef.current = true;
            setActive(true);
          }
          scheduleCheck();
        },
        Math.max(remaining, 50),
      );
    };

    const markActivity = () => {
      lastActivityRef.current = performance.now();
      if (activeRef.current) {
        activeRef.current = false;
        setActive(false);
      }
    };

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, markActivity, {
        capture: true,
        passive: eventName !== "scroll",
      });
    }
    scheduleCheck();

    return () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, markActivity, { capture: true });
      }
    };
  }, []);

  return active;
}
