import axios from "axios";


export const getChangeLogData = async (machineId) => {
  const response = await axios.get(`/Scatter Data JSON/${machineId}/changelog.json`);
  return response.data;
};

export const getPredictionData=async (machineId)=>{
    const response=await axios.get(`/Scatter Data JSON/${machineId}/prediction_data.json`);
    return response.data;
}

export const getTimeSeriesData = async (color) => {
  const response = await axios.get(`/Scatter Data JSON/Machine1-SSP0173/timeseries_cycledata_${color}.json`);
  return response.data;
};