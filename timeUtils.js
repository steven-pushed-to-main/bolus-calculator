function parseTime(timeString) {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
}

function isWithinTimeWindow(currentTime, start, end) {
  const currentTotal = currentTime.hour * 60 + currentTime.minute;
  const startTotal = start.hour * 60 + start.minute;
  const endTotal = end.hour * 60 + end.minute;

  if (startTotal < endTotal) {
    return currentTotal >= startTotal && currentTotal < endTotal;
  } else if (startTotal > endTotal) {
    return currentTotal >= startTotal || currentTotal < endTotal;
  } else {
    return true;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseTime, isWithinTimeWindow };
}
