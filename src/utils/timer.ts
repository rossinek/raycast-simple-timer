import { environment, getPreferenceValues, popToRoot, confirmAlert, LaunchType, showHUD } from "@raycast/api";
import { exec, execSync } from "child_process";
import { readdirSync, writeFileSync } from "fs";
import { extname } from "path";

const menubarDeeplink = `raycast://extensions/rosickey/${environment.extensionName}/menu-bar?launchType=${LaunchType.Background}`;

// valid time input formats:
// 1h 20m
// 1h 20min
// 1h
// 20min
// 20m
// 20
// 1:20
// :20
const timeInputToSeconds = (time: string) => {
  const re1 = /^\s*(\d+)h\s*(\d+)m(in)?\s*$/;
  const re1match = time.match(re1);
  if (re1match) {
    const [, hours, minutes] = re1match;
    return +hours * 60 * 60 + +minutes * 60;
  }
  const re2 = /^\s*(\d+)h\s*$/;
  const re2match = time.match(re2);
  if (re2match) {
    const [, hours] = re2match;
    return +hours * 60 * 60;
  }
  const re3 = /^\s*(\d+)(m?in)?\s*$/;
  const re3match = time.match(re3);
  if (re3match) {
    const [, minutes] = re3match;
    return +minutes * 60;
  }
  const re4 = /^\s*(\d+):(\d+)\s*$/;
  const re4match = time.match(re4);
  if (re4match) {
    const [, hours, minutes] = re4match;
    return +hours * 60 * 60 + +minutes * 60;
  }
  const re5 = /^\s*:(\d+)\s*$/;
  const re5match = time.match(re5);
  if (re5match) {
    const [, minutes] = re5match;
    return +minutes * 60;
  }
  const re6 = /^\s*(\d+):\s*$/;
  const re6match = time.match(re6);
  if (re6match) {
    const [, hours] = re6match;
    return +hours * 60 * 60;
  }
  return undefined;
};

const MENU_STATE_FILE = `${environment.supportPath}/menu-bar.enabled`;

export const setMenuBarActive = () => {
  writeFileSync(MENU_STATE_FILE, "");
};

export const formatTime = (timeInSeconds: number) => {
  const timeInMinutes = Math.ceil(timeInSeconds / 60);
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = timeInMinutes % 60;
  return [hours, `0${minutes}`.slice(-2)].join(":");
};

export const formatTimeLeft = (timeInMs: number) => {
  return formatTime(Math.floor(timeInMs / 1000));
};

export const formatTimeLeftWithSeconds = (timeInMs: number) => {
  const timeInSeconds = Math.ceil(timeInMs / 1000);
  const hours = Math.floor(timeInSeconds / (60 * 60));
  const minutes = Math.floor(timeInSeconds / 60) % 60;
  return [hours, `0${minutes}`.slice(-2), `0${timeInSeconds % 60}`.slice(-2)].join(":");
};

export function startTimer(timeInput?: string) {
  stopTimer();

  const prefs = getPreferenceValues();
  const timeInSeconds = timeInputToSeconds(timeInput || prefs.defaultTime);
  if (!timeInSeconds) {
    confirmAlert({ title: "Unable to parse time input.", primaryAction: { title: "OK" } });
    return;
  }

  const masterName = `${environment.supportPath}/${Date.now() + timeInSeconds * 1000}.timer`;
  writeFileSync(masterName, "");

  const selectedSoundPath = `${environment.assetsPath}/fluteRiff.wav`;
  const command = `sleep ${timeInSeconds} \\
    && if [ -f "${masterName}" ]; then \\
      if [ -f "${MENU_STATE_FILE}" ]; then rm "${MENU_STATE_FILE}"; open -g ${menubarDeeplink}; fi && \\
      open -g 'raycast://confetti' && \\
      afplay "${selectedSoundPath}" && \\
      rm "${masterName}";\\
    fi`;
  exec(command, (error, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
  });
  popToRoot();
  showHUD(
    `Timer is on: ${formatTime(timeInSeconds)} ⏳  →  ${new Date(
      Date.now() + timeInSeconds * 1000
    ).toLocaleTimeString()}`
  );
}

export function stopTimer() {
  readdirSync(environment.supportPath)
    .filter((file) => extname(file) === ".timer")
    .forEach((file) => {
      const filePath = `${environment.supportPath}/${file}`;
      execSync(
        `if [ -f "${filePath}" ]; then \\
          rm "${filePath}" && \\
          if [ -f "${MENU_STATE_FILE}" ]; then rm "${MENU_STATE_FILE}"; open -g ${menubarDeeplink}; fi; \\
        fi`
      );
    });
}

export const getActiveTimer = (): Date | undefined => {
  const files = readdirSync(environment.supportPath);
  const activeTimer = files.find((file) => extname(file) === ".timer");
  if (!activeTimer) return undefined;
  const timestamp = +activeTimer.split("/").slice(-1)[0].slice(0, -6);
  return new Date(timestamp);
};
