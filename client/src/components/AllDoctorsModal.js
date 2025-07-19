import React, { useState } from 'react';
import { Dialog, AppBar, Toolbar, Typography, IconButton, Box, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const api = process.env.REACT_APP_API_URL;

const AllDoctorsModal = ({ open, onClose, doctorOptions, setDoctorOptions }) => {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (name) => {
    setEditing(name);
    setEditValue(name);
  };

  const handleEditSave = (oldName) => {
    if (!editValue.trim() || doctorOptions.includes(editValue)) return;
    // Backend update can be added here
    setDoctorOptions(prev => prev.map(d => d === oldName ? editValue : d));
    setEditing(null);
  };

  const handleDelete = (name) => {
    // Find the doctor object by name to get its _id
    fetch(`${api}/api/doctors`)
      .then(res => res.json())
      .then(doctors => {
        const doctor = doctors.find(d => d.name === name);
        if (doctor && doctor._id) {
          fetch(`${api}/api/doctors/${doctor._id}`, { method: 'DELETE' })
            .then(() => {
              // Fetch updated list after delete
              fetch(`${api}/api/doctors`)
                .then(res => res.json())
                .then(updated => setDoctorOptions(updated.map(d => d.name)));
            });
        }
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', borderRadius: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold', fontFamily: 'Poppins, Roboto, sans-serif' }}>All Doctors</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Doctor Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctorOptions.map((name) => (
              <TableRow key={name}>
                <TableCell>
                  {editing === name ? (
                    <TextField
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleEditSave(name)}
                      size="small"
                      autoFocus
                    />
                  ) : name}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(name)}><EditIcon color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(name)}><DeleteIcon color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Dialog>
  );
};

export default AllDoctorsModal; 