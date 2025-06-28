// This function filters and prepares data for a scatter plot based on a selected tool sequence.
// It combines information from prediction and changelog data.
function filterDataByTool(predictionData, changelogData, selectedToolSequence) {
  const scatterPoints = Object.entries(predictionData.cycles).map(
    ([epochTime, cycle]) => ({
      x: parseInt(epochTime),
      y: cycle.data[selectedToolSequence]?.distance,
      anomaly: cycle.data[selectedToolSequence]?.anomaly,
      cycleId: cycle.cycle_log_id,
    })
  );

  // Get learned parameters (like threshold and ideal signal) for the selected tool from the changelog.
  const learnedParams =
    changelogData?.Result?.[0]?.learned_parameters?.[selectedToolSequence];
  const configParams =
    changelogData?.Result?.[0]?.config_parameters?.sequence?.[
      selectedToolSequence
    ];

  // Return a structured object containing all the data needed for the scatter plot and related graphs.

  return {
    scatterData: scatterPoints,
    threshold: learnedParams?.threshold || null,
    idealSignal: learnedParams?.average_list || [],
    validationLimits: {
      minPoints: configParams?.min_points ?? null,
      maxPoints: configParams?.max_points ?? null,
    },
  };
}

export default filterDataByTool;
