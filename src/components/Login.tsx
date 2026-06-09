import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { RESORT_LOGO_B64 } from '../data/seedPhoto';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Toggle between Login and Register views
  const [isRegisterActive, setIsRegisterActive] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Users registry state initialized with standard resort credentials
  const [users, setUsers] = useState<Array<{ username: string; password: string; email?: string }>>([
    { username: 'admin', password: 'Admin8888' },
    { username: 'admin', password: 'Admin080898' }
  ]);

  // Form states (removed default 'Admin' value as requested)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Status & feed messages
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Handle Login Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInputUser = loginUsername.trim().toLowerCase();

    const matchedUser = users.find(
      (u) => u.username.trim().toLowerCase() === normalizedInputUser && u.password === loginPassword
    );

    if (matchedUser) {
      setLoginError('');
      onLoginSuccess();
    } else {
      setLoginError('❌ Wrong credentials! Please verify Username and Password.');
      setLoginPassword('');
    }
  };

  // Handle Registration / Sign Up
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const regUser = registerUsername.trim();
    const regPass = registerPassword;
    const regEmail = registerEmail.trim();

    if (!regUser || !regPass) {
      setRegisterError('Please enter a username and password.');
      return;
    }

    // Prevent registering existing usernames
    const alreadyExists = users.some(
      (u) => u.username.trim().toLowerCase() === regUser.toLowerCase()
    );

    if (alreadyExists) {
      setRegisterError('Username already exists in the resort registry!');
      return;
    }

    // Add user to local memory
    setUsers((prev) => [...prev, { username: regUser, password: regPass, email: regEmail }]);
    setRegisterSuccess('Staff Account successfully registered!');
    setRegisterError('');

    // Reset inputs
    setRegisterUsername('');
    setRegisterEmail('');
    setRegisterPassword('');

    // Auto switch back to login tab so the user can test their credentials
    setTimeout(() => {
      setIsRegisterActive(false);
      setRegisterSuccess('');
    }, 1800);
  };

  return (
    <div className="login-container">
      <div className={`login-wrapper ${isRegisterActive ? 'active' : ''}`}>
        <span className="rotate-bg"></span>
        <span className="rotate-bg2"></span>

        {/* ==========================================
            LOGIN FORM BOX
            ========================================== */}
        <div className="form-box login">
          <h2 
            className="title animation font-sans" 
            style={{ '--i': 0, '--j': 21 } as React.CSSProperties}
          >
            Resort Login
          </h2>
          
          {loginError && (
            <div 
              className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg text-center mt-3 animate-pulse font-medium z-20"
              style={{ '--i': 0, '--j': 21 } as React.CSSProperties}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="relative z-10 mt-2">
            <div 
              className="input-box animation" 
              style={{ '--i': 1, '--j': 22 } as React.CSSProperties}
            >
              <input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required 
              />
              <label>Username</label>
              <User className="input-icon" size={18} />
            </div>

            <div 
              className="input-box animation" 
              style={{ '--i': 2, '--j': 23 } as React.CSSProperties}
            >
              <input 
                type={showLoginPassword ? 'text' : 'password'} 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
              />
              <label>Password</label>
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 focus:outline-none cursor-pointer hover:scale-110 transition-transform z-30 p-1 flex items-center justify-center text-[#d9165a] hover:text-[#ff6f91] pointer-events-auto bg-transparent border-none animate-fade-in"
                title={showLoginPassword ? "Hide password" : "Show password"}
                style={{ background: 'none', border: 'none', outline: 'none' }}
              >
                {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="btn animation flex items-center justify-center gap-1.5 font-bold" 
              style={{ '--i': 3, '--j': 24 } as React.CSSProperties}
            >
              <ShieldCheck size={18} />
              <span>Login System</span>
            </button>

            <div 
              className="linkTxt animation font-medium" 
              style={{ '--i': 5, '--j': 25 } as React.CSSProperties}
            >
              <p>
                Don't have an account?{' '}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegisterActive(true);
                  }}
                  className="register-link font-bold decoration-2"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* ==========================================
            LOGIN SIDE INFO TEXT
            ========================================== */}
        <div className="info-text login text-white">
          <div 
            className="animation flex justify-end mb-4"
            style={{ '--i': 0, '--j': 20 } as React.CSSProperties}
          >
            <div className="bg-white/10 p-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-xl w-24 h-24 flex items-center justify-center animate-pulse">
              <img src={RESORT_LOGO_B64} alt="Phe Samout Logo" className="w-20 h-20 object-contain" />
            </div>
          </div>
          <h2 
            className="animation font-serif font-extrabold uppercase tracking-wide text-white" 
            style={{ '--i': 0, '--j': 20 } as React.CSSProperties}
          >
            Phe Samout
          </h2>
          <p 
            className="animation text-white leading-relaxed text-sm opacity-90" 
            style={{ '--i': 1, '--j': 21 } as React.CSSProperties}
          >
            Experience seamless resort operations with our bespoke automated management suite.
          </p>
        </div>

        {/* ==========================================
            REGISTER FORM BOX
            ========================================== */}
        <div className="form-box register">
          <h2 
            className="title animation font-sans" 
            style={{ '--i': 17, '--j': 0 } as React.CSSProperties}
          >
            Staff Sign Up
          </h2>

          {registerError && (
            <div className="text-xs text-red-600 bg-red-100 border border-red-200 p-2 rounded-lg text-center mt-3 font-semibold z-20">
              {registerError}
            </div>
          )}

          {registerSuccess && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-200 p-2.5 rounded-lg text-center mt-3 font-bold flex items-center justify-center gap-1.5 z-20 animate-bounce">
              <CheckCircle size={15} />
              <span>{registerSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="relative z-10 mt-2">
            <div 
              className="input-box animation" 
              style={{ '--i': 18, '--j': 1 } as React.CSSProperties}
            >
              <input 
                type="text" 
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required 
              />
              <label>Username</label>
              <User className="input-icon" size={18} />
            </div>

            <div 
              className="input-box animation" 
              style={{ '--i': 19, '--j': 2 } as React.CSSProperties}
            >
              <input 
                type="email" 
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required 
              />
              <label>Email Address</label>
              <Mail className="input-icon" size={18} />
            </div>

            <div 
              className="input-box animation" 
              style={{ '--i': 20, '--j': 3 } as React.CSSProperties}
            >
              <input 
                type={showRegisterPassword ? 'text' : 'password'} 
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required 
              />
              <label>Password</label>
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 focus:outline-none cursor-pointer hover:scale-110 transition-transform z-30 p-1 flex items-center justify-center text-[#d9165a] hover:text-[#ff6f91] pointer-events-auto bg-transparent border-none animate-fade-in"
                title={showRegisterPassword ? "Hide password" : "Show password"}
                style={{ background: 'none', border: 'none', outline: 'none' }}
              >
                {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              className="btn animation flex items-center justify-center gap-1.5 font-bold" 
              style={{ '--i': 21, '--j': 4 } as React.CSSProperties}
            >
              <Sparkles size={16} />
              <span>Sign Up</span>
            </button>

            <div 
              className="linkTxt animation font-medium" 
              style={{ '--i': 22, '--j': 5 } as React.CSSProperties}
            >
              <p>
                Already have an account?{' '}
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegisterActive(false);
                  }}
                  className="login-link font-bold decoration-2"
                >
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* ==========================================
            REGISTER SIDE INFO TEXT
            ========================================== */}
        <div className="info-text register text-white">
          <div 
            className="animation flex justify-start mb-4"
            style={{ '--i': 17, '--j': 0 } as React.CSSProperties}
          >
            <div className="bg-white/10 p-2.5 rounded-full backdrop-blur-md border border-white/20 shadow-xl w-24 h-24 flex items-center justify-center animate-pulse">
              <img src={RESORT_LOGO_B64} alt="Phe Samout Logo" className="w-20 h-20 object-contain" />
            </div>
          </div>
          <h2 
            className="animation font-serif font-extrabold uppercase tracking-wide text-white" 
            style={{ '--i': 17, '--j': 0 } as React.CSSProperties}
          >
            Join Our Team
          </h2>
          <p 
            className="animation text-white leading-relaxed text-sm opacity-90" 
            style={{ '--i': 18, '--j': 1 } as React.CSSProperties}
          >
            Register a staff account to coordinate guest services, bookings, bookings calendars, and stock inventory.
          </p>
        </div>

      </div>
    </div>
  );
}
