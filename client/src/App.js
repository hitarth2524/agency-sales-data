import React from 'react';
import ModernSalesCalculator from './components/ModernSalesCalculator';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';
import { CopySaleContext } from './components/CopySaleContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import DownloadBackupButton from './components/DownloadBackupButton';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // blue
    },
    secondary: {
      main: '#ab47bc', // purple
    },
    success: {
      main: '#43a047', // green
    },
    warning: {
      main: '#ffa726', // orange
    },
    background: {
      default: '#f3f6fb',
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Roboto, Arial',
    fontWeightBold: 700,
    h5: {
      fontWeight: 700,
      color: '#1976d2',
    },
    h6: {
      fontWeight: 700,
      color: '#ab47bc',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            fontSize: '14px',
            padding: '8px 16px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            fontSize: '14px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            margin: '8px',
            padding: '16px',
          },
        },
      },
    },
  },
});

function App() {
  const [copySaleData, setCopySaleData] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [authMode, setAuthMode] = React.useState('login'); // 'login' or 'signup'

  React.useEffect(() => {
    // Try to load user from token (optional: decode token for username/email)
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally, decode token for user info
      setUser({}); // Just mark as logged in
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App" style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'none',
          padding: '16px'
        }}>
          {authMode === 'login' ? (
            <Login onLogin={setUser}>
              <div style={{ 
                width: '100%', 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                animation: 'fadeInSwitch 0.7s ease-out' 
              }}>
                <div style={{ 
                  width: '80%', 
                  height: '1px', 
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', 
                  marginBottom: '16px', 
                  animation: 'fadeInSwitch 0.7s ease-out' 
                }} />
                <button
                  onClick={() => setAuthMode('signup')}
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    padding: '14px 24px',
                    width: '100%',
                    boxShadow: '0 4px 16px rgba(118, 75, 162, 0.3)',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    animation: 'fadeInSwitch 0.7s ease-out',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseOver={e => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(118, 75, 162, 0.4)';
                  }}
                  onMouseOut={e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(118, 75, 162, 0.3)';
                  }}
                  onMouseDown={e => e.target.style.transform = 'translateY(0)'}
                >
                  Create a new account
                </button>
                <style>{`
                  @keyframes fadeInSwitch {
                    from { 
                      opacity: 0; 
                      transform: translateY(20px); 
                    }
                    to { 
                      opacity: 1; 
                      transform: translateY(0); 
                    }
                  }
                `}</style>
              </div>
            </Login>
          ) : (
            <SignUp onSignUp={setUser}>
              <div style={{ 
                width: '100%', 
                marginTop: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                animation: 'fadeInSwitch 0.7s ease-out' 
              }}>
                <div style={{ 
                  width: '80%', 
                  height: '1px', 
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', 
                  marginBottom: '16px', 
                  animation: 'fadeInSwitch 0.7s ease-out' 
                }} />
                <button
                  onClick={() => setAuthMode('login')}
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    padding: '14px 24px',
                    width: '100%',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                    cursor: 'pointer',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    animation: 'fadeInSwitch 0.7s ease-out',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseOver={e => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseDown={e => e.target.style.transform = 'translateY(0)'}
                >
                  Already have an account? Sign In
                </button>
                <style>{`
                  @keyframes fadeInSwitch {
                    from { 
                      opacity: 0; 
                      transform: translateY(20px); 
                    }
                    to { 
                      opacity: 1; 
                      transform: translateY(0); 
                    }
                  }
                `}</style>
              </div>
            </SignUp>
          )}
        </div>
      </ThemeProvider>
    );
  }

  return (
    <CopySaleContext.Provider value={{ copySaleData, setCopySaleData }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App" style={{ marginTop: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: { xs: 8, sm: 12, md: 16 },
            flexWrap: 'wrap',
            gap: { xs: 8, sm: 12 }
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 8, sm: 12 },
              flexWrap: 'wrap'
            }}>
              <DownloadBackupButton />
            </div>
            <button
              onClick={handleLogout}
              style={{
                color: '#fff',
                background: '#111',
                border: 'none',
                borderRadius: '999px', // pill shape
                padding: '7px 18px', // smaller padding
                fontWeight: 'bold',
                fontSize: '14px', // smaller font
                cursor: 'pointer',
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.12)',
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6, // smaller gap
                letterSpacing: 1,
                transition: 'background 0.22s cubic-bezier(.4,2,.3,1), transform 0.18s, box-shadow 0.18s',
                minWidth: 'fit-content',
                marginRight: '24px',
                marginLeft: '130px', // Added left margin for spacing
              }}
              onMouseEnter={e => {
                e.target.style.background = '#ff1744';
                e.target.style.transform = 'scale(1.06)';
                e.target.style.boxShadow = '0 6px 24px 0 rgba(255,23,68,0.18)';
              }}
              onMouseLeave={e => {
                e.target.style.background = '#111';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 12px 0 rgba(0,0,0,0.12)';
              }}
            >
              {/* Logout icon */}
              <svg style={{ width: 16, height: 16, marginRight: 6 }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="4" width="8" height="16" rx="3" fill="#fff" fillOpacity=".13"/>
              </svg>
              <span style={{ color: '#fff', background: 'none', fontWeight: 'bold', fontSize: '14px', letterSpacing: 1, padding: 0, margin: 0, display: 'inline' }}>Logout</span>
            </button>
          </div>
          <div style={{ marginTop: '32px' }}>
            <ModernSalesCalculator />
          </div>
        </div>
      </ThemeProvider>
    </CopySaleContext.Provider>
  );
}

export default App;
