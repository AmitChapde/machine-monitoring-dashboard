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
import {getNodeColor} from "../../utils/getNodeColor";
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Fab
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import fetchMockData from "../../services/fetchMockData";

const TreeVisualization = () => {
  const [rawData, setRawData] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchMockData()
      .then((data) => {
        console.log("Fetched mock data:", data);
        setRawData(data);
      })
      .catch((error) => console.error("Error loading data:", error));
  }, []);


  const handleOpenEdit = (event, node) => {
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

  // Function to update data and refresh the graph
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

  // Generate node layout and edges
  const generateGraph = useCallback((data) => {
    // Recursively find how deep a node is in the graph (for layout)
    const getDepth = (nodeId, visited = new Set()) => {
      const node = data.prod_machine_map.find((m) => m.id === nodeId);
      if (!node || !node.input_stations.length || visited.has(nodeId)) return 0;
      visited.add(nodeId);
      return (
        1 + Math.max(...node.input_stations.map((id) => getDepth(id, visited)))
      );
    };

    const levelCount = {};

    const nodes = data.prod_machine_map.map((m) => {
      const depth = getDepth(m.id);
      levelCount[depth] = (levelCount[depth] || 0) + 1;
      const y = depth * 180; // vertical spacing between levels
      const x = (levelCount[depth] - 1) * 250; // horizontal spacing

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
          background: getNodeColor(m.machine_id, data.bypass_list, data.not_allowed_list),
          border: "1px solid #000",
          borderRadius: 10,
          padding: 10,
          width: 180,
        },
        sourcePosition: "bottom",
        targetPosition: "top",
      };
    });

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
  }, []);

  // Regenerate graph every time rawData updates
  useEffect(() => {
    if (rawData) {
      generateGraph(rawData);
      console.log("Nodes:", nodes);
      console.log("Edges:", edges);
    }
  }, [rawData, generateGraph]);

  return (
    <Box sx={{ width: "100%", height: 600 }}>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            label: (
              <div style={{ padding: 4, textAlign: "center", position: "relative" }}>
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

      {/* Floating edit panel (appears when editing a node) */}
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
