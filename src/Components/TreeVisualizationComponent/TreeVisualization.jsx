import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getNodeColor } from "../../utils/getNodeColor";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Fab,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import MenuSharpIcon from "@mui/icons-material/MenuSharp";
import fetchMockData from "../../services/fetchMockData";

// This component visualizes a production machine map as a tree graph using React Flow.
const TreeVisualization = () => {
  const [rawData, setRawData] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editing, setEditing] = useState(false);
  const [disconnectedNodes, setDisconnectedNodes] = useState([]);
  const [showDisconnected, setShowDisconnected] = useState(false);

  useEffect(() => {
    fetchMockData()
      .then((data) => {
        console.log("Fetched mock data:", data);
        setRawData(data);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);

    // Handle opening the edit panel for a node.
  const handleOpenEdit = (event, node) => {
    // Prevent React Flow from handling the click.
    event.stopPropagation();
    setSelectedNode(node);
    setEditValues({
      name: node.data.name,
      station_number: node.data.station_number,
      category: rawData.not_allowed_list.includes(node.data.machine_id)
        ? "not_allowed"
        : rawData.bypass_list.includes(node.data.machine_id)
        ? "bypass"
        : "normal",
    });
    setEditing(true);
  };

   // Function to save the edited node data and refresh the graph.
  const updateDataAndRefresh = () => {
    const updatedMap = rawData.prod_machine_map.map((m) =>
      m.id === Number(selectedNode.id)
        ? {
            ...m,
            name: editValues.name,
            station_number: editValues.station_number,
          }
        : m
    );

    // Update the bypass and not_allowed lists based on the new category.
    const machine_id = selectedNode.data.machine_id;
    const newBypass = rawData.bypass_list.filter((id) => id !== machine_id);
    const newNotAllowed = rawData.not_allowed_list.filter(
      (id) => id !== machine_id
    );

    if (editValues.category === "bypass") newBypass.push(machine_id);
    if (editValues.category === "not_allowed") newNotAllowed.push(machine_id);

    setRawData({
      ...rawData,
      prod_machine_map: updatedMap,
      bypass_list: newBypass,
      not_allowed_list: newNotAllowed,
    });
    

    setSelectedNode(null);
    setEditing(false);
  };

  //Memoizing the graph generation function 
  const generateGraph = useCallback(
    (data) => {
      const getDepth = (nodeId, visited = new Set()) => {
        const node = data.prod_machine_map.find((m) => m.id === nodeId);
        if (!node || !node.input_stations.length || visited.has(nodeId))
          return 0;
        visited.add(nodeId);
        return (
          1 +
          Math.max(...node.input_stations.map((id) => getDepth(id, visited)))
        );
      };

      const levelCount = {};

      // Create React Flow nodes from the raw data.
      const nodes = data.prod_machine_map.map((m) => {
        const depth = getDepth(m.id);
        levelCount[depth] = (levelCount[depth] || 0) + 1;
        const y = depth * 180;
        const x = (levelCount[depth] - 1) * 250;

        return {
          id: String(m.id),
          position: { x, y },
          data: {
            ...m,
            machine_id: m.machine_id,
            name: m.name,
            station_number: m.station_number,
          },
          style: {
            background: getNodeColor(
              m.machine_id,
              data.bypass_list,
              data.not_allowed_list
            ),
            border: "1px solid #000",
            borderRadius: 10,
            padding: 10,
            width: 180,
          },
          sourcePosition: "bottom",
          targetPosition: "top",
        };
      });

       // Create React Flow edges (connections) from the raw data.
      const edges = data.prod_machine_map.flatMap((m) =>
        m.input_stations.map((inputId) => ({
          id: `e${inputId}-${m.id}`,
          source: String(inputId),
          target: String(m.id),
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        }))
      );

      setNodes(nodes);
      setEdges(edges);

      // detect disconnected nodes
      const connectedIds = new Set(edges.flatMap((e) => [e.source, e.target]));
      const disconnected = nodes.filter((n) => !connectedIds.has(n.id));
      setDisconnectedNodes(disconnected);
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    if (rawData) {
      generateGraph(rawData);
    }
  }, [rawData, generateGraph]);

  return (
    <Box sx={{ width: "100%", height: 600, position: "relative" }}>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            label: (
              <div
                style={{
                  padding: 4,
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <strong>{node.data.station_number}</strong>
                <br />
                <span>{node.data.name}</span>
                <Fab
                  color="primary"
                  size="small"
                  style={{ position: "absolute", bottom: -30, right: -30 }}
                  onClick={(e) => handleOpenEdit(e, node)}
                >
                  <EditIcon />
                </Fab>
              </div>
            ),
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Controls />
        <Background gap={16} />
      </ReactFlow>

        {/* Disconnected Nodes */}
      <Box sx={{ position: "absolute", top: 10, right: 10 }}>
        <Tooltip title="View Disconnected nodes">
          <MenuSharpIcon
            onClick={() => setShowDisconnected(!showDisconnected)}
            style={{ cursor: "pointer" }}
          />
        </Tooltip>
      </Box>

      {showDisconnected && disconnectedNodes.length > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: 2,
            position: "absolute",
            top: 50,
            right: 10,
            maxWidth: 300,
            zIndex: 1000,
          }}
        >
          <strong>Disconnected Nodes:</strong>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              mt: 1,
              maxHeight: 300,
              overflowY: "auto",
            }}
          >
            {disconnectedNodes.map((n) => (
              <Box
                key={n.id}
                sx={{
                  p: 1,
                  border: "1px dashed grey",
                  borderRadius: 1,
                  minWidth: 100,
                }}
              >
                {n.data?.station_number} - {n.data?.name}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Edit Node Panel */}
      {editing && selectedNode && (
        <Box
          sx={{
            position: "fixed",
            bottom: 80,
            right: 40,
            backgroundColor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: 4,
            zIndex: 999,
            width: 300,
          }}
        >
          <TextField
            label="Name"
            fullWidth
            value={editValues.name || ""}
            onChange={(e) =>
              setEditValues({ ...editValues, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Station Number"
            fullWidth
            value={editValues.station_number || ""}
            onChange={(e) =>
              setEditValues({ ...editValues, station_number: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={editValues.category || "normal"}
              label="Category"
              onChange={(e) =>
                setEditValues({ ...editValues, category: e.target.value })
              }
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bypass">Bypass</MenuItem>
              <MenuItem value="not_allowed">Not Allowed</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              startIcon={<CancelIcon />}
              onClick={() => {
                setSelectedNode(null);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={updateDataAndRefresh}
            >
              Save
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TreeVisualization;
