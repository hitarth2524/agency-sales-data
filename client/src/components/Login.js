import React, { useState, useRef } from 'react';
import axios from 'axios';

const api = process.env.REACT_APP_API_URL;
console.log(api);

const AnimatedCheckmark = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" style={{ display: 'block', margin: '24px auto' }}>
    <circle cx="30" cy="30" r="28" fill="none" stroke="#43a047" strokeWidth="4" opacity="0.2" />
    <polyline
      points="18,32 28,42 44,22"
      fill="none"
      stroke="#43a047"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: 40,
        strokeDashoffset: 40,
        animation: 'checkmark 0.8s 0.2s forwards',
      }}
    />
    <style>{`
      @keyframes checkmark {
        to { stroke-dashoffset: 0; }
      }
    `}</style>
  </svg>
);

const Login = ({ onLogin, children }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focus, setFocus] = useState({ username: false, password: false });
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const rippleRefs = { username: useRef(null), password: useRef(null) };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${api}/api/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      setSuccess(true);
      setTimeout(() => {
        setLoading(false);
        setSuccess(false);
        if (onLogin) onLogin(res.data.user);
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg || 'Login failed. Please try again.'
      );
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  // Ripple effect handler
  const handleRipple = (e, field) => {
    const ripple = rippleRefs[field].current;
    if (!ripple) return;
    const rect = ripple.parentNode.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    ripple.classList.remove('ripple-animate');
    void ripple.offsetWidth; // force reflow
    ripple.classList.add('ripple-animate');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      transition: 'background 0.6s',
      position: 'relative',
      overflow: 'hidden',
      padding: '16px',
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        opacity: 0.1,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" style={{ animation: 'float 20s ease-in-out infinite' }}>
          <defs>
            <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#667eea" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="200" r="150" fill="url(#bgGrad)" />
          <circle cx="800" cy="300" r="100" fill="url(#bgGrad)" />
          <circle cx="400" cy="700" r="120" fill="url(#bgGrad)" />
        </svg>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '450px',
        padding: '32px',
        borderRadius: '24px',
        background: 'rgba(35,37,38,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid rgba(118, 75, 162, 0.3)',
        transition: 'all 0.4s ease',
        zIndex: 1,
        animation: shake ? 'shake 0.6s' : 'fadeInUp 0.8s ease-out',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            color: '#fff',
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '1px',
            margin: 0,
            textShadow: '0 2px 8px rgba(118, 75, 162, 0.5)',
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px',
            margin: '8px 0 0 0',
            fontWeight: 400,
          }}>
            Sign in to your account
          </p>
        </div>

        {success && <AnimatedCheckmark />}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          style={{
            opacity: success ? 0.3 : 1,
            pointerEvents: success ? 'none' : 'auto',
            transition: 'opacity 0.4s',
          }}
        >
          {/* Username Field */}
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{
                position: 'absolute',
                left: '16px',
                zIndex: 2,
                fill: focus.username ? '#43a047' : 'rgba(255, 255, 255, 0.6)',
                transition: 'fill 0.3s ease',
              }}>
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
              </svg>
              
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                onFocus={() => setFocus(f => ({ ...f, username: true }))}
                onBlur={() => setFocus(f => ({ ...f, username: false }))}
                onClick={e => handleRipple(e, 'username')}
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  borderRadius: '12px',
                  border: focus.username ? '2px solid #43a047' : '2px solid rgba(118, 75, 162, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: focus.username ? '0 0 0 4px rgba(67, 160, 71, 0.1)' : 'none',
                }}
                onMouseOver={e => {
                  if (!focus.username) {
                    e.target.style.border = '2px solid rgba(118, 75, 162, 0.6)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseOut={e => {
                  if (!focus.username) {
                    e.target.style.border = '2px solid rgba(118, 75, 162, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              />
            </div>
            <span ref={rippleRefs.username} className="ripple" style={{
              position: 'absolute',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: 0,
              background: 'rgba(118, 75, 162, 0.3)',
              zIndex: 1,
              transform: 'scale(0)',
              transition: 'all 0.6s ease',
            }} />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '32px', position: 'relative' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{
                position: 'absolute',
                left: '16px',
                zIndex: 2,
                fill: focus.password ? '#43a047' : 'rgba(255, 255, 255, 0.6)',
                transition: 'fill 0.3s ease',
              }}>
                <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v2a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zm-8-2a4 4 0 0 1 8 0v2H6V9z"/>
              </svg>
              
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                onFocus={() => setFocus(f => ({ ...f, password: true }))}
                onBlur={() => setFocus(f => ({ ...f, password: false }))}
                onClick={e => handleRipple(e, 'password')}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '16px 48px 16px 48px',
                  borderRadius: '12px',
                  border: focus.password ? '2px solid #43a047' : '2px solid rgba(118, 75, 162, 0.3)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: focus.password ? '0 0 0 4px rgba(67, 160, 71, 0.1)' : 'none',
                }}
                onMouseOver={e => {
                  if (!focus.password) {
                    e.target.style.border = '2px solid rgba(118, 75, 162, 0.6)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseOut={e => {
                  if (!focus.password) {
                    e.target.style.border = '2px solid rgba(118, 75, 162, 0.3)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={e => {
                  e.target.style.background = 'none';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{
                  fill: 'rgba(255, 255, 255, 0.6)',
                  transition: 'fill 0.2s ease',
                }}>
                  {showPassword ? (
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  ) : (
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  )}
                </svg>
              </button>
            </div>
            <span ref={rippleRefs.password} className="ripple" style={{
              position: 'absolute',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: 0,
              background: 'rgba(118, 75, 162, 0.3)',
              zIndex: 1,
              transform: 'scale(0)',
              transition: 'all 0.6s ease',
            }} />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              color: '#f44336',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#f44336">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: loading ? 'rgba(118, 75, 162, 0.5)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(118, 75, 162, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseOver={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(118, 75, 162, 0.4)';
              }
            }}
            onMouseOut={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(118, 75, 162, 0.3)';
              }
            }}
            onMouseDown={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Children (Sign Up link) */}
        {children}

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          .ripple-animate {
            animation: ripple 0.6s ease-out;
          }
          
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
          
          @media (max-width: 480px) {
            .login-container {
              padding: 24px 20px;
              margin: 16px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Login; 