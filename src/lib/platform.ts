export type AppleDeviceSignals = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
};

export function isAppleTouchDevice(signals: AppleDeviceSignals): boolean {
  const { userAgent, platform, maxTouchPoints } = signals;
  return /iPad|iPhone|iPod/i.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function isStandaloneMode(
  displayModeMatches: boolean,
  navigatorStandalone: boolean,
): boolean {
  return displayModeMatches || navigatorStandalone;
}

export function getPlatformState() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return {
    appleTouch: isAppleTouchDevice({
      userAgent: nav.userAgent,
      platform: nav.platform,
      maxTouchPoints: nav.maxTouchPoints ?? 0,
    }),
    standalone: isStandaloneMode(
      window.matchMedia('(display-mode: standalone)').matches,
      Boolean(nav.standalone),
    ),
  };
}
