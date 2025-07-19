import React, { useState } from 'react';
import './SalesCalculator.css';

const initialRow = {
  product: '',
  medA: '',
  medB: '',
  medC: '',
  medD: '',
  rate: '',
};

function isDecimal(value) {
  return /^\d*\.?\d*$/.test(value);
}

const SalesCalculator = () => {
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [disc, setDisc] = useState('');

  const handleInputChange = (idx, field, value) => {
    if ((['medA', 'medB', 'medC', 'medD', 'rate'].includes(field) && !isDecimal(value)) || value.startsWith('.')) return;
    const newRows = [...rows];
    newRows[idx][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { ...initialRow }]);
  };

  const removeRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1));
    } else {
      alert('One row should be present in table');
    }
  };

  const getTotalItem = (row) => {
    const a = parseFloat(row.medA) || 0;
    const b = parseFloat(row.medB) || 0;
    const c = parseFloat(row.medC) || 0;
    const d = parseFloat(row.medD) || 0;
    return a + b + c + d;
  };

  const getTotalAmount = (row) => {
    const totalItem = getTotalItem(row);
    const rate = parseFloat(row.rate) || 0;
    return totalItem * rate;
  };

  const subTotal = rows.reduce((sum, row) => sum + getTotalAmount(row), 0);
  const discount = parseFloat(disc) || 0;
  const total = (subTotal * discount) / 100;

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button className="btn" onClick={addRow}>Add Row</button>
        <button className="btn" onClick={removeRow}>Remove Row</button>
      </div>
      <table className="tbl" width="100%">
        <thead>
          <tr>
            <th width="25%" style={{ textAlign: 'left' }}>Product</th>
            <th width="10%"><input type="text" style={{ width: '94%', fontWeight: 'bold', textAlign: 'center' }} disabled /></th>
            <th width="10%"><input type="text" style={{ width: '94%', fontWeight: 'bold', textAlign: 'center' }} disabled /></th>
            <th width="10%"><input type="text" style={{ width: '94%', fontWeight: 'bold', textAlign: 'center' }} disabled /></th>
            <th width="10%"><input type="text" style={{ width: '94%', fontWeight: 'bold', textAlign: 'center' }} disabled /></th>
            <th width="10%">Total Item</th>
            <th width="10%">Rate</th>
            <th width="15%">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr className="data" key={idx}>
              <td style={{ width: '25%' }}>
                <input
                  type="text"
                  value={row.product}
                  onChange={e => handleInputChange(idx, 'product', e.target.value)}
                  style={{ width: '98%', fontWeight: 'bold' }}
                />
              </td>
              <td align="right" style={{ width: '10%' }}>
                <input
                  type="text"
                  value={row.medA}
                  onChange={e => handleInputChange(idx, 'medA', e.target.value)}
                  style={{ width: '94%', textAlign: 'center' }}
                  className="txtinput"
                />
              </td>
              <td align="right" style={{ width: '10%' }}>
                <input
                  type="text"
                  value={row.medB}
                  onChange={e => handleInputChange(idx, 'medB', e.target.value)}
                  style={{ width: '94%', textAlign: 'center' }}
                  className="txtinput"
                />
              </td>
              <td align="right" style={{ width: '10%' }}>
                <input
                  type="text"
                  value={row.medC}
                  onChange={e => handleInputChange(idx, 'medC', e.target.value)}
                  style={{ width: '94%', textAlign: 'center' }}
                  className="txtinput"
                />
              </td>
              <td align="right" style={{ width: '10%' }}>
                <input
                  type="text"
                  value={row.medD}
                  onChange={e => handleInputChange(idx, 'medD', e.target.value)}
                  style={{ width: '94%', textAlign: 'center' }}
                  className="txtinput"
                />
              </td>
              <td style={{ width: '10%', textAlign: 'center' }}>
                <span style={{ width: '94%', textAlign: 'center' }}>{getTotalItem(row)}</span>
              </td>
              <td align="right" style={{ width: '10%' }}>
                <input
                  type="text"
                  value={row.rate}
                  onChange={e => handleInputChange(idx, 'rate', e.target.value)}
                  style={{ width: '94%', textAlign: 'center' }}
                  className="txtinput"
                />
              </td>
              <td align="right" style={{ width: '15%' }}>
                <span style={{ width: '94%' }}>{getTotalAmount(row)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table width="100%" className="tbl">
        <tbody>
          <tr>
            <td colSpan={6} align="right"><strong>Sub Total</strong>:</td>
            <td align="right" colSpan={2}><span style={{ width: '94%' }}>{subTotal}</span></td>
          </tr>
          <tr>
            <td colSpan={6} align="right"><strong>Disc</strong>:</td>
            <td align="right">
              <input
                type="text"
                value={disc}
                onChange={e => isDecimal(e.target.value) && setDisc(e.target.value)}
                style={{ width: '100px' }}
                className="txtinput"
              />
            </td>
            <td>%</td>
          </tr>
          <tr>
            <td colSpan={6} align="right" style={{ width: '85%' }}><strong>Total</strong>:</td>
            <td align="right" style={{ width: '15%' }} colSpan={2}>
              <span style={{ width: '94%', fontWeight: 'bold' }}>{total}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SalesCalculator; 