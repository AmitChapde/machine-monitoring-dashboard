
export function mapCycleData(response, selectedCycle) {
  if (
    !response?.Result?.data?.[selectedCycle]?.cycle_data ||
    Object.keys(response.Result.data[selectedCycle].cycle_data).length === 0
  ) {
    return [];
  }

  const signalName = Object.keys(
    response.Result.data[selectedCycle].cycle_data
  )[0];

  const rawData = response.Result.data[selectedCycle].cycle_data[signalName];

  return Object.entries(rawData).map(([time, value]) => ({
    x: parseFloat(time),
    y: value,
  }));
}
