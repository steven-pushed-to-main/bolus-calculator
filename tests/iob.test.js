const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadCalculateIob() {
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const match = indexHtml.match(/function calculateIob\(logData, decayHours\) \{[\s\S]*?\n    \}/);

  if (!match) {
    throw new Error('Unable to locate calculateIob in index.html');
  }

  const context = {
    Date,
    calculateIob: null
  };

  vm.createContext(context);
  vm.runInContext(`${match[0]}\nthis.calculateIob = calculateIob;`, context);
  return context.calculateIob;
}

const calculateIob = loadCalculateIob();

describe('calculateIob', () => {
  test('includes a bolus logged right now at full value', () => {
    const now = Date.parse('2026-02-27T12:00:00.000Z');
    const originalNow = Date.now;
    Date.now = () => now;

    try {
      const iob = calculateIob([
        { timestamp: new Date(now).toISOString(), totalBolus: 7 }
      ], 4);

      expect(iob).toBe(7);
    } finally {
      Date.now = originalNow;
    }
  });

  test('excludes a bolus timestamped slightly in the future', () => {
    const now = Date.parse('2026-02-27T12:00:00.000Z');
    const originalNow = Date.now;
    Date.now = () => now;

    try {
      const iob = calculateIob([
        { timestamp: new Date(now + 1000).toISOString(), totalBolus: 7 }
      ], 4);

      expect(iob).toBe(0);
    } finally {
      Date.now = originalNow;
    }
  });

  test('excludes a bolus at the decay cutoff', () => {
    const now = Date.parse('2026-02-27T12:00:00.000Z');
    const originalNow = Date.now;
    Date.now = () => now;

    try {
      const iob = calculateIob([
        { timestamp: new Date(now - 4 * 60 * 60000).toISOString(), totalBolus: 7 }
      ], 4);

      expect(iob).toBe(0);
    } finally {
      Date.now = originalNow;
    }
  });
});
