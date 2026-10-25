/** Core types for PotholePal — capture + route a pothole report. */

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

export interface PotholeReport {
  id: string;
  createdAt: number;
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
