# Apple iPhone / iPad platform decisions

**Research date:** 20 September 2026.

iPhone and iPad are the reference devices for v0.1. The platform research found
that a Cloudflare-hosted installable PWA is sufficient for the MVP; native
Swift/SwiftUI is not required for the current feature set.

## What the MVP implements

- Safari/Home Screen PWA with manifest and Apple touch icon.
- `viewport-fit=cover` plus safe-area insets for notches and screen edges.
- Touch targets of at least 44 × 44 CSS pixels for primary controls.
- Scalable text; pinch zoom is not disabled.
- VoiceOver-friendly semantic HTML and keyboard focus.
- Reduced-motion support.
- Portrait iPhone plus portrait/landscape iPad responsive layouts.
- Browser `SpeechSynthesis` read-aloud where available.
- Local-first browser storage; no server-side PHI datastore.
- An in-app Safari **Share → Add to Home Screen** guide.

## Important limitations

Home Screen installation on iPhone/iPad is manual. The app must not claim there
is an automatic iOS install prompt. Web Push is possible only for installed web
apps on supported iOS/iPadOS versions and needs server-side subscription
handling, so push reminders are intentionally not part of v0.1.
Programmatic Web Speech recognition is not treated as reliable for an iOS Home
Screen web app. For v0.1, users can use the standard iOS keyboard microphone
where text fields are present. Native on-device dictation would be a future
Swift/SwiftUI capability if it becomes a core requirement.

Installed Home Screen use is the preferred Apple experience for offline use and
local persistence. Browser storage can still be cleared by the user or the OS,
so the app never presents local storage as guaranteed permanent medical-record
storage.

## Primary sources

- WebKit: Web Push for Web Apps on iOS and iPadOS  
  https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- Apple Developer: Accessibility  
  https://developer.apple.com/accessibility/
- W3C: Web Content Accessibility Guidelines (WCAG) 2.2  
  https://www.w3.org/TR/WCAG22/
- WebKit: Storage policy / website data behavior  
  https://webkit.org/blog/

## Product consequence

The PWA remains the MVP path. Native iOS is a later decision for capabilities
that genuinely require it, such as App Store distribution, programmatic
on-device dictation, or stronger native background guarantees. Unsupported
native behavior must be documented rather than simulated or claimed.
