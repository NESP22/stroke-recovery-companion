# Real-device test checklist — iPhone & iPad (about 10 minutes)

For Craig's manual pass on real Apple hardware. The automated Playwright WebKit
suite (`npm run test:e2e`) covers most of this in a headless Safari engine; the
steps below confirm the things only a real device can show — notch / home
indicator safe areas, real VoiceOver, real Safari voices, and the manual
Add-to-Home-Screen flow.

Run the whole list once on an iPhone and once on an iPad, in Safari.

## Before you start

- The app must be reachable over **https** on the device (Cloudflare Pages). A
  local `http://` preview cannot be added to the Home Screen.
- Do the Home Screen steps first (they need an online first load), then the
  offline step last.

## Checklist

1. **Open the app in Safari.** Enter the deployed URL.
   PASS: within a couple of seconds the **red** "If you see new stroke signs,
   act FAST" emergency banner appears at the top, and below it the Home screen
   ("What would you like to do today?" and the "Start today's session" button).
   No blank screen, no error, no horizontal scrolling.

2. **First-run onboarding.** On a fresh device the app opens at "This is your
   recovery companion" instead of Home. Tap through: choose at least one goal,
   pick a session length / rest reminder / difficulty, answer "Who is this
   for?", and finish.
   PASS: every choice registers on the first tap, "Next" advances the flow, and
   you land on Home with your goal remembered.

3. **Navigate the main screens.** From Home, open two or three practice areas
   (for example Mood, Memory, Attention) and tap back to Home each time. Then
   open Settings and "My progress".
   PASS: every screen loads without a blank flash, the back link returns to
   Home, and nothing overlaps or clips.

4. **Rotate to landscape, then back.** Turn the device sideways on a module
   screen and on Home.
   PASS: the layout reflows to fill the screen, nothing is cut off, no
   horizontal scrollbar appears, and controls stay tappable.

5. **Safe areas.** Look at the top and bottom edges on a notched iPhone and on
   the iPad (either orientation).
   PASS: the red emergency banner starts **below** the notch / status bar, and
   the bottom buttons and text clear the home indicator and rounded corners —
   no content sits hidden underneath them.

6. **Tap targets.** On Home, tap the module cards and the smaller links
   (Settings, My progress). On Mood, tap the "When to get help" disclosures. On
   Research & evidence, tap the source citation links.
   PASS: every button and link is easy to hit first try — nothing feels cramped
   or needs a second, more precise tap.

7. **Text size.** Settings → Text size → "Extra large".
   PASS: all text grows noticeably, button labels stay fully visible (no clipped
   or overlapping words), and the page still fits with no horizontal scroll.
   Set it back to Standard afterwards.

8. **High contrast & reduced motion.** In Settings, toggle "High contrast
   colours" on, then "Reduce motion and animations" on.
   PASS: the high-contrast palette applies immediately and everything remains
   readable; animations calm down. Toggle both back off.

9. **Read-aloud (Settings → Read-aloud).** Tap "Preview voice", then "Stop
   preview", then try a slower and a faster speed.
   PASS: speech is intelligible, Stop stops it, and the speed change takes
   effect. If no local voice is ready, the picker says so instead of silently
   using a remote voice.

10. **Add to Home Screen.** Tap Share → "Add to Home Screen" → Add.
    PASS: the preview shows the green rounded-square icon with the white heart
    (not a generic page thumbnail), and a "Stroke Recovery" icon appears on the
    Home Screen.

11. **Launch from the Home Screen icon.** Tap the new icon.
    PASS: the app opens in its own window with no Safari address bar or toolbar
    (standalone mode). Opening Settings → "Install on the Home Screen" now
    confirms "You are already using the installed Home Screen version."

12. **Offline.** Reload once while online (so assets cache), then turn on
    Airplane Mode and reopen the app from the Home Screen icon.
    PASS: the app still opens and shows the Home screen. (Data lives only on the
    device; the app never presents it as guaranteed permanent storage.)

## What a "pass" means overall

All 12 steps pass on both devices, in both orientations where noted. Any step
that fails should be filed with the device model + iOS version + what you saw,
and — if it is reproducible in WebKit — the automated suite should be extended
to cover it.
