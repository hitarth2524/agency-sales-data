import React, { useState } from 'react';
import { Dialog, AppBar, Toolbar, Typography, IconButton, Box, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AllProductsModal = ({ open, onClose, productOptions, setProductOptions }) => {
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (name) => {
    setEditing(name);
    setEditValue(name);
  };

  const handleEditSave = (oldName) => {
    if (!editValue.trim() || productOptions.includes(editValue)) return;
    // Backend update can be added here
    setProductOptions(prev => prev.map(p => p === oldName ? editValue : p));
    setEditing(null);
  };

  const handleDelete = (name) => {
    // Find the product object by name to get its _id
    fetch('/api/products')
      .then(res => res.json())
      .then(products => {
        const product = products.find(p => p.name === name);
        if (product && product._id) {
          fetch(`/api/products/${product._id}`, { method: 'DELETE' })
            .then(() => {
              // Fetch updated list after delete
              fetch('/api/products')
                .then(res => res.json())
                .then(updated => setProductOptions(updated.map(p => p.name)));
            });
        }
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 2 } }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #f3eaff 0%, #a8edea 100%)', borderRadius: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold', fontFamily: 'Poppins, Roboto, sans-serif' }}>All Products</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productOptions.map((name) => (
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

export default AllProductsModal; 