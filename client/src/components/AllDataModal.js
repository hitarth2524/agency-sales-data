import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog, AppBar, Toolbar, IconButton, Typography, Tabs, Tab, Box, TextField, Autocomplete, useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Tooltip from '@mui/material/Tooltip';
import { CopySaleContext } from './CopySaleContext';

const tabProps = (index) => ({ id: `alldata-tab-${index}`, 'aria-controls': `alldata-tabpanel-${index}` });

const AllDataModal = ({ open, onClose, doctorOptions, salesRefreshKey }) => {
  const [tab, setTab] = useState(0);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editType, setEditType] = useState(null); // 'edit' or 'copy'
  const [dateFilter, setDateFilter] = useState('');
  const theme = useTheme();
  const { setCopySaleData } = useContext(CopySaleContext);

  const api = process.env.REACT_APP_API_URL;

  // Fetch sales for selected doctor
  useEffect(() => {
    if (doctorSearch) {
      setLoading(true);
      setError('');
      axios.get(`${api}/api/sales/doctor/${encodeURIComponent(doctorSearch)}`)
        .then(res => {
          // If API returns a single sale, wrap in array for consistency
          const data = Array.isArray(res.data) ? res.data : [res.data];
          setSales(data);
          setLoading(false);
        })
        .catch(err => {
          setSales([]);
          setError('No data found for this doctor.');
          setLoading(false);
        });
    } else {
      setSales([]);
      setError('');
    }
  }, [doctorSearch, salesRefreshKey]);

  const handleEditClick = (sale, type) => {
    if (type === 'edit') {
      setEditSale(sale);
      setEditForm({
        client: sale.client,
        payable: sale.payable,
        date: sale.date ? new Date(sale.date).toISOString().slice(0, 10) : '',
      });
      setEditType('edit');
    } else if (type === 'copy') {
      onClose();
      setTimeout(() => {
        setCopySaleData({ sale, type, ts: Date.now() });
      }, 300);
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = () => {
    if (!editSale) return;
    axios.put(`${api}/api/sales/${editSale._id}`, {
      ...editSale,
      client: editForm.client,
      payable: parseFloat(editForm.payable) || 0,
      date: editForm.date,
    })
      .then((res) => {
        setSales((prev) => prev.map((s) => (s._id === editSale._id ? res.data : s)));
        setEditSale(null);
        setEditType(null);
      });
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    setDeleteLoading(true);
    axios.delete(`${api}/api/sales/${deleteId}`)
      .then(() => {
        setSales((prev) => prev.filter((s) => s._id !== deleteId));
        setDeleteId(null);
        setDeleteLoading(false);
      });
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setDeleteLoading(false);
  };

  // Filter sales by dateFilter before rendering
  const filteredSales = dateFilter
    ? sales.filter(sale => sale.date && new Date(sale.date).toISOString().slice(0, 10) === dateFilter)
    : sales;

  useEffect(() => {
    if (filteredSales.length !== undefined) {
      console.log('AllDataModal: total sales received:', sales.length, 'filtered sales rendered:', filteredSales.length);
    }
  }, [sales, filteredSales]);

  return (
    <Dialog 
      fullScreen 
      open={open} 
      onClose={onClose} 
      PaperProps={{
      sx: {
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        fontFamily: 'Poppins, Roboto, sans-serif',
      }
      }}
    >
      <AppBar position="sticky" sx={{ background: 'transparent', boxShadow: 'none', pt: 1 }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography variant="h5" sx={{ 
            flex: 1, 
            fontWeight: 'bold', 
            color: '#fff', 
            fontFamily: 'Poppins, Roboto, sans-serif',
            fontSize: { xs: 18, sm: 20, md: 24 }
          }}>
            All Data Save
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon sx={{ 
              color: '#fff', 
              fontSize: { xs: 24, sm: 28, md: 32 } 
            }} />
          </IconButton>
        </Toolbar>
        <Box
          sx={{
            px: { xs: 1, sm: 2 },
            pb: 1,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'rgba(35,37,38,0.85)',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
            borderBottom: '1.5px solid #444',
            minHeight: 56,
            height: 56,
            backdropFilter: 'blur(6px)',
            mb: 3,
            minHeight: { xs: 'auto', sm: 56 },
            height: { xs: 'auto', sm: 56 },
            py: { xs: 1, sm: 0 }
          }}
        >
          <Autocomplete
            freeSolo
            options={doctorOptions || []}
            value={doctorSearch}
            onInputChange={(_, value) => setDoctorSearch(value)}
            fullWidth
            sx={{
              width: { xs: '100%', sm: 180, md: 200 },
              '& .MuiInputBase-root': {
                background: '#fff',
                borderRadius: 2,
                height: { xs: 48, sm: 56 },
                fontSize: { xs: 14, sm: 16 },
              },
              mb: { xs: 1, sm: 0 }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Doctor"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  background: '#fff',
                  borderRadius: 2,
                  fontSize: { xs: 14, sm: 16 },
                  '& .MuiOutlinedInput-root': {
                    height: { xs: 48, sm: 56 },
                  },
                }}
              />
            )}
          />
          <TextField
            label="Filter Date"
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{
              background: '#fff',
              borderRadius: 2,
              minWidth: { xs: '100%', sm: 180, md: 200 },
              fontSize: { xs: 14, sm: 16 },
              '& .MuiOutlinedInput-root': {
                height: { xs: 48, sm: 56 },
              },
              mb: { xs: 1, sm: 0 }
            }}
          />
          {dateFilter && (
            <Button
              size="small"
              onClick={() => setDateFilter('')}
              sx={{
                fontSize: { xs: 12, sm: 14 },
                minWidth: { xs: 'auto', sm: 'fit-content' }
              }}
            >
              Clear
            </Button>
          )}
        </Box>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          variant="fullWidth"
          textColor="inherit"
          TabIndicatorProps={{ style: { background: '#fff' } }}
          sx={{ 
            background: 'rgba(255,255,255,0.08)',
            '& .MuiTab-root': {
              fontSize: { xs: 12, sm: 14, md: 16 },
              minHeight: { xs: 48, sm: 56 },
              padding: { xs: '8px 4px', sm: '12px 8px' }
            }
          }}
        >
          <Tab 
            icon={<CalendarMonthIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
            label="Monthly Data" 
            {...tabProps(0)} 
            sx={{ 
              color: '#fff', 
              fontWeight: 'bold', 
              fontFamily: 'Poppins, Roboto, sans-serif',
              fontSize: { xs: 12, sm: 14, md: 16 }
            }} 
          />
          <Tab 
            icon={<BarChartIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
            label="Yearly Data" 
            {...tabProps(1)} 
            sx={{ 
              color: '#fff', 
              fontWeight: 'bold', 
              fontFamily: 'Poppins, Roboto, sans-serif',
              fontSize: { xs: 12, sm: 14, md: 16 }
            }} 
          />
        </Tabs>
      </AppBar>
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        color: '#fff', 
        fontFamily: 'Poppins, Roboto, sans-serif', 
        minHeight: '70vh' 
      }}>
        {!doctorSearch ? (
          <Typography variant="h6" sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }}>
            Please select a doctor to view sales data.
          </Typography>
        ) : loading ? (
          <Typography variant="h6" sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }}>
            Loading...
          </Typography>
        ) : error ? (
          <Typography variant="h6" color="error.main" sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }}>
            {error}
          </Typography>
        ) : (
          <>
            {tab === 0 ? (
              <>
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  fontSize: { xs: 16, sm: 18, md: 20 }
                }}>
                  Monthly Data
                </Typography>
                <Box sx={{ 
                  maxHeight: { xs: '50vh', sm: '55vh', md: '60vh' }, 
                  overflowY: 'auto', 
                  background: 'rgba(30, 34, 90, 0.7)', 
                  border: '1.5px solid rgba(255,255,255,0.15)', 
                  borderRadius: 6, 
                  p: { xs: 1, sm: 2 }, 
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', 
                  backdropFilter: 'blur(12px)', 
                  mt: 2, 
                  marginTop: { xs: '40px', sm: '50px', md: '60px' } 
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      >
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 80, sm: 100, md: 120 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Date
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 100, sm: 120, md: 120 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Client
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 80, sm: 90, md: 100 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Percentage Amount
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 80, sm: 90, md: 100 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSales.map((sale, idx) => (
                        <TableRow
                          key={sale._id || idx}
                          sx={{
                            background: idx % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.10)',
                            transition: 'box-shadow 0.3s, transform 0.3s, background 0.3s',
                            '&:hover': {
                              boxShadow: '0 4px 20px 0 rgba(102,126,234,0.25)',
                              background: 'rgba(102,126,234,0.18)',
                              transform: { xs: 'none', md: 'scale(1.01) translateY(-2px)' },
                            },
                          }}
                        >
                          <TableCell sx={{ 
                            color: '#fff', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            minWidth: { xs: 80, sm: 100, md: 120 }, 
                            borderRadius: 999, 
                            px: { xs: 1, sm: 2 }, 
                            py: { xs: 0.5, sm: 1 }, 
                            background: 'rgba(255,255,255,0.10)', 
                            m: { xs: 0.25, sm: 0.5 }, 
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {sale.date ? new Date(sale.date).toLocaleDateString('en-GB') : ''}
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#fff', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            minWidth: { xs: 100, sm: 120, md: 120 }, 
                            borderRadius: 999, 
                            px: { xs: 1, sm: 2 }, 
                            py: { xs: 0.5, sm: 1 }, 
                            background: 'rgba(255,255,255,0.10)', 
                            m: { xs: 0.25, sm: 0.5 }, 
                            textAlign: 'center', 
                            whiteSpace: 'normal', 
                            wordBreak: 'break-word' 
                          }}>
                            {sale.client || 'Neovision Health Care'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#fff', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            minWidth: { xs: 80, sm: 90, md: 100 }, 
                            borderRadius: 999, 
                            px: { xs: 1, sm: 2 }, 
                            py: { xs: 0.5, sm: 1 }, 
                            background: 'rgba(255,255,255,0.10)', 
                            m: { xs: 0.25, sm: 0.5 }, 
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {typeof sale.percentageAmount === 'number' ? sale.percentageAmount.toFixed(2) : '0.00'}
                          </TableCell>
                          <TableCell sx={{ 
                            px: { xs: 0.5, sm: 1 },
                            py: { xs: 0.5, sm: 1 }
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: { xs: 0.5, sm: 1 },
                              justifyContent: 'center',
                              flexWrap: 'wrap'
                            }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(sale, 'edit')}
                                sx={{
                                  color: '#00e6e6',
                                  background: 'rgba(102,126,234,0.12)',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s',
                                    minWidth: { xs: 32, sm: 36 },
                                    minHeight: { xs: 32, sm: 36 },
                                  '&:hover': {
                                    color: '#fff',
                                    background: '#00e6e6',
                                    boxShadow: '0 2px 8px 0 #00e6e6',
                                      transform: { xs: 'none', md: 'scale(1.2)' },
                                  },
                                }}
                              >
                                  <EditIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy/Edit as New">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(sale, 'copy')}
                                sx={{
                                  color: '#7c4dff',
                                  background: 'rgba(124,77,255,0.12)',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s',
                                    minWidth: { xs: 32, sm: 36 },
                                    minHeight: { xs: 32, sm: 36 },
                                  '&:hover': {
                                    color: '#fff',
                                    background: '#7c4dff',
                                    boxShadow: '0 2px 8px 0 #7c4dff',
                                      transform: { xs: 'none', md: 'scale(1.2)' },
                                  },
                                }}
                              >
                                  <OpenInNewIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(sale._id)}
                                sx={{
                                  color: '#ff1744',
                                  background: 'rgba(255,23,68,0.12)',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s',
                                    minWidth: { xs: 32, sm: 36 },
                                    minHeight: { xs: 32, sm: 36 },
                                  '&:hover': {
                                    color: '#fff',
                                    background: '#ff1744',
                                    boxShadow: '0 2px 8px 0 #ff1744',
                                      transform: { xs: 'none', md: 'scale(1.2)' },
                                  },
                                }}
                              >
                                  <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                              </IconButton>
                            </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total Row */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 14, sm: 15, md: 16 }, 
                          textAlign: 'right', 
                          background: 'rgba(102,126,234,0.18)',
                          px: { xs: 1, sm: 2 },
                          py: { xs: 0.5, sm: 1 }
                        }}>
                          Total
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 14, sm: 15, md: 16 }, 
                          textAlign: 'center', 
                          background: 'rgba(102,126,234,0.18)',
                          px: { xs: 1, sm: 2 },
                          py: { xs: 0.5, sm: 1 }
                        }}>
                          {filteredSales.reduce((sum, sale) => sum + (Number(sale.percentageAmount) || 0), 0).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ 
                          background: 'rgba(102,126,234,0.18)',
                          px: { xs: 0.5, sm: 1 },
                          py: { xs: 0.5, sm: 1 }
                        }} />
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </>
            ) : null}
            {tab === 1 ? (
              <>
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  fontSize: { xs: 16, sm: 18, md: 20 }
                }}>
                  Yearly Data
                </Typography>
                <Box sx={{ 
                  maxHeight: { xs: '50vh', sm: '55vh', md: '60vh' }, 
                  overflowY: 'auto', 
                  background: 'rgba(30, 34, 90, 0.7)', 
                  border: '1.5px solid rgba(255,255,255,0.15)', 
                  borderRadius: 6, 
                  p: { xs: 1, sm: 2 }, 
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', 
                  backdropFilter: 'blur(12px)', 
                  mt: 2, 
                  marginTop: { xs: '40px', sm: '50px', md: '60px' } 
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow
                        sx={{
                          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      >
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 60, sm: 80, md: 120 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Year
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 80, sm: 100, md: 120 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Date
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 100, sm: 120, md: 120 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Client
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 80, sm: 90, md: 100 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Percentage Amount
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 12, sm: 14, md: 16 }, 
                          minWidth: { xs: 80, sm: 90, md: 100 }, 
                          borderRadius: 999, 
                          px: { xs: 1, sm: 2 }, 
                          py: { xs: 0.5, sm: 1 }, 
                          background: 'rgba(102,126,234,0.18)', 
                          m: { xs: 0.25, sm: 0.5 }, 
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSales.map((sale, idx) => (
                        <TableRow
                          key={sale._id || idx}
                          sx={{
                            background: idx % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.10)',
                            transition: 'box-shadow 0.3s, transform 0.3s, background 0.3s',
                            '&:hover': {
                              boxShadow: '0 4px 20px 0 rgba(102,126,234,0.25)',
                              background: 'rgba(102,126,234,0.18)',
                              transform: { xs: 'none', md: 'scale(1.01) translateY(-2px)' },
                            },
                          }}
                        >
                          <TableCell sx={{ 
                            color: '#fff', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            minWidth: { xs: 60, sm: 80, md: 120 }, 
                            borderRadius: 999, 
                            px: { xs: 1, sm: 2 }, 
                            py: { xs: 0.5, sm: 1 }, 
                            background: 'rgba(255,255,255,0.10)', 
                            m: { xs: 0.25, sm: 0.5 }, 
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {sale.date ? new Date(sale.date).getFullYear() : ''}
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#fff', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            minWidth: { xs: 80, sm: 100, md: 120 }, 
                            borderRadius: 999, 
                            px: { xs: 1, sm: 2 }, 
                            py: { xs: 0.5, sm: 1 }, 
                            background: 'rgba(255,255,255,0.10)', 
                            m: { xs: 0.25, sm: 0.5 }, 
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {sale.date ? new Date(sale.date).toLocaleDateString('en-GB') : ''}
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#fff', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            minWidth: { xs: 100, sm: 120, md: 120 }, 
                            borderRadius: 999, 
                            px: { xs: 1, sm: 2 }, 
                            py: { xs: 0.5, sm: 1 }, 
                            background: 'rgba(255,255,255,0.10)', 
                            m: { xs: 0.25, sm: 0.5 }, 
                            textAlign: 'center', 
                            whiteSpace: 'normal', 
                            wordBreak: 'break-word' 
                          }}>
                            {sale.client || 'Neovision Health Care'}
                          </TableCell>
                          <TableCell sx={{ 
                            color: '#fff', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            minWidth: { xs: 80, sm: 90, md: 100 }, 
                            borderRadius: 999, 
                            px: { xs: 1, sm: 2 }, 
                            py: { xs: 0.5, sm: 1 }, 
                            background: 'rgba(255,255,255,0.10)', 
                            m: { xs: 0.25, sm: 0.5 }, 
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {typeof sale.percentageAmount === 'number' ? sale.percentageAmount.toFixed(2) : '0.00'}
                          </TableCell>
                          <TableCell sx={{ 
                            px: { xs: 0.5, sm: 1 },
                            py: { xs: 0.5, sm: 1 }
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              gap: { xs: 0.5, sm: 1 },
                              justifyContent: 'center',
                              flexWrap: 'wrap'
                            }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(sale, 'edit')}
                                sx={{
                                  color: '#00e6e6',
                                  background: 'rgba(102,126,234,0.12)',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s',
                                    minWidth: { xs: 32, sm: 36 },
                                    minHeight: { xs: 32, sm: 36 },
                                  '&:hover': {
                                    color: '#fff',
                                    background: '#00e6e6',
                                    boxShadow: '0 2px 8px 0 #00e6e6',
                                      transform: { xs: 'none', md: 'scale(1.2)' },
                                  },
                                }}
                              >
                                  <EditIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy/Edit as New">
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(sale, 'copy')}
                                sx={{
                                  color: '#7c4dff',
                                  background: 'rgba(124,77,255,0.12)',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s',
                                    minWidth: { xs: 32, sm: 36 },
                                    minHeight: { xs: 32, sm: 36 },
                                  '&:hover': {
                                    color: '#fff',
                                    background: '#7c4dff',
                                    boxShadow: '0 2px 8px 0 #7c4dff',
                                      transform: { xs: 'none', md: 'scale(1.2)' },
                                  },
                                }}
                              >
                                  <OpenInNewIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(sale._id)}
                                sx={{
                                  color: '#ff1744',
                                  background: 'rgba(255,23,68,0.12)',
                                  borderRadius: '50%',
                                  transition: 'all 0.2s',
                                    minWidth: { xs: 32, sm: 36 },
                                    minHeight: { xs: 32, sm: 36 },
                                  '&:hover': {
                                    color: '#fff',
                                    background: '#ff1744',
                                    boxShadow: '0 2px 8px 0 #ff1744',
                                      transform: { xs: 'none', md: 'scale(1.2)' },
                                  },
                                }}
                              >
                                  <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                              </IconButton>
                            </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total Row */}
                      <TableRow>
                        <TableCell colSpan={3} sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 14, sm: 15, md: 16 }, 
                          textAlign: 'right', 
                          background: 'rgba(102,126,234,0.18)',
                          px: { xs: 1, sm: 2 },
                          py: { xs: 0.5, sm: 1 }
                        }}>
                          Total
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#fff', 
                          fontWeight: 'bold', 
                          fontSize: { xs: 14, sm: 15, md: 16 }, 
                          textAlign: 'center', 
                          background: 'rgba(102,126,234,0.18)',
                          px: { xs: 1, sm: 2 },
                          py: { xs: 0.5, sm: 1 }
                        }}>
                          {filteredSales.reduce((sum, sale) => sum + (Number(sale.percentageAmount) || 0), 0).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ 
                          background: 'rgba(102,126,234,0.18)',
                          px: { xs: 0.5, sm: 1 },
                          py: { xs: 0.5, sm: 1 }
                        }} />
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </>
            ) : null}
          </>
        )}
      </Box>
      <Dialog open={!!deleteId} onClose={handleDeleteCancel}>
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          minWidth: { xs: 280, sm: 320 },
          maxWidth: { xs: '90vw', sm: 'auto' }
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            fontSize: { xs: 16, sm: 18, md: 20 }
          }}>
            Are you sure you want to delete this sale?
          </Typography>
          <DialogActions sx={{ 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Button 
              onClick={handleDeleteCancel} 
              color="secondary"
              sx={{ 
                fontSize: { xs: 13, sm: 14 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained" 
              disabled={deleteLoading}
              sx={{ 
                fontSize: { xs: 13, sm: 14 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={!!editSale && editType === 'edit'} onClose={() => { setEditSale(null); setEditType(null); }}>
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          minWidth: { xs: 280, sm: 320 },
          maxWidth: { xs: '90vw', sm: 'auto' }
        }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            fontSize: { xs: 16, sm: 18, md: 20 }
          }}>
            Edit Sale
          </Typography>
          <TextField
            label="Client"
            value={editForm.client || ''}
            onChange={e => handleEditChange('client', e.target.value)}
            fullWidth
            sx={{ 
              mb: 2,
              fontSize: { xs: 14, sm: 16 }
            }}
          />
          <TextField
            label="Payable"
            value={editForm.payable || ''}
            onChange={e => handleEditChange('payable', e.target.value)}
            type="number"
            fullWidth
            sx={{ 
              mb: 2,
              fontSize: { xs: 14, sm: 16 }
            }}
          />
          <TextField
            label="Date"
            value={editForm.date || ''}
            onChange={e => handleEditChange('date', e.target.value)}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ 
              mb: 2,
              fontSize: { xs: 14, sm: 16 }
            }}
          />
          <DialogActions sx={{ 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Button 
              onClick={() => { setEditSale(null); setEditType(null); }} 
              color="secondary"
              sx={{ 
                fontSize: { xs: 13, sm: 14 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSave} 
              color="primary" 
              variant="contained"
              sx={{ 
                fontSize: { xs: 13, sm: 14 },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Dialog>
  );
};

export default AllDataModal; 