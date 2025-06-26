

function filterDataByTool(predictionData, changelogData, selectedToolSequence) {
  const scatterPoints = Object.entries(predictionData.cycles).map(
    ([epochTime, cycle]) => ({
      x: parseInt(epochTime),
      y: cycle.data[selectedToolSequence]?.distance,
      anomaly: cycle.data[selectedToolSequence]?.anomaly,
      cycleId: epochTime,
    })
  );

  const learnedParams =
    changelogData?.Result?.[0]?.learned_parameters?.[selectedToolSequence];
  const configParams =
    changelogData?.Result?.[0]?.config_parameters?.sequence?.[
      selectedToolSequence
    ];

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
