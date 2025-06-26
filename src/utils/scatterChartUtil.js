export const generateXTicks = (startEpoch, endEpoch) => {
  const ticks = [];
  const oneWeek = 7 * 24 * 60 * 60; 
  let tick = Math.ceil(startEpoch / oneWeek) * oneWeek;

  while (tick <= endEpoch) {
    ticks.push(tick);
    tick += oneWeek;
  }

  return ticks;
};

export const generateYTicks = (maxY) => {
  const ticks = [];
  const step = 200;
  for (let i = 0; i <= maxY + step; i += step) {
    ticks.push(i);
  }
  return ticks;
};