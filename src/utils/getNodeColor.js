
// This function determines the color of a node 
export const getNodeColor = (machine_id, bypass_list, not_allowed_list) => {
  if (not_allowed_list.includes(machine_id)) {
    return "#f44336";
  } else if (bypass_list.includes(machine_id)) {
    return "#2196f3";
  } else {
    return "#FFFFFF";
  }
};
