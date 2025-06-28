import axios from "axios";


//Mock data fetching function for the tree visualization
const fetchMockData = async () => {
  const response = await axios.get("/treeDataJSON/graphViz.json");
  return response.data;
};

export default fetchMockData;
