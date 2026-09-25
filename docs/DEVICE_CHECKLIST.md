# Device test checklist — iPhone & iPad (about 10 minutes)

For Craig's manual device pass. The automated Playwright WebKit suite
(`npm run test:e2e`) already checks most of this; the steps below confirm the
things only a real device can show — notch/home-indicator safe areas, real
VoiceOver, real Safari voices, and the manual Add-to-Home-Screen flow.

Run the full list once on an iPhone and once on an iPad, in Safari.

## Before you start

- The app must be reachable over https on the real device (Cloudflare Pages).
  A local http:// preview cannot be installed to the Home Screen.
- Do the Home Screen steps first (they need an online first load).

## Checklist

1. **Open the app in Safari.** Load the deployed URL.
   PASS: the app renders (green "act FAST" banner at top, "Welcome" or the
   Home screen), no blank screen, no horizontal scrolling.

2. **Add to Home Screen.** Tap Share → "Add to Home Screen" → Add.
   PASS: a "Stroke Recovery" icon appears on the Home Screen with the green
   heart icon (not a generic page thumbnail).

3. **Launch from the Home Screen icon.** Tap the new icon.
   PASS: the app opens in its own window with no Safari address bar or
   toolbar (standalone mode). The in-app Install screen confirms
   "already using the installed Home Screen version".

4. **Rotate to landscape, then back.** Turn the device sideways on both a
   module screen and the Home screen.
   PASS: layout reflows to fill the screen, nothing is cut off, no horizontal
   scrollbar, controls stay tappable.

5. **Safe areas.** Look at the very top and bottom edges on a notched iPhone
   and the iPad (any orientation).
   PASS: the red emergency banner starts below the notch/status bar; the
   bottom text/buttons clear the home indicator and rounded corners — no
   content hidden under them.

6. **Text size.** Settings → Text size → "Extra large".
   PASS: all text grows noticeably, buttons keep their labels fully visible
   (no clipped or overlapping words), and the page still fits with no
   horizontal scroll. Set it back to your preferred size.

7. **High contrast.** Settings → "High contrast colours".
   PASS: background turns black, text/buttons turn white/yellow, nothing
   becomes invisible. Toggle off again.

8. **Tap targets.** On the Home screen, tap the module cards and the smaller
   links (Settings, My progress). On Mood, tap the "When to get help"
   disclosures.
   PASS: every button/link is easy to hit first try — nothing feels cramped
   or needs a second tap.

9. **Read-aloud (Settings → Read-aloud).** Tap "Preview voice", then "Stop
   preview", then try the slower/faster speeds.
   PASS: speech is intelligible and natural; Stop stops it; leaving Settings
   stops speech. If no local voice is ready, the picker says so instead of
   silently falling back to a remote voice.

10. **VoiceOver.** Enable VoiceOver, swipe through the Home screen.
    PASS: headings, buttons, and the emergency banner are read in a sensible
    order with meaningful labels; the FAST warning is spoken early.

11. **Offline.** Reload once online (so assets cache), then turn on Airplane
    Mode and reopen the app from the Home Screen icon.
    PASS: the app still opens and shows the Home screen. (Data lives on the
    device; the OS may still clear it, which the app never presents as
    guaranteed permanent storage.)

12. **Onboarding sanity.** If the device starts at "Welcome", step through
    onboarding once (choose a goal, pick settings, finish).
    PASS: the flow advances smoothly, the chosen goal is remembered, and you
    land on Home.

## What a "pass" means overall

All 12 steps pass on both devices, in both orientations where noted. Any step
that fails should be filed with the device model + iOS version + what you saw,
and the automated suite extended to cover it if it is reproducible in WebKit.
