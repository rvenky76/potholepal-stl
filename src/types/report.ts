/** Core types for HazardHub — capture + route a road-hazard report. */

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/** Which agency owns the road at a location (best-effort guess). */
export type Agency = 'modot' | 'stlouis_city' | 'stlouis_county' | 'unknown';

export interface AgencyTarget {
  agency: Agency;
  name: string;
  /** Web form to report a concern, if any. */
  formUrl?: string;
  /** Phone number (digits only for tel:), display form in `phoneDisplay`. */
  phone?: string;
  phoneDisplay?: string;
  /** Reporting email, if the agency takes emailed reports. */
  email?: string;
  /** Short note on what this agency covers. */
  covers: string;
}

export type Severity = 'small' | 'medium' | 'large';

/** Kinds of road hazard this app can report. All route to the same agencies. */
export type HazardType =
  | 'pothole'
  | 'tree'
  | 'flooding'
  | 'dead_animal'
  | 'signal'
  | 'sign'
  | 'debris'
  | 'other';

export interface HazardMeta {
  type: HazardType;
  /** Short label for the picker. */
  label: string;
  emoji: string;
  /** Noun used in the composed report title / subject, e.g. "Downed tree". */
  reportNoun: string;
  /** Placeholder detail prompt tuned to this hazard. */
  detailHint: string;
}

export const HAZARDS: Record<HazardType, HazardMeta> = {
  pothole: {
    type: 'pothole',
    label: 'Pothole',
    emoji: '\ud83d\udd73\ufe0f',
    reportNoun: 'Pothole',
    detailHint: 'Nearest intersection, lane, size\u2026',
  },
  tree: {
    type: 'tree',
    label: 'Tree / limb',
    emoji: '\ud83c\udf33',
    reportNoun: 'Fallen tree or limb in the roadway',
    detailHint: 'Is it blocking a lane? Which direction?',
  },
  flooding: {
    type: 'flooding',
    label: 'Flooding',
    emoji: '\ud83c\udf0a',
    reportNoun: 'Water / flooding over the roadway',
    detailHint: 'How deep? Is the road impassable?',
  },
  dead_animal: {
    type: 'dead_animal',
    label: 'Dead animal',
    emoji: '\ud83e\udd8c',
    reportNoun: 'Dead animal in or beside the roadway',
    detailHint: 'Which lane / shoulder? Large animal (deer)?',
  },
  signal: {
    type: 'signal',
    label: 'Signal / light',
    emoji: '\ud83d\udea6',
    reportNoun: 'Traffic signal or street light failure',
    detailHint: 'Signal dark? Flashing? Light out?',
  },
  sign: {
    type: 'sign',
    label: 'Sign down',
    emoji: '\ud83e\udea7',
    reportNoun: 'Damaged, missing, or knocked-down sign',
    detailHint: 'Stop sign? Which direction / intersection?',
  },
  debris: {
    type: 'debris',
    label: 'Debris',
    emoji: '\ud83e\uddf1',
    reportNoun: 'Debris / object in the roadway',
    detailHint: 'What is it? Blocking a lane?',
  },
  other: {
    type: 'other',
    label: 'Other',
    emoji: '\u26a0\ufe0f',
    reportNoun: 'Road hazard',
    detailHint: 'Describe the hazard and exact spot\u2026',
  },
};

export interface PotholeReport {
  id: string;
  createdAt: number;
  /** What kind of hazard this is. Defaults to pothole for older saved reports. */
  hazardType?: HazardType;
  /** Local file URI of the captured/selected photo, if any. */
  photoUri?: string;
  location: GeoPoint | null;
  /** Human address resolved from GPS, if available. */
  address?: string;
  /** County resolved from GPS (drives agency routing + the MoDOT form field). */
  county?: string;
  city?: string;
  severity: Severity;
  /** Free-text note / landmark the user adds. */
  note?: string;
  /** Agency this report was routed to. */
  target: Agency;
  /** Local status — this app hands off; it does not confirm agency receipt. */
  status: 'draft' | 'handed_off';
}
