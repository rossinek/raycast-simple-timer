import { closeMainWindow, launchCommand, LaunchType } from "@raycast/api";
import { stopTimer } from "./utils/timer";

export default async () => {
  await closeMainWindow();
  stopTimer();
  launchCommand({ name: "menu-bar", type: LaunchType.Background });
};
