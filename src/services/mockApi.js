import axios from "axios";
import { isAfter, isBefore, parseISO } from "date-fns";

export const getChangeLogData = async ({
  machine_id,
  limit,
  from_time,
  to_time,
}) => {
  try {
    const response = await axios.get(
      `/Scatter Data JSON/${machine_id}/changelog.json`
    );
    let result = response.data?.Result ?? [];

    const from = from_time ? parseISO(from_time) : null;
    const to = to_time ? parseISO(to_time) : null;

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

export const getPredictionData = async ({ machine_id, from_time, to_time }) => {
  try {
    const response = await axios.get(
      `/Scatter Data JSON/${machine_id}/prediction_data.json`
    );

    const { cycles, ...rest } = response.data;

    const from = from_time ? parseISO(from_time) : null;
    const to = to_time ? parseISO(to_time) : null;

    const filteredCycles = Object.entries(cycles).filter(
      ([epoch, cycleData]) => {
        const date = new Date(Number(epoch) * 1000);
        const validFrom = !from || isAfter(date, from);
        const validTo = !to || isBefore(date, to);
        return validFrom && validTo;
      }
    );

    const filteredCycleObject = Object.fromEntries(filteredCycles);

    return {
      ...rest,
      cycles: filteredCycleObject,
    };
  } catch (error) {
    console.error("Error fetching prediction data:", error);
    throw error;
  }
};

export const getTimeSeriesData = async ({
  machine_id,
  cyclelog_id,
  signal,
  anomalyType,
}) => {
  try {
    const response = await axios.get(
      `/Scatter Data JSON/${machine_id}/timeseries_cycledata_${anomalyType}.json`
    );

    const cycleEntry = response.data?.data?.[cyclelog_id];
    if (!cycleEntry) {
      throw new Error(
        `Cycle log ID ${cyclelog_id} not found in time series data.`
      );
    }

    const timeSeries = cycleEntry.cycle_data?.[signal];
    if (!timeSeries) {
      throw new Error(
        `Signal ${signal} not found for cyclelog_id ${cyclelog_id}.`
      );
    }

    return timeSeries;
  } catch (error) {
    console.error("Error fetching time series data:", error);
    throw error;
  }
};
