# PotholePal STL — Congressional App Challenge Submission

## What is your app and what does it do?

**PotholePal STL** turns reporting a pothole from a frustrating chore into a
15-second task. Point your phone at the pothole, take a photo, and tap "Use my
location" — the app pins the exact GPS spot, figures out which county you're in,
and routes your report to the right agency (the City of St. Louis, St. Louis
County, or MoDOT for state highways). Then it hands you a fully-written report and
opens the agency's form, phone, or map so you can send it in one tap.

## What problem does it solve, and why does it matter?

Potholes wreck tires, bend rims, and cause crashes — and in St. Louis, reporting
one is weirdly hard. The responsibility is split across three agencies depending on
who owns the road, and none of them has a real mobile app:

- **MoDOT** (state highways) takes reports through a long web form with a CAPTCHA, or a phone line.
- **The City of St. Louis** uses its Citizens' Service Bureau (web form + phone).
- **St. Louis County** uses a separate phone line.

So a resident who hits a pothole has to figure out *which* of three agencies owns
that stretch of road, find the right form, and type in a location they're trying to
describe from memory. Most people just don't — and the pothole stays. PotholePal
removes every one of those friction points: the photo, the exact location, the
county, and the routing are all done for you.

## How does it work? (technical summary)

PotholePal is built with **React Native, Expo (SDK 52), and TypeScript** — one
codebase for Android, iOS, and web.

- **Camera + GPS capture.** `expo-image-picker` for the photo; `expo-location` for a
  GPS fix (with a timeout and last-known-position fallback).
- **On-device county resolution.** It reverse-geocodes the GPS point to a street
  address, city, and **county** entirely on-device (no API key) — and the county is
  what drives agency routing and fills MoDOT's required county field.
- **Agency routing.** A small rules layer maps the resolved city/county to the right
  agency, with a one-tap override because highways cross every jurisdiction. Each
  option explains what it covers.
- **Report composer + hand-off.** It formats a complete report (coordinates,
  address, county, severity, note) and opens the agency's web form, a `tel:` call, or
  the exact spot in Maps. Every report is saved to a local **History** list.
- **Accessible, themed, offline-tolerant.** Screen-reader labels and selected-state
  on every control, a light / dark / **system** theme, and AsyncStorage-persisted
  history and settings.

## An honest note on "reporting"

PotholePal does **not** silently submit on your behalf — and that's deliberate, not a
shortcut. MoDOT's form is CAPTCHA-protected with no public API, and the City/County
have no API either, so there is no legitimate way for an app to auto-file a report.
Pretending to would be dishonest and could leave someone thinking a hazard was
reported when it wasn't. Instead, PotholePal does the hard 90% — capture, locate,
route, and compose — and hands the final send to you with everything ready. The app
says exactly this in Settings.

## What was the hardest part, and what did I learn?

The hardest part was the **routing honesty**. My first instinct was "an app that
reports potholes." But I learned road ownership in St. Louis is genuinely split three
ways, and that there's no API to submit through — so the honest, useful thing wasn't
a fake submit button, it was an *assistant* that eliminates the parts people actually
get stuck on (which agency? what's the exact location? what county?) and then gets
out of the way. I learned that a good civic app often means being honest about the
seams between systems rather than hiding them.

## What would I add next?

- A roads dataset so routing is exact per-street, not just per-county.
- Status follow-up (store the agency's confirmation number, remind to re-check).
- Other road hazards: downed signs, broken lights, flooding, missing curb cuts
  (an accessibility angle).

---

*Built with React Native / Expo / TypeScript. A community reporting assistant, not
affiliated with MoDOT or the City/County of St. Louis. Original work created during
the 2025–2026 CAC eligibility window. Runs on Android, iOS, and web.*
