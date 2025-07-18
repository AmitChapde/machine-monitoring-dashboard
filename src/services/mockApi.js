import axios from "axios";
import { isAfter, isBefore, parseISO } from "date-fns";

// This function fetches and filters changelogdata for a given machine.
export const getChangeLogData = async ({
  machine_id,
  limit,
  from_time,
  to_time,
}) => {
  try {
    const response = await axios.get(
      `/ScatterDataJSON/${machine_id}/changelog.json`
    );
    let result = response.data?.Result ?? [];

    const from = from_time ? parseISO(from_time) : null;
    const to = to_time ? parseISO(to_time) : null;

      // Find the configuration entry that contains the tool sequence map.
    const configEntry = result.find(
      (item) => item.config_parameters?.tool_sequence_map
    );

     // filter the results based on the provided time range
    if (from || to) {
      result = result.filter((item) => {
        const start = parseISO(item.start_time);
        const learned = parseISO(item.learned_time);

        const isValidFrom =
          !from || isAfter(start, from) || isAfter(learned, from);
        const isValidTo = !to || isBefore(start, to) || isBefore(learned, to);

        return isValidFrom && isValidTo;
      });
    }
    // Ensuring the configuration entry exists and is included in the result.
    if (configEntry && !result.includes(configEntry)) {
      result = [configEntry, ...result];
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return {
      ...response.data,
      Result: result,
    };
  } catch (error) {
    console.error("Error fetching changelog:", error);
    throw error;
  }
};

// This function fetches and filters prediction data.
export const getPredictionData = async ({ machine_id, from_time, to_time }) => {
  try {
    const response = await axios.get(
      `/ScatterDataJSON/${machine_id}/prediction_data.json`
    );

    const { Result } = response.data;
    if (!Result) throw new Error("No Result property in prediction_data.json");

    const { cycles, ...rest } = Result;
    if (!cycles) throw new Error("No cycles property in Result");

    const from = from_time ? parseISO(from_time) : null;
    const to = to_time ? parseISO(to_time) : null;

     // Filter cycles based on the time range.
    const filteredCycles = Object.entries(cycles).filter(
      ([epoch, cycleData]) => {
        const date = new Date(Number(epoch) * 1000);
        const validFrom = !from || isAfter(date, from);
        const validTo = !to || isBefore(date, to);
        return validFrom && validTo;
      }
    );

    const filteredCycleObject = Object.fromEntries(filteredCycles);
     // Return the data with filtered cycles.
    return {
      ...rest,
      cycles: filteredCycleObject,
    };
  } catch (error) {
    console.error("Error fetching prediction data:", error);
    throw error;
  }
};

// This function fetches time series data for a specific cycle
export const getCycleData = async ({
  machine_id,
  cyclelog_id,
  signal,
  anomalyType,
}) => {
  try {
    const response = await axios.get(
      `/ScatterDataJSON/${machine_id}/timeseries_cycledata_${anomalyType}.json`
    );  


    
     const cycleEntry = response.data?.Result?.data?.[cyclelog_id];
    if (!cycleEntry) {
      throw new Error(
        `Cycle log ID ${cyclelog_id} not found in time series data.`
      );
    }

    // Get the specific signal data from the cycle.
    const timeSeries = cycleEntry.cycle_data?.[signal];
    if (!timeSeries) {
      throw new Error(
        `Signal ${signal} not found for cyclelog_id ${cyclelog_id}.`
      );
    }
    console.log("Time series data:", timeSeries);
    return timeSeries;
  } catch (error) {
    console.error("Error fetching time series data:", error);
    throw error;
  }
};
