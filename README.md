# HazardHub STL

Report a St. Louis road hazard in 15 seconds: snap a photo, pin the exact GPS spot,
and HazardHub figures out the county and routes your report to the right agency —
City of St. Louis, St. Louis County, or MoDOT. Covers **14 hazard and incident
types**: potholes, fallen trees, flooding, dead animals, signal/light failures, downed
signs, debris, sidewalk damage, storm/ice, and time-sensitive incidents — accidents,
disabled vehicles, road closures, and downed power lines. Saved reports plot on an
interactive **hazard map**.

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

- **🧭 14 hazard & incident types** — maintenance hazards (pothole, tree, flooding,
  dead animal, signal/light, sign, debris, sidewalk, storm/ice) and time-sensitive
  incidents (accident, disabled vehicle, road closure, downed power line).
- **🚨 Life-safety handling** — accidents and downed power lines show a safety banner
  and a one-tap **Call 911** button. The app is explicit that it does *not* dispatch help.
- **🤖 On-device AI suggestion** — after a photo, a **Teachable Machine** model you
  train runs on-device (TensorFlow.js) and *suggests* the hazard type with a
  confidence score. It's a suggestion you can override, not a general detector —
  the app says so, and falls back to manual pick when it isn't confident.
- **📷 Photo** of the hazard (camera or library).
- **📍 GPS → county** — one tap resolves your exact spot + address + county on-device.
- **Severity + details**, then smart **agency routing** (with a one-tap override for highways).
- **🗺️ Hazard map** — your located reports plotted as color-coded pins (red for urgent
  incidents) on an interactive map; auto-fits to your reports.
- **One-tap hand-off** — opens the agency form, dials the phone, or opens the spot in Maps,
  with a fully-composed report ready to send.
- **History** of your reports, **light/dark/system** theme, Inter typography, screen-reader accessible.

## Honest scope

HazardHub is a reporting **assistant**, not a submit pipe. MoDOT's report form is
CAPTCHA-protected with no public API, and the City/County have no API — so no app can
legitimately auto-file in St. Louis. (MoDOT's mobile app is read-only traveler info;
its one app-based pothole path, "Pothole CPR" via Waze, is Kansas City only.)
HazardHub does the capture/locate/route/compose work and you tap the final send. The
app says so in Settings. Not affiliated with any agency.

## Architecture

```
app/(tabs)/ index(report) | history | map (+ map.web) | settings
src/
  types/report.ts         domain model + 14 hazard/incident types (HAZARDS)
  data/
    agencies.ts           agency directory + county→agency routing
    location.ts           GPS fix + reverse-geocode to county (expo-location)
    report.ts             report-text composer + hand-off links
    classifier.ts         on-device Teachable Machine inference (TensorFlow.js)
    hazardLabels.ts       model-label → hazard-type mapping (unit-tested)
    storage.ts            AsyncStorage cache
  store/AppStore.tsx      settings (theme) + saved reports
  ui/ theme.tsx (Inter type scale) | components.tsx (icon buttons) | SplashLogo.tsx
metro.config.js           web-stubs react-native-maps (native-only) for the web build
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

## Train the AI model (Teachable Machine)

The AI suggestion runs a model **you** train — so it learns your actual hazard
classes (potholes, flooding, etc.), which a generic model can't recognize.

1. Go to <https://teachablemachine.withgoogle.com/train/image>.
2. Make one class per hazard, named so it maps (e.g. `Pothole`, `Flooding`,
   `Fallen tree`, `Accident`, `Power line`). The label→type mapping lives in
   `src/data/hazardLabels.ts`. Add ~30–50 example photos per class.
3. **Train Model**, then **Export Model → TensorFlow.js → Upload (shareable link)**.
   Copy the URL (`https://teachablemachine.withgoogle.com/models/XXXX/`).
4. In the app: **Settings → AI hazard suggestion → paste the model URL**.
5. Take a photo — the app downloads the model once, runs inference on-device with
   TensorFlow.js (pure-JS backend), and suggests a type with a confidence score.

It only knows the classes you trained and makes mistakes, so it is always a
suggestion the user can override — never an automatic classification.

## Data sources

- MoDOT Report a Road Concern: https://www.modot.org/report-road-concern
- City of St. Louis pothole reporting (Citizens' Service Bureau)
- St. Louis County Transportation
