import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Button, TextField, Typography, Autocomplete, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Card, CardContent, CardHeader, IconButton, Chip, InputAdornment, Dialog
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import NotesIcon from '@mui/icons-material/Notes';
import CalculateIcon from '@mui/icons-material/Calculate';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AllDataModal from './AllDataModal';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AllDoctorsModal from './AllDoctorsModal';
import AllProductsModal from './AllProductsModal';
import { CopySaleContext } from './CopySaleContext';
import LogoutIcon from '@mui/icons-material/Logout';
import ShareIcon from '@mui/icons-material/Share';

const initialRow = { product: '', med1: '', med2: '', med3: '', med4: '', rate: '', };

// Set up axios interceptor to attach JWT token
if (!axios.interceptors.request.handlers.length) {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

const api = process.env.REACT_APP_API_URL;

const ModernSalesCalculator = () => {
  const [client, setClient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [doctorOptions, setDoctorOptions] = useState([]); // For autocomplete
  const [productOptions, setProductOptions] = useState([]); // For product autocomplete
  const [product, setProduct] = useState('');
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [disc, setDisc] = useState('');
  const [message, setMessage] = useState('');
  const [sales, setSales] = useState([]);
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [reportTitle, setReportTitle] = useState('Sales Report');
  const [showPreview, setShowPreview] = useState(false);
  const [allDataOpen, setAllDataOpen] = useState(false);
  const theme = useTheme();
  const [newDoctor, setNewDoctor] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [allDoctorsOpen, setAllDoctorsOpen] = useState(false);
  const [allProductsOpen, setAllProductsOpen] = useState(false);
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [medicalHeaders, setMedicalHeaders] = useState([
    'Medical 1',
    'Medical 2',
    'Medical 3',
    'Medical 4',
  ]);
  const [editingHeaderIdx, setEditingHeaderIdx] = useState(null);
  const [isEditingFromSaved, setIsEditingFromSaved] = useState(false);
  const [salesRefreshKey, setSalesRefreshKey] = useState(0);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const { copySaleData, setCopySaleData } = useContext(CopySaleContext);

  // Fetch doctor options from backend
  useEffect(() => {
    axios.get(`${api}/api/doctors`)
      .then(res => {
        setDoctorOptions(res.data.map(d => d.name));
      })
      .catch(() => setDoctorOptions([]));
  }, []);

  // Fetch product options from backend
  useEffect(() => {
    axios.get(`${api}/api/products`)
      .then(res => {
        setProductOptions(res.data.map(p => p.name));
      })
      .catch(() => setProductOptions([]));
  }, []);

  // Fetch all sales for the list
  useEffect(() => {
    axios.get(`${api}/api/sales/all`)
      .then(res => setSales(res.data))
      .catch(() => setSales([]));
  }, [selectedSaleId]);

  // Load latest sale for selected doctor
  useEffect(() => {
    console.log('doctor useEffect running. doctor:', doctor, 'isEditingFromSaved:', isEditingFromSaved);
    if (doctor && !isEditingFromSaved) {
      axios.get(`${api}/api/sales/${encodeURIComponent(doctor)}`)
        .then(res => {
          const sale = res.data;
          setClient(sale.client || '');
          setRows(sale.rows && sale.rows.length ? sale.rows : [{ ...initialRow }]);
          setDisc(sale.discount?.toString() || '');
          setMessage(sale.message || '');
          setIsEditingFromSaved(false);
        })
        .catch(() => {
          setClient('');
          setRows([{ ...initialRow }]);
          setDisc('');
          setMessage('');
          setIsEditingFromSaved(false);
        });
    }
  }, [doctor, isEditingFromSaved]);

  // Listen for copySaleData changes (from context)
  useEffect(() => {
    if (copySaleData && copySaleData.ts) {
      const { sale, type } = copySaleData;
      if (type === 'copy') {
        const { _id, ...saleData } = sale;
        const newRows = (saleData.rows && saleData.rows.length)
          ? saleData.rows.map(row => ({ ...row }))
          : [{ ...initialRow }];
        setDoctor(saleData.doctor || '');
        setClient(saleData.client || '');
        setRows(newRows);
        setDisc(saleData.discount?.toString() || '');
        setMessage(saleData.message || '');
        setReportTitle(saleData.reportTitle || 'Sales Report');
        setSaleDate(saleData.date ? new Date(saleData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
        setSelectedSaleId(null);
        setShowPreview(false);
        setIsEditingFromSaved(true);
        setCopySaleData(null); // clear after use
      }
    }
  }, [copySaleData?.ts]);

  // Calculation helpers
  const getTotalItem = (row) => {
    const a = parseFloat(row.med1) || 0;
    const b = parseFloat(row.med2) || 0;
    const c = parseFloat(row.med3) || 0;
    const d = parseFloat(row.med4) || 0;
    return a + b + c + d;
  };
  const getTotalAmount = (row) => {
    const totalItem = getTotalItem(row);
    const rate = parseFloat(row.rate) || 0;
    return totalItem * rate;
  };
  const subTotal = rows.reduce((sum, row) => sum + getTotalAmount(row), 0);
  const discount = parseFloat(disc) || 0;
  const payable = subTotal - (subTotal * discount) / 100;

  // Row handlers
  const handleInputChange = (idx, field, value) => {
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };
  const addRow = () => setRows([...rows, { ...initialRow }]);
  const removeRow = () => rows.length > 1 ? setRows(rows.slice(0, -1)) : alert('One row should be present');

  // Doctor autocomplete with backend
  const handleDoctorInput = (event, value, reason) => {
    setDoctor(value);
    if (reason === 'input' && value && !doctorOptions.includes(value)) {
      // Add new doctor to backend
      axios.post(`${api}/api/doctors`, { name: value })
        .then(() => {
          setDoctorOptions(prev => [...prev, value]);
        })
        .catch(() => {});
    }
  };

  // Product autocomplete with backend
  const handleProductInput = (event, value, reason) => {
    setProduct(value);
    if (reason === 'input' && value && !productOptions.includes(value)) {
      // Add new product to backend
      axios.post(`${api}/api/products`, { name: value })
        .then(() => {
          setProductOptions(prev => [...prev, value]);
        })
        .catch(() => {});
    }
  };

  // When a sale is selected from the list, load it for editing and show preview
  const handleSelectSale = (sale) => {
    setSelectedSaleId(sale._id);
    setReportTitle(sale.reportTitle || 'Sales Report');
    setDoctor(sale.doctor || '');
    setRows(sale.rows && sale.rows.length ? sale.rows : [{ ...initialRow }]);
    setDisc(sale.discount?.toString() || '');
    setMessage(sale.message || '');
    setShowPreview(true);
  };

  // Save or update sale
  const handleSave = () => {
    if (!doctor.trim()) {
      alert('Please enter doctor name.');
      return;
    }
    const data = {
      reportTitle,
      doctor,
      client,
      message,
      discount: parseFloat(disc) || 0,
      payable,
      rows: rows.map(r => ({
        product: r.product,
        med1: parseFloat(r.med1) || 0,
        med2: parseFloat(r.med2) || 0,
        med3: parseFloat(r.med3) || 0,
        med4: parseFloat(r.med4) || 0,
        rate: parseFloat(r.rate) || 0,
      })),
      date: saleDate,
    };
    if (selectedSaleId && !isEditingFromSaved) {
      axios.put(`${api}/api/sales/${selectedSaleId}`, data)
        .then(() => {
          alert('Record updated!');
          setSelectedSaleId(null);
          setShowPreview(true);
        })
        .catch(() => alert('Error updating record.'));
    } else {
      axios.post(`${api}/api/sales`, data)
        .then(() => {
          alert('Data saved successfully!');
          setShowPreview(true);
          setSalesRefreshKey(k => k + 1);
        })
        .catch(() => {
          alert('Error saving data.');
        });
    }
  };

  // Save and Print handlers (to be implemented)
  const handlePrint = () => {
    window.print();
  };

  // PDF Download handler
  const handleDownloadPDF = () => {
    const input = document.getElementById('sales-preview');
    // Save original width and style
    const originalWidth = input.style.width;
    const originalMaxWidth = input.style.maxWidth;
    // Set a fixed width for PDF export (A4 width in px, about 794px)
    input.style.width = '794px';
    input.style.maxWidth = '794px';
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('sales-report.pdf');
      // Restore original width and style
      input.style.width = originalWidth;
      input.style.maxWidth = originalMaxWidth;
      setShowPreview(false);
      setDoctor('');
      setClient('');
      setRows([{ ...initialRow }]);
      setDisc('');
      setMessage('');
      setReportTitle('Sales Report');
      setSaleDate(new Date().toISOString().slice(0, 10));
      setIsEditingFromSaved(false);
    });
  };

  // PDF Share handler
  const handleSharePDF = async () => {
    const input = document.getElementById('sales-preview');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const pdfBlob = pdf.output('blob');
    const file = new File([pdfBlob], 'sales-report.pdf', { type: 'application/pdf' });
    const message = encodeURIComponent('Check out my sales report!');
    const whatsappUrl = `https://wa.me/?text=${message}`;
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Sales Report',
          text: 'Check out my sales report!',
          files: [file]
        });
        return;
      } catch (err) {
        // fallback to WhatsApp
      }
    }
    // fallback to WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  // Add doctor
  const handleAddDoctor = () => {
    const name = newDoctor.trim();
    if (!name || doctorOptions.includes(name)) return;
    axios.post(`${api}/api/doctors`, { name })
      .then(() => {
        setDoctorOptions(prev => [...prev, name]);
        setNewDoctor('');
      });
  };

  // Edit doctor
  const handleEditDoctor = (oldName, newName) => {
    if (!newName.trim() || doctorOptions.includes(newName)) return;
    // Implement backend update if needed
    setDoctorOptions(prev => prev.map(d => d === oldName ? newName : d));
    setEditingDoctor(null);
  };

  // Delete doctor
  const handleDeleteDoctor = (name) => {
    axios.delete(`${api}/api/doctors/${encodeURIComponent(name)}`)
      .then(() => setDoctorOptions(prev => prev.filter(d => d !== name)));
  };

  // Add product
  const handleAddProduct = () => {
    const name = newProduct.trim();
    if (!name || productOptions.includes(name)) return;
    axios.post(`${api}/api/products`, { name })
      .then(() => {
        setProductOptions(prev => [...prev, name]);
        setNewProduct('');
      });
  };

  // Edit product
  const handleEditProduct = (oldName, newName) => {
    if (!newName.trim() || productOptions.includes(newName)) return;
    // Implement backend update if needed
    setProductOptions(prev => prev.map(p => p === oldName ? newName : p));
    setEditingProduct(null);
  };

  // Delete product
  const handleDeleteProduct = (name) => {
    axios.delete(`${api}/api/products/${encodeURIComponent(name)}`)
      .then(() => setProductOptions(prev => prev.filter(p => p !== name)));
  };

  const handleClearForm = () => {
    setClient('');
    setRows([{ ...initialRow }]);
    setDisc('');
    setMessage('');
    setReportTitle('Sales Report');
    setSelectedSaleId(null);
    setShowPreview(false);
    setIsEditingFromSaved(false);
  };

  // Close with Backup handler
  const handleCloseWithBackup = async () => {
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await axios.post(`${api}/api/backup`, {
        startDate: today,
        endDate: today
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      // Download the file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${today}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Log out user
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      alert('Backup failed: ' + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <Box sx={{
      mt: 4, // margin at the very top of the page
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%), url('https://www.transparenttextures.com/patterns/cubes.png')`,
      backgroundBlendMode: 'overlay',
      backgroundRepeat: 'repeat',
      backgroundSize: 'cover',
    }}>
      <Paper sx={{ 
        mt: 4, // margin above the card
        p: { xs: 2, sm: 3 }, 
        pt: { xs: 4, sm: 5 }, // extra top padding
        mb: { xs: 2, sm: 3 }, 
        borderRadius: 3, 
        boxShadow: 4, 
        background: 'linear-gradient(90deg, #e3ffe8 0%, #f3f6fb 100%)' 
      }} elevation={6}>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 3, md: 4 }, 
          mb: { xs: 3, sm: 4, md: 6 }, 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', md: 'flex-start' } 
        }}>
          {/* Doctor Master Card */}
          <Box sx={{ 
            flex: { xs: 'none', md: 1 }, 
            minWidth: { xs: '100%', md: 260 }, 
            maxWidth: { xs: '100%', md: 300 } 
          }}>
            <Card sx={{ 
              p: { xs: 2, sm: 3 }, 
              background: 'linear-gradient(135deg, #b2f7ef 0%, #a1c4fd 100%)', 
              borderRadius: 6, 
              boxShadow: '0 8px 32px 0 rgba(161,196,253,0.13)', 
              border: '2px solid #a1c4fd', 
              transition: 'box-shadow 0.4s, transform 0.4s', 
              '&:hover': { 
                boxShadow: '0 16px 48px 0 rgba(161,196,253,0.22)', 
                transform: { xs: 'none', md: 'scale(1.05)' } 
              } 
            }}>
              <CardHeader 
                avatar={<PersonAddIcon sx={{ 
                  fontSize: { xs: 28, sm: 32, md: 36 }, 
                  color: '#000', 
                  background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', 
                  borderRadius: '50%', 
                  boxShadow: 2, 
                  p: 1, 
                  transition: 'color 0.3s', 
                  '&:hover': { color: '#1976d2' } 
                }} />} 
                title={<Typography sx={{ 
                  fontWeight: 'bold', 
                  fontFamily: 'Poppins, Roboto, sans-serif', 
                  color: '#000', 
                  fontSize: { xs: 18, sm: 20, md: 22 }, 
                  letterSpacing: 1 
                }}>Doctor Master</Typography>} 
                sx={{ background: 'transparent', p: 0, mb: 2 }} 
              />
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Autocomplete
                  freeSolo
                  options={doctorOptions}
                  inputValue={newDoctor}
                  onInputChange={(_, value) => setNewDoctor(value)}
                  filterOptions={(options, state) =>
                    state.inputValue.length >= 2 ? options.filter(option => option.toLowerCase().includes(state.inputValue.toLowerCase())) : []
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Add Doctor" variant="outlined" size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              sx={{
                                color: '#000',
                                fontSize: { xs: 18, sm: 20 },
                                transition: 'color 0.3s',
                                '&:hover': { color: '#1976d2' }
                              }}
                              onClick={handleAddDoctor}
                            >
                              <PersonAddIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ background: '#fff', borderRadius: 2, mb: 2 }}
                    />
                  )}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: '#000',
                      color: '#fff',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      px: { xs: 2, sm: 2.5 },
                      py: { xs: 0.8, sm: 1 },
                      fontSize: { xs: 13, sm: 15 },
                      boxShadow: '0 4px 16px 0 rgba(0,0,0,0.12)',
                      border: '2px solid #000',
                      transition: 'all 0.25s',
                      '&:hover': {
                        background: '#fff',
                        color: '#000',
                        border: '2px solid #000',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                        transform: { xs: 'none', md: 'scale(1.07)' },
                      },
                    }}
                    onClick={() => setAllDoctorsOpen(true)}
                  >
                    All Doctors
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
          {/* Product Master Card */}
          <Box sx={{ 
            flex: { xs: 'none', md: 1 }, 
            minWidth: { xs: '100%', md: 260 }, 
            maxWidth: { xs: '100%', md: 300 } 
          }}>
            <Card sx={{ 
              p: { xs: 2, sm: 3 }, 
              background: 'linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%)', 
              borderRadius: 6, 
              boxShadow: '0 8px 32px 0 rgba(206,147,216,0.13)', 
              border: '2px solid #ce93d8', 
              transition: 'box-shadow 0.4s, transform 0.4s', 
              '&:hover': { 
                boxShadow: '0 16px 48px 0 rgba(206,147,216,0.22)', 
                transform: { xs: 'none', md: 'scale(1.05)' } 
              } 
            }}>
              <CardHeader 
                avatar={<Inventory2Icon sx={{ 
                  fontSize: { xs: 28, sm: 32, md: 36 }, 
                  color: '#000', 
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', 
                  borderRadius: '50%', 
                  boxShadow: 2, 
                  p: 1, 
                  transition: 'color 0.3s', 
                  '&:hover': { color: '#8e24aa' } 
                }} />} 
                title={<Typography sx={{ 
                  fontWeight: 'bold', 
                  fontFamily: 'Poppins, Roboto, sans-serif', 
                  color: '#000', 
                  fontSize: { xs: 18, sm: 20, md: 22 }, 
                  letterSpacing: 1 
                }}>Product Master</Typography>} 
                sx={{ background: 'transparent', p: 0, mb: 2 }} 
              />
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Autocomplete
                  freeSolo
                  options={productOptions}
                  inputValue={newProduct}
                  onInputChange={(_, value) => setNewProduct(value)}
                  filterOptions={(options, state) =>
                    state.inputValue.length >= 2 ? options.filter(option => option.toLowerCase().includes(state.inputValue.toLowerCase())) : []
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Add Product" variant="outlined" size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              sx={{
                                color: '#000',
                                fontSize: { xs: 18, sm: 20 },
                                transition: 'color 0.3s',
                                '&:hover': { color: '#8e24aa' }
                              }}
                              onClick={handleAddProduct}
                            >
                              <Inventory2Icon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ background: '#fff', borderRadius: 2, mb: 2 }}
                    />
                  )}
                />
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: '#000',
                      color: '#fff',
                      fontWeight: 'bold',
                      borderRadius: 3,
                      px: { xs: 2, sm: 2.5 },
                      py: { xs: 0.8, sm: 1 },
                      fontSize: { xs: 13, sm: 15 },
                      boxShadow: '0 4px 16px 0 rgba(0,0,0,0.12)',
                      border: '2px solid #000',
                      transition: 'all 0.25s',
                      '&:hover': {
                        background: '#fff',
                        color: '#000',
                        border: '2px solid #000',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
                        transform: { xs: 'none', md: 'scale(1.07)' },
                      },
                    }}
                    onClick={() => setAllProductsOpen(true)}
                  >
                    All Products
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
        <Box sx={{ mb: 2, mt: 4 }}>
          <TextField
            label="Date"
            type="date"
            value={saleDate}
            onChange={e => setSaleDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            variant="outlined"
            sx={{ 
              width: '100%',
              background: '#fff', 
              borderRadius: 2, 
              mb: 2
            }}
          />
          <TextField
            label="Sales Report"
            value={reportTitle}
            onChange={e => setReportTitle(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ 
              width: '100%',
              background: '#fff', 
              borderRadius: 2, 
              mb: 2
            }}
          />
          <Autocomplete
            freeSolo
            options={doctorOptions || []}
            value={doctor}
            onChange={(event, value) => setDoctor(value || '')}
            fullWidth
            sx={{ width: '100%', mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} label="Doctor Name" variant="outlined" fullWidth size="medium"
                sx={{ 
                  background: '#fff', 
                  borderRadius: 2, 
                  width: '100%',
                  mb: 0
                }} />
            )}
          />
        </Box>
        {isEditingFromSaved && (
          <Box sx={{ 
            mb: 2, 
            p: { xs: 1.5, sm: 2 }, 
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', 
            borderRadius: 2, 
            border: '2px solid #ffc107',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <EditIcon sx={{ color: '#ff8f00', fontSize: { xs: 20, sm: 24 } }} />
              <Typography sx={{ 
                color: '#856404', 
                fontWeight: 'bold',
                fontSize: { xs: 14, sm: 16 }
              }}>
                Editing saved data - Changes will create a new record
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearForm}
              sx={{
                borderColor: '#ff8f00',
                color: '#856404',
                fontSize: { xs: 12, sm: 14 },
                '&:hover': {
                  borderColor: '#f57c00',
                  backgroundColor: 'rgba(255,143,0,0.1)'
                }
              }}
            >
              Clear Form
            </Button>
          </Box>
        )}
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: { xs: 1, sm: 2 }, 
            mb: { xs: 2, sm: 3 }, 
            borderRadius: 3, 
            boxShadow: 3, 
            background: 'linear-gradient(90deg, #f3eaff 0%, #f3f6fb 100%)' 
          }} elevation={4}>
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={addRow} 
                startIcon={<AddCircleIcon />} 
                sx={{ 
                  fontWeight: 'bold', 
                  borderRadius: 2,
                  fontSize: { xs: 13, sm: 14 }
                }}
              >
                Add Row
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={removeRow} 
                startIcon={<RemoveCircleIcon />} 
                sx={{ 
                  fontWeight: 'bold', 
                  borderRadius: 2,
                  fontSize: { xs: 13, sm: 14 }
                }}
              >
                Remove Row
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ 
              overflowX: 'auto',
              '& .MuiTable-root': {
                minWidth: { xs: 600, sm: 800, md: 1000 }
              }
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Product', ...medicalHeaders, 'Total Item', 'Rate', 'Total Amount'].map((header, idx) => (
                      <TableCell key={header} sx={{ 
                        fontSize: { xs: 12, sm: 14 },
                        padding: { xs: '8px 4px', sm: '12px 8px' },
                        whiteSpace: 'nowrap'
                      }}>
                        {idx > 0 && idx < 5 ? (
                          editingHeaderIdx === idx - 1 ? (
                            <TextField
                              value={medicalHeaders[idx - 1]}
                              onChange={e => {
                                const newHeaders = [...medicalHeaders];
                                newHeaders[idx - 1] = e.target.value;
                                setMedicalHeaders(newHeaders);
                              }}
                              onBlur={() => setEditingHeaderIdx(null)}
                              onKeyDown={e => { if (e.key === 'Enter') setEditingHeaderIdx(null); }}
                              size="small"
                              autoFocus
                              sx={{ fontSize: { xs: 12, sm: 14 } }}
                            />
                          ) : (
                            <span style={{ 
                              cursor: 'pointer', 
                              textDecoration: 'underline dotted',
                              fontSize: { xs: 12, sm: 14 }
                            }} onClick={() => setEditingHeaderIdx(idx - 1)}>
                              {medicalHeaders[idx - 1]}
                            </span>
                          )
                        ) : header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ 
                        minWidth: { xs: 120, sm: 150, md: 200 }, 
                        width: { xs: 120, sm: 150, md: 250 },
                        padding: { xs: '8px 4px', sm: '12px 8px' }
                      }}>
                        <Autocomplete
                          freeSolo
                          options={productOptions}
                          value={row.product}
                          onInputChange={(event, value, reason) => handleInputChange(idx, 'product', value)}
                          filterOptions={(options, state) =>
                            state.inputValue.length >= 2
                              ? options.filter(option => option.toLowerCase().includes(state.inputValue.toLowerCase()))
                              : []
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              fullWidth
                              sx={{ fontSize: { xs: 12, sm: 14 } }}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        width: { xs: 80, sm: 120, md: 160 },
                        padding: { xs: '8px 4px', sm: '12px 8px' }
                      }}>
                        <TextField
                          value={row.med1}
                          onChange={e => handleInputChange(idx, 'med1', e.target.value)}
                          variant="standard"
                          type="number"
                          fullWidth
                          sx={{ fontSize: { xs: 12, sm: 14 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        width: { xs: 80, sm: 120, md: 160 },
                        padding: { xs: '8px 4px', sm: '12px 8px' }
                      }}>
                        <TextField
                          value={row.med2}
                          onChange={e => handleInputChange(idx, 'med2', e.target.value)}
                          variant="standard"
                          type="number"
                          fullWidth
                          sx={{ fontSize: { xs: 12, sm: 14 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        width: { xs: 80, sm: 120, md: 160 },
                        padding: { xs: '8px 4px', sm: '12px 8px' }
                      }}>
                        <TextField
                          value={row.med3}
                          onChange={e => handleInputChange(idx, 'med3', e.target.value)}
                          variant="standard"
                          type="number"
                          fullWidth
                          sx={{ fontSize: { xs: 12, sm: 14 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        width: { xs: 80, sm: 120, md: 160 },
                        padding: { xs: '8px 4px', sm: '12px 8px' }
                      }}>
                        <TextField
                          value={row.med4}
                          onChange={e => handleInputChange(idx, 'med4', e.target.value)}
                          variant="standard"
                          type="number"
                          fullWidth
                          sx={{ fontSize: { xs: 12, sm: 14 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        padding: { xs: '8px 4px', sm: '12px 8px' },
                        fontSize: { xs: 12, sm: 14 }
                      }}>
                        <Typography sx={{ fontSize: { xs: 12, sm: 14 } }}>{getTotalItem(row)}</Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        padding: { xs: '8px 4px', sm: '12px 8px' }
                      }}>
                        <TextField
                          value={row.rate}
                          onChange={e => handleInputChange(idx, 'rate', e.target.value)}
                          variant="standard"
                          type="number"
                          sx={{ fontSize: { xs: 12, sm: 14 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        padding: { xs: '8px 4px', sm: '12px 8px' },
                        fontSize: { xs: 12, sm: 14 }
                      }}>
                        <Typography sx={{ fontSize: { xs: 12, sm: 14 } }}>{getTotalAmount(row)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Summary section directly below the table */}
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', sm: 'flex-end' },
                mt: 2,
                mb: 2
              }}
            >
              <Typography sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: 16, sm: 18 }, mb: 0.5 }}>
                <b>Sub Total:</b> {subTotal.toFixed(2)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 },
                  mb: 0.5
                }}
              >
                <Typography sx={{ fontWeight: 'bold', color: 'secondary.main', mr: { xs: 0, sm: 1 }, fontSize: { xs: 16, sm: 18 } }}>
                  <b>Discount (%):</b>
                </Typography>
                <TextField
                  value={disc}
                  onChange={e => {
                    let value = e.target.value;
                    if (value === '') {
                      setDisc('');
                      return;
                    }
                    const num = Number(value);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setDisc(value);
                    }
                  }}
                  type="number"
                  size="small"
                  sx={{
                    width: { xs: 100, sm: 80 },
                    background: '#fff',
                    borderRadius: 2,
                    maxWidth: { xs: 120, sm: 80 },
                    mt: { xs: 1, sm: 0 }
                  }}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Box>
              <Typography sx={{ fontWeight: 'bold', color: 'success.main', fontSize: { xs: 16, sm: 18 } }}>
                <b>Payable Amount:</b> {payable.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                mb: { xs: 1, sm: 2 }, 
                borderRadius: 3, 
                boxShadow: 2, 
                background: 'linear-gradient(90deg, #e3f2fd 0%, #e1bee7 100%)', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 1 
              }} elevation={2}>
                <NotesIcon color="primary" sx={{ 
                  mt: 0.5, 
                  fontSize: { xs: 24, sm: 28 },
                  display: { xs: 'none', sm: 'block' }
                }} />
                <TextField
                  label="Message / Notes"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  variant="outlined"
                  sx={{ background: '#fff', borderRadius: 2 }}
                />
              </Paper>
              {/* SAVE and PRINT buttons moved below Message/Notes */}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    borderRadius: 2,
                    minHeight: 32,
                    py: 0.5,
                    px: 2,
                    boxShadow: 4,
                    width: { xs: 140, sm: 180 },
                    mx: 'auto',
                  }}
                >
                  {isEditingFromSaved ? 'Save as New Record' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    borderRadius: 2,
                    minHeight: 32,
                    py: 0.5,
                    px: 2,
                    boxShadow: 4,
                    width: { xs: 140, sm: 180 },
                    mx: 'auto',
                  }}
                >
                  Print
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddToPhotosIcon />}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    borderRadius: 2,
                    minHeight: 32,
                    py: 0.5,
                    px: 2,
                    boxShadow: 4,
                    width: { xs: 140, sm: 180 },
                    mx: 'auto',
                    background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
                    color: '#fff',
                    '&:hover': { background: 'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)' }
                  }}
                  onClick={() => setAllDataOpen(true)}
                >
                  ALL DATA SAVE
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<LogoutIcon />}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: 13,
                    borderRadius: 2,
                    minHeight: 32,
                    py: 0.5,
                    px: 2,
                    boxShadow: 4,
                    width: { xs: 140, sm: 180 },
                    mx: 'auto',
                    background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                    color: '#fff',
                    '&:hover': { background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)' }
                  }}
                  onClick={handleCloseWithBackup}
                >
                  CLOSE WITH BACKUP
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} lg={6}>
              {/* Remove summary values from here */}
              <Paper sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                borderRadius: 3, 
                boxShadow: 2, 
                background: 'linear-gradient(90deg, #fffde7 0%, #ffe0b2 100%)', 
                mb: { xs: 1, sm: 2 } 
              }} elevation={2}>
                {/* This Paper now only for future use or can be removed if empty */}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {/* Preview Section */}
      {showPreview && (
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 3 }} elevation={4} id="sales-preview">
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>{reportTitle}</Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}><b>Doctor Name:</b> {doctor}</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {(() => {
                      // Check which medical columns have values across all rows
                      const hasMed1 = rows.some(row => row.med1 && row.med1 !== '' && parseFloat(row.med1) !== 0);
                      const hasMed2 = rows.some(row => row.med2 && row.med2 !== '' && parseFloat(row.med2) !== 0);
                      const hasMed3 = rows.some(row => row.med3 && row.med3 !== '' && parseFloat(row.med3) !== 0);
                      const hasMed4 = rows.some(row => row.med4 && row.med4 !== '' && parseFloat(row.med4) !== 0);
                      
                      const headers = ['Product'];
                      if (hasMed1) headers.push(medicalHeaders[0]);
                      if (hasMed2) headers.push(medicalHeaders[1]);
                      if (hasMed3) headers.push(medicalHeaders[2]);
                      if (hasMed4) headers.push(medicalHeaders[3]);
                      headers.push('Total Item', 'Rate', 'Total Amount');
                      
                      return headers.map((header, idx) => (
                        <TableCell key={header}>{header}</TableCell>
                      ));
                    })()}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => {
                    // Check which medical columns have values for this specific row
                    const hasMed1 = row.med1 && row.med1 !== '' && parseFloat(row.med1) !== 0;
                    const hasMed2 = row.med2 && row.med2 !== '' && parseFloat(row.med2) !== 0;
                    const hasMed3 = row.med3 && row.med3 !== '' && parseFloat(row.med3) !== 0;
                    const hasMed4 = row.med4 && row.med4 !== '' && parseFloat(row.med4) !== 0;
                    
                    // Check which medical columns have values across all rows (for header consistency)
                    const allHasMed1 = rows.some(r => r.med1 && r.med1 !== '' && parseFloat(r.med1) !== 0);
                    const allHasMed2 = rows.some(r => r.med2 && r.med2 !== '' && parseFloat(r.med2) !== 0);
                    const allHasMed3 = rows.some(r => r.med3 && r.med3 !== '' && parseFloat(r.med3) !== 0);
                    const allHasMed4 = rows.some(r => r.med4 && r.med4 !== '' && parseFloat(r.med4) !== 0);
                    
                    return (
                      <TableRow key={idx}>
                        <TableCell>{row.product}</TableCell>
                        {allHasMed1 && <TableCell>{hasMed1 ? row.med1 : ''}</TableCell>}
                        {allHasMed2 && <TableCell>{hasMed2 ? row.med2 : ''}</TableCell>}
                        {allHasMed3 && <TableCell>{hasMed3 ? row.med3 : ''}</TableCell>}
                        {allHasMed4 && <TableCell>{hasMed4 ? row.med4 : ''}</TableCell>}
                        <TableCell>{getTotalItem(row)}</TableCell>
                        <TableCell>{row.rate}</TableCell>
                        <TableCell>{getTotalAmount(row)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: { xs: 'flex-start', sm: 'space-between' },
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                gap: { xs: 2, sm: 4 }
              }}
            >
              <Box sx={{ minWidth: 220, maxWidth: 400, flex: 1 }}>
                <Typography sx={{ fontWeight: 'bold', mb: 1 }}><b>Message / Notes:</b></Typography>
                <Typography>{message}</Typography>
              </Box>
              <Box
                sx={{
                  minWidth: { xs: 'unset', sm: 280 },
                  width: { xs: '100%', sm: 'auto' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'center', sm: 'flex-end' },
                  mr: { xs: 0, md: 20 },
                  mt: { xs: 2, sm: 0 },
                  gap: 1.5
                }}
              >
                <Typography sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0, fontSize: { xs: 16, sm: 18 } }}>
                  <b>Sub Total:</b> {subTotal.toFixed(2)}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 0,
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold', color: 'secondary.main', mr: { xs: 0, sm: 1 }, fontSize: { xs: 16, sm: 18 } }}>
                    <b>Discount (%):</b>
                  </Typography>
                  <TextField
                    value={disc}
                    onChange={e => {
                      let value = e.target.value;
                      if (value === '') {
                        setDisc('');
                        return;
                      }
                      const num = Number(value);
                      if (!isNaN(num) && num >= 0 && num <= 100) {
                        setDisc(value);
                      }
                    }}
                    type="number"
                    size="small"
                    sx={{
                      width: { xs: 100, sm: 80 },
                      background: '#fff',
                      borderRadius: 2,
                      maxWidth: { xs: 120, sm: 80 },
                      mt: { xs: 1, sm: 0 }
                    }}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 'bold', color: 'success.main', fontSize: { xs: 16, sm: 18 } }}>
                  <b>Payable Amount:</b> {payable.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="warning" sx={{ mt: 2, fontWeight: 'bold', borderRadius: 2 }} onClick={handleDownloadPDF} startIcon={<PictureAsPdfIcon />}>
              Download PDF
            </Button>
            <Button variant="contained" color="success" sx={{ mt: 2, fontWeight: 'bold', borderRadius: 2 }} onClick={handleSharePDF} startIcon={<ShareIcon />}>
              Share
            </Button>
          </Box>
        </Box>
      )}
      {/* Print CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .MuiPaper-root { box-shadow: none !important; }
          .MuiButton-root, .MuiAutocomplete-root, .MuiTextField-root, .MuiTableCell-root input { display: none !important; }
          .MuiTableCell-root { border: 1px solid #ccc !important; }
          .MuiTypography-root { color: #000 !important; }
        }
      `}</style>

      {/* Floating Action Button for All Data Save */}
      {/* Removed the fixed bottom bar */}
      <AllDataModal open={allDataOpen} onClose={() => setAllDataOpen(false)} doctorOptions={doctorOptions} salesRefreshKey={salesRefreshKey} />
      <AllDoctorsModal open={allDoctorsOpen} onClose={() => setAllDoctorsOpen(false)} doctorOptions={doctorOptions} setDoctorOptions={setDoctorOptions} />
      <AllProductsModal open={allProductsOpen} onClose={() => setAllProductsOpen(false)} productOptions={productOptions} setProductOptions={setProductOptions} />
    </Box>
  );
};

export default ModernSalesCalculator; 