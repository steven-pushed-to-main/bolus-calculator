const { parseTime, isWithinTimeWindow } = require('../timeUtils');

describe('isWithinTimeWindow', () => {
  test('normal interval returns true when within range', () => {
    const current = parseTime('09:00');
    const start = parseTime('08:00');
    const end = parseTime('10:00');
    expect(isWithinTimeWindow(current, start, end)).toBe(true);
  });

  test('normal interval returns false when outside range', () => {
    const current = parseTime('07:59');
    const start = parseTime('08:00');
    const end = parseTime('10:00');
    expect(isWithinTimeWindow(current, start, end)).toBe(false);
  });

  test('cross midnight: before midnight', () => {
    const current = parseTime('23:00');
    const start = parseTime('22:00');
    const end = parseTime('02:00');
    expect(isWithinTimeWindow(current, start, end)).toBe(true);
  });

  test('cross midnight: after midnight', () => {
    const current = parseTime('01:00');
    const start = parseTime('22:00');
    const end = parseTime('02:00');
    expect(isWithinTimeWindow(current, start, end)).toBe(true);
  });

  test('cross midnight: outside interval', () => {
    const current = parseTime('21:00');
    const start = parseTime('22:00');
    const end = parseTime('02:00');
    expect(isWithinTimeWindow(current, start, end)).toBe(false);
  });

  test('full day schedule when start equals end', () => {
    const current = parseTime('12:00');
    const start = parseTime('00:00');
    const end = parseTime('00:00');
    expect(isWithinTimeWindow(current, start, end)).toBe(true);
  });
});
