# PotholePal STL

Report a St. Louis pothole in 15 seconds: snap a photo, pin the exact GPS spot,
and PotholePal figures out the county and routes your report to the right agency —
City of St. Louis, St. Louis County, or MoDOT.

Built with **Expo SDK 52 + React Native + TypeScript** and **expo-router**.
Runs on Android, iOS, and web.

## Why

Reporting a pothole in St. Louis is split across three agencies (by who owns the
road), and none has a real app — just long web forms and phone lines. PotholePal
does the parts people get stuck on: the photo, the exact location, the county, and
the routing — then hands you a finished report to send in one tap.

## Features

- **📷 Photo** of the pothole (camera or library).
- **📍 GPS → county** — one tap resolves your exact spot + address + county on-device.
- **Severity + details**, then smart **agency routing** (with a one-tap override for highways).
- **One-tap hand-off** — opens the agency form, dials the phone, or opens the spot in Maps,
  with a fully-composed report ready to send.
- **History** of your reports, **light/dark/system** theme, screen-reader accessible.

## Honest scope

PotholePal is a reporting **assistant**, not a submit pipe. MoDOT's form is
CAPTCHA-protected with no public API, and the City/County have no API — so no app
can legitimately auto-file. PotholePal does the capture/locate/route/compose work and
you tap the final send. The app says so in Settings. Not affiliated with any agency.

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

## Data sources

- MoDOT Report a Road Concern: https://www.modot.org/report-road-concern
- City of St. Louis pothole reporting (Citizens' Service Bureau)
- St. Louis County Transportation
