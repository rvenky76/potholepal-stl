# HazardHub STL

Report a St. Louis road hazard in 15 seconds: snap a photo, pin the exact GPS spot,
and HazardHub figures out the county and routes your report to the right agency —
City of St. Louis, St. Louis County, or MoDOT. Potholes, downed trees, flooding,
dead animals, signal/sign failures, debris, or anything else in the road.

Built with **Expo SDK 52 + React Native + TypeScript** and **expo-router**.
Runs on Android, iOS, and web.

## 📱 Install on Android

**[⬇️ Download the APK](https://expo.dev/accounts/budvenky/projects/potholepal-stl/builds/ed36ef41-3951-465d-bf76-28586a75fcb1)**

1. On your Android phone, open the link above and tap **Download** (or scan the QR
   code on that page with your phone's camera).
2. Open the downloaded `.apk` file. Android will warn that it's from an unknown
   source — tap **Settings → allow from this source** (or **Install anyway**), then
   go back and tap **Install**. This is normal for apps installed outside the Play
   Store.
3. Open **HazardHub** and allow **location** and **camera** access when prompted —
   the app needs them to pin the hazard and photograph it.

> Android only. iOS requires a signed build through the App Store / TestFlight,
> which isn't set up yet. On any device you can also try the web build
> (`npm run web`), though camera and GPS are limited in the browser.

## Why

Reporting a road hazard in St. Louis is split across three agencies (by who owns the
road), and none has a real app — just long web forms and phone lines. HazardHub
does the parts people get stuck on: the photo, the exact location, the county, and
the routing — then hands you a finished report to send in one tap. It started with
potholes (the most common complaint) and now covers any road hazard.

## Features

- **📷 Photo** of the hazard (camera or library).
- **📍 GPS → county** — one tap resolves your exact spot + address + county on-device.
- **Severity + details**, then smart **agency routing** (with a one-tap override for highways).
- **One-tap hand-off** — opens the agency form, dials the phone, or opens the spot in Maps,
  with a fully-composed report ready to send.
- **History** of your reports, **light/dark/system** theme, screen-reader accessible.

## Honest scope

HazardHub is a reporting **assistant**, not a submit pipe. MoDOT's report form is
CAPTCHA-protected with no public API, and the City/County have no API — so no app can
legitimately auto-file in St. Louis. (MoDOT's mobile app is read-only traveler info;
its one app-based pothole path, "Pothole CPR" via Waze, is Kansas City only.)
HazardHub does the capture/locate/route/compose work and you tap the final send. The
app says so in Settings. Not affiliated with any agency.

## Architecture

```
app/(tabs)/ index(report) | history | settings
src/
  types/report.ts         domain model
  data/
    agencies.ts           agency directory + county→agency routing
    location.ts           GPS fix + reverse-geocode to county (expo-location)
    report.ts             report-text composer + hand-off links
    storage.ts            AsyncStorage cache
  store/AppStore.tsx      settings (theme) + saved reports
  ui/ theme.tsx components.tsx
```

## Run it

```bash
npm install
npm run web        # browser preview (camera/GPS limited on web)
npm run android    # device/emulator — full camera + GPS
npm run typecheck
npm test
```

## Build an installable APK

```bash
./build-apk.sh     # pins Node 20, runs eas login/init/build -p android --profile preview
```

This runs an **EAS cloud build** (nothing is written to this folder). When it
finishes, EAS prints a build URL with a **Download** button + QR code — that's the
`.apk` end users install (see [Install on Android](#-install-on-android) above). List
past builds and their download links with `eas build:list --platform android`.

## Data sources

- MoDOT Report a Road Concern: https://www.modot.org/report-road-concern
- City of St. Louis pothole reporting (Citizens' Service Bureau)
- St. Louis County Transportation
