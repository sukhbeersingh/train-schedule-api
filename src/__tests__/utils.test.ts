import { getDepartureSanitized } from '../utils';

describe('getDepartureSanitized', () => {
  it('returns null for an invalid departure time format', () => {
    expect(getDepartureSanitized('invalid-time')).toBeNull();
    expect(getDepartureSanitized('6am')).toBeNull(); // missing colon
    expect(getDepartureSanitized('11:00')).toBeNull(); // missing am/pm
    expect(getDepartureSanitized('13:00am')).toBeNull(); // invalid hour
    expect(getDepartureSanitized('13:00pm')).toBeNull(); // invalid hour
  });

  it('parses 24-hour format departure times correctly', () => {
    expect(getDepartureSanitized('0000')).toBe(0);
    expect(getDepartureSanitized('0800')).toBe(800);
    expect(getDepartureSanitized('1215')).toBe(1215);
    expect(getDepartureSanitized('1755')).toBe(1755);
    expect(getDepartureSanitized('2359')).toBe(2359);
  });

  it('converts 12-hour format departure times to 24-hour format', () => {
    expect(getDepartureSanitized('12:00am')).toBe(0);
    expect(getDepartureSanitized('1:00am')).toBe(100);
    expect(getDepartureSanitized('11:59am')).toBe(1159);
    expect(getDepartureSanitized('12:00pm')).toBe(1200);
    expect(getDepartureSanitized('1:00pm')).toBe(1300);
    expect(getDepartureSanitized('11:59pm')).toBe(2359);
  });
});
