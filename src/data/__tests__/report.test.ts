import type { PotholeReport } from '@/types/report';
import { composeReportText, mapsLink, telLink, mailtoLink, formLink } from '../report';

const base: PotholeReport = {
  id: 'r1',
  createdAt: Date.parse('2026-10-25T12:00:00Z'),
  location: { latitude: 38.627, longitude: -90.1994 },
  address: '1301 Olive St, St. Louis, MO 63103',
  city: 'St. Louis',
  county: 'St. Louis City',
  severity: 'large',
  note: 'Right lane, by the light',
  target: 'stlouis_city',
  status: 'handed_off',
};

describe('composeReportText', () => {
  const txt = composeReportText(base);
  it('includes coordinates, county, severity, and note', () => {
    expect(txt).toContain('38.627000, -90.199400');
    expect(txt).toContain('County: St. Louis City');
    expect(txt).toContain('Large');
    expect(txt).toContain('Right lane, by the light');
  });
});

describe('hand-off links', () => {
  it('maps link points at the coordinates', () => {
    expect(mapsLink(base)).toContain('38.627,-90.1994');
  });
  it('tel link uses the routed agency phone', () => {
    expect(telLink(base)).toBe('tel:3146224800');
  });
  it('mailto embeds the subject + body', () => {
    const m = mailtoLink(base);
    expect(m.startsWith('mailto:')).toBe(true);
    expect(m).toContain('subject=');
    expect(m).toContain('County');
  });
  it('city has a form url, county does not', () => {
    expect(formLink(base)).toContain('stlouis-mo.gov');
    expect(formLink({ ...base, target: 'stlouis_county' })).toBeUndefined();
  });
});
