import { launchCommand, LaunchType } from "@raycast/api";
import { useState } from "react";
import { formatTimeLeft, formatTimeLeftWithSeconds, getActiveTimer } from "./timer";

export default function useTimers() {
  const [activeTimer, setActiveTimer] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(activeTimer === undefined);

  const refreshTimers = () => {
    setActiveTimer(getActiveTimer());
    setIsLoading(false);
  };

  const handleStartTimer = (timeInput: string) => {
    launchCommand({ name: "start-timer", type: LaunchType.Background, arguments: { time: timeInput } });
  };

  const handleStopTimer = () => {
    launchCommand({ name: "stop-timer", type: LaunchType.Background });
  };

  const timeLeftMs = activeTimer ? +activeTimer - Date.now() : -1;
  const timeLeft = timeLeftMs >= 0 ? formatTimeLeft(timeLeftMs) : "";
  const timeLeftWithSeconds = timeLeftMs >= 0 ? formatTimeLeftWithSeconds(timeLeftMs) : "";

  return {
    timeLeft,
    timeLeftWithSeconds,
    isLoading,
    refreshTimers,
    handleStartTimer,
    handleStopTimer,
  };
}
