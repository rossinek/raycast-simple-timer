import { closeMainWindow, launchCommand, LaunchType } from "@raycast/api";
import { startTimer } from "./utils/timer";

export default async (props: { arguments: { time: string } }) => {
  await closeMainWindow();
  startTimer(props.arguments.time);
  launchCommand({ name: "menu-bar", type: LaunchType.Background });
};
