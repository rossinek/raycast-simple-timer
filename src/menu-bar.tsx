import { Icon, MenuBarExtra } from "@raycast/api";
import { useEffect } from "react";
import { setMenuBarActive } from "./utils/timer";
import useTimers from "./utils/useTimers";

export default () => {
  const { timeLeft, timeLeftWithSeconds, isLoading, refreshTimers, handleStartTimer, handleStopTimer } = useTimers();

  useEffect(() => {
    setMenuBarActive();
    refreshTimers();
    if (timeLeftWithSeconds) {
      const interval = setInterval(() => {
        refreshTimers();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeftWithSeconds]);

  return (
    <MenuBarExtra icon={Icon.Hourglass} isLoading={isLoading} title={timeLeft || undefined}>
      {timeLeftWithSeconds ? (
        <>
          <MenuBarExtra.Item title="Stop timer" onAction={() => handleStopTimer()} />
          <MenuBarExtra.Item title={timeLeftWithSeconds} />
        </>
      ) : (
        <>
          {["0:05", "0:10", "0:15", "0:20", "0:30", "0:45", "1:00"].map((timeInput) => (
            <MenuBarExtra.Item title={timeInput} key={timeInput} onAction={() => handleStartTimer(timeInput)} />
          ))}
        </>
      )}
    </MenuBarExtra>
  );
};
