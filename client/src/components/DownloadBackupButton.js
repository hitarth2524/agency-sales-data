import React, { useState } from "react";
import axios from "axios";

const api = process.env.REACT_APP_API_URL;

const DownloadBackupButton = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [hover, setHover] = useState(false);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `${api}/api/backup`;
      const params = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      if (params.length) url += "?" + params.join("&");

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", "backup.json");
      document.body.appendChild(dlAnchorElem);
      dlAnchorElem.click();
      dlAnchorElem.remove();
    } catch (err) {
      alert("Backup download failed: " + (err.response?.data?.msg || err.message));
    }
  };

  // Custom styles
  const buttonStyle = {
    padding: "7px 18px",
    background: hover
      ? "linear-gradient(90deg, #1976d2 0%, #1976d2 100%)"
      : "linear-gradient(90deg, #43a047 0%, #43e97b 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "24px",
    fontWeight: "bold",
    fontSize: 15,
    cursor: "pointer",
    margin: "10px 0",
    boxShadow: hover
      ? "0 4px 16px 0 rgba(25,118,210,0.18), 0 1px 4px 0 rgba(102,126,234,0.12)"
      : "0 1px 6px 0 rgba(67,233,123,0.10)",
    outline: "none",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.22s cubic-bezier(.4,2,.3,1)",
    transform: hover ? "scale(1.05)" : "scale(1)",
    letterSpacing: 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 8
  };

  const iconStyle = {
    width: 18,
    height: 18,
    marginRight: 3,
    filter: hover ? "drop-shadow(0 0 4px #1976d2)" : "drop-shadow(0 0 4px #43e97b)",
    transition: "filter 0.3s"
  };

  const dateInputStyle = {
    marginRight: 8,
    padding: "5px 10px",
    borderRadius: 12,
    border: "1.2px solid #764ba2",
    fontSize: 13,
    outline: hover ? "2px solid #1976d2" : "none",
    background: hover
      ? "linear-gradient(90deg, #e3f2fd 0%, #e3f2fd 100%)"
      : "#fff",
    color: "#333",
    boxShadow: hover ? "0 0 6px 1px #1976d2" : "0 1px 4px 0 rgba(67,233,123,0.08)",
    transition: "all 0.22s cubic-bezier(.4,2,.3,1)"
  };

  return (
    <div style={{ display: "inline-block", marginRight: 8 }}>
      <input
        type="date"
        value={from}
        onChange={e => setFrom(e.target.value)}
        style={dateInputStyle}
        title="From date"
      />
      <input
        type="date"
        value={to}
        onChange={e => setTo(e.target.value)}
        style={dateInputStyle}
        title="To date"
      />
      <button
        onClick={handleDownload}
        style={buttonStyle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* SVG download icon */}
        <svg style={iconStyle} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="4" y="17" width="16" height="4" rx="2" fill="#fff" fillOpacity=".18"/>
        </svg>
        Download My Backup
        {/* Shine effect */}
        <span style={{
          content: "",
          position: "absolute",
          top: 0,
          left: hover ? "100%" : "-60%",
          width: "60%",
          height: "100%",
          background: "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.18) 100%)",
          transform: hover ? "translateX(-120%)" : "none",
          transition: "left 0.5s, transform 0.5s"
        }} />
      </button>
    </div>
  );
};

export default DownloadBackupButton; 