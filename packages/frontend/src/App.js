import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  Box,
  LinearProgress,
  CircularProgress,
  List,
  ListItem,
  Paper,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data: " + err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      setApiLoading(true);
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newItem,
          due_date: newDueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const result = await response.json();
      setData([...data, result]);
      setNewItem("");
      setNewDueDate("");
      showSnackbar("Task added successfully!");
    } catch (err) {
      showSnackbar("Error adding item: " + err.message, "error");
      console.error("Error adding item:", err);
    } finally {
      setApiLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      setApiLoading(true);
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setData(data.filter((item) => item.id !== itemId));
      showSnackbar("Task deleted successfully!");
    } catch (err) {
      showSnackbar("Error deleting item: " + err.message, "error");
      console.error("Error deleting item:", err);
    } finally {
      setApiLoading(false);
    }
  };

  const handleToggleComplete = async (item) => {
    try {
      setApiLoading(true);
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: item.name,
          due_date: item.due_date,
          completed: item.completed ? 0 : 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const updatedItem = await response.json();
      setData(data.map((i) => (i.id === item.id ? updatedItem : i)));
      showSnackbar(
        updatedItem.completed ? "Task marked complete!" : "Task marked incomplete!"
      );
    } catch (err) {
      showSnackbar("Error updating item: " + err.message, "error");
      console.error("Error updating item:", err);
    } finally {
      setApiLoading(false);
    }
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDueDate(item.due_date || "");
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingItem(null);
    setEditName("");
    setEditDueDate("");
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      showSnackbar("Task name cannot be empty", "error");
      return;
    }

    try {
      setApiLoading(true);
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          due_date: editDueDate || null,
          completed: editingItem.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      const updatedItem = await response.json();
      setData(data.map((i) => (i.id === editingItem.id ? updatedItem : i)));
      closeEditDialog();
      showSnackbar("Task updated successfully!");
    } catch (err) {
      showSnackbar("Error updating item: " + err.message, "error");
      console.error("Error updating item:", err);
    } finally {
      setApiLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h1" sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
            📝 To Do App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Loading Progress */}
      {apiLoading && <LinearProgress />}

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
        {/* Add Item Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h2" sx={{ fontSize: "1.5rem", mb: 2 }}>
            Add New Task
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Task name"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter task name"
                fullWidth
                disabled={apiLoading || loading}
              />
              <TextField
                type="date"
                label="Due date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={apiLoading || loading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={apiLoading || loading || !newItem.trim()}
              >
                Add Task
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Items Section */}
        <Box>
          <Typography variant="h2" sx={{ fontSize: "1.5rem", mb: 2 }}>
            Tasks
          </Typography>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : data.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, textAlign: "center" }}>
              <Typography color="textSecondary">
                No tasks found. Add one to get started! 🚀
              </Typography>
            </Paper>
          ) : (
            <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    opacity: item.completed ? 0.6 : 1,
                    textDecoration: item.completed ? "line-through" : "none",
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Checkbox
                        checked={item.completed === 1}
                        onChange={() => handleToggleComplete(item)}
                        disabled={apiLoading || loading}
                        aria-label={`Mark task "${item.name}" complete`}
                      />
                      <Stack sx={{ flex: 1 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 500,
                            mb: 1,
                            wordBreak: "break-word",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Due: {formatDate(item.due_date)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => openEditDialog(item)}
                      disabled={apiLoading || loading}
                      aria-label={`Edit task "${item.name}"`}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id)}
                      disabled={apiLoading || loading}
                      aria-label={`Delete task "${item.name}"`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
            </List>
          )}
        </Box>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Task name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              autoFocus
              disabled={apiLoading}
            />
            <TextField
              type="date"
              label="Due date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={apiLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={apiLoading}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={apiLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;