# HazardHub STL — Congressional App Challenge Submission

## What is your app and what does it do?

**HazardHub STL** turns reporting a road hazard from a frustrating chore into a
15-second task. Pick what you're reporting from **14 types** — maintenance hazards
(pothole, fallen tree, flooding, dead animal, signal/light failure, downed sign,
debris, sidewalk damage, storm/ice) or time-sensitive incidents (accident, disabled
vehicle, road closure, downed power line) — take a photo, and tap "Use my location."
The app pins the exact GPS spot, figures out which county you're in, and routes your
report to the right agency (the City of St. Louis, St. Louis County, or MoDOT for
state highways). Then it hands you a fully-written report and opens the agency's form,
phone, or map so you can send it in one tap. Your located reports also plot as
color-coded pins on an interactive **hazard map**. For life-safety cases — an accident
with injuries or a downed power line — the app shows a safety warning and a one-tap
**Call 911** button, and is explicit that it does not dispatch help itself. It started
as a pothole reporter (the single most common road complaint) and the same capture →
locate → route → compose flow now works for any road hazard or incident.

## What problem does it solve, and why does it matter?

Potholes wreck tires, bend rims, and cause crashes — and in St. Louis, reporting
one is weirdly hard. The responsibility is split across three agencies depending on
who owns the road, and none of them has a real mobile app:

- **MoDOT** (state highways) takes reports through a long web form with a CAPTCHA, or a phone line.
- **The City of St. Louis** uses its Citizens' Service Bureau (web form + phone).
- **St. Louis County** uses a separate phone line.

So a resident who hits a pothole has to figure out *which* of three agencies owns
that stretch of road, find the right form, and type in a location they're trying to
describe from memory. Most people just don't — and the pothole stays. HazardHub
removes every one of those friction points: the photo, the exact location, the
county, and the routing are all done for you.

## How does it work? (technical summary)

HazardHub is built with **React Native, Expo (SDK 52), and TypeScript** — one
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
- **Hazard map.** Saved reports with a location plot as color-coded markers on an
  interactive map (`react-native-maps` on device), auto-fitting to the reports; the
  web build falls back to a located-report list since that library is native-only.
- **Life-safety handling.** Accidents and downed power lines are flagged urgent — the
  app shows a safety banner and a one-tap **Call 911** button, and states plainly that
  it does not dispatch emergency help.
- **Accessible, themed, offline-tolerant.** Screen-reader labels and selected-state
  on every control, a light / dark / **system** theme with Inter typography, and
  AsyncStorage-persisted history and settings.

## An honest note on "reporting"

HazardHub does **not** silently submit on your behalf — and that's deliberate, not a
shortcut. MoDOT's report form is CAPTCHA-protected with no public API, and the
City/County have no API either, so there is no legitimate way for an app to auto-file a
report here. (MoDOT's own mobile app is read-only traveler info, and its one app-based
pothole path — "Pothole CPR" via Waze — is a Kansas City District program, not a
St. Louis one.) Pretending to auto-file would be dishonest and could leave someone
thinking a hazard was reported when it wasn't. Instead, HazardHub does the hard 90% —
capture, locate, route, and compose — and hands the final send to you with everything
ready. The app says exactly this in Settings.

## What was the hardest part, and what did I learn?

The hardest part was the **routing honesty**. My first instinct was "an app that
reports potholes." But I learned road ownership in St. Louis is genuinely split three
ways, and that there's no API to submit through — so the honest, useful thing wasn't
a fake submit button, it was an *assistant* that eliminates the parts people actually
get stuck on (which agency? what's the exact location? what county?) and then gets
out of the way. I learned that a good civic app often means being honest about the
seams between systems rather than hiding them.

## What would I add next?

- **On-device AI photo classification** — suggest the hazard type and a severity
  estimate from the photo (an honest *suggestion* the user can override).
- A roads dataset so routing is exact per-street, not just per-county.
- A shared backend so the hazard map becomes **community-wide** (today it shows your
  own reports), plus status follow-up and notifications to nearby users.
- A municipal dashboard for agencies to triage reports and measure response time.

These later phases need a server and real multi-user data, so today the map plots the
reports saved on *your* device — I've kept the app honest about that rather than
implying a city-wide live feed.

---

*Built with React Native / Expo / TypeScript. A community reporting assistant, not
affiliated with MoDOT or the City/County of St. Louis. Original work created during
the 2025–2026 CAC eligibility window. Runs on Android, iOS, and web.*
