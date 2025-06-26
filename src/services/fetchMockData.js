import axios from "axios";

const fetchMockData = async () => {
  const response = await axios.get("/treeDataJSON/graphViz.json");
  return response.data;
};

export default fetchMockData;
