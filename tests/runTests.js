const fs = require('fs');
const path = require('path');

const results = [];

// simple expect implementation
function expect(received) {
  return {
    toBe(expected) {
      if (received !== expected) {
        throw new Error(`Expected ${expected} but received ${received}`);
      }
    }
  };
}

global.expect = expect;

global.describe = function(name, fn) { fn(); };

global.test = function(name, fn) {
  try {
    fn();
    results.push({ name, status: 'passed' });
  } catch (err) {
    results.push({ name, status: 'failed', error: err });
  }
};

// load test files
const testDir = path.join(__dirname);
fs.readdirSync(testDir).filter(f => f.endsWith('.test.js')).forEach(f => {
  require(path.join(testDir, f));
});

console.log('\nTest Results');
results.forEach(r => {
  const status = r.status === 'passed' ? '\u2714' : '\u2716';
  console.log(`${status} ${r.name}`);
  if (r.status === 'failed') {
    console.error(r.error);
  }
});

if (results.some(r => r.status === 'failed')) {
  process.exit(1);
}
