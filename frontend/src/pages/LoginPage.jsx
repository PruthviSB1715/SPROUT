import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import sproutLogo from '../assets/branding/sprout-logo.png';
import sproutWordmark from '../assets/branding/sprout-wordmark.png';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(ROLES.FARMER);
  const [identifier, setIdentifier] = useState('farmer@smartfarm.ai');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === ROLES.FARMER) setIdentifier('farmer@smartfarm.ai');
    else if (role === ROLES.FIELD_AGENT) setIdentifier('agent@smartfarm.ai');
    else if (role === ROLES.KRISHI_ADHIKARI) setIdentifier('adhikari@smartfarm.ai');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(selectedRole, { identifier, password });
      setLoading(false);
      if (selectedRole === ROLES.KRISHI_ADHIKARI) {
        navigate('/validation');
      } else if (selectedRole === ROLES.FIELD_AGENT) {
        navigate('/rover');
      } else {
        navigate('/dashboard');
      }
    }, 400);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-gutter relative overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCUzozKVz5zy0OpCbs1YOIMw6Odn1mMozEetDoAmwsFXMY8ywWJjxYLLHuy0qolOF1NQLrKEe293koZlRX_Y4isoF9nEPr-woAf1uN4ykA-lLElP7ucCXAZK0cIEGc2yoMj64ajtb4RiSlggmy1_PnM1gxXswOTtx3kf7milh2rFxI7ofpb5ZqSj4ssy2lij71NMlJS2-InQN95hQvRLKE1U3Y3MMusIsnJtV0PCQHWRFq2ySmEwsVt")`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface/90 via-surface/80 to-surface-container-highest/90" />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-overlay p-container-margin md:p-xl flex flex-col gap-lg border border-surface-container-highest">
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center gap-xs">
          <div className="flex items-center justify-center mb-1">
            <img src={sproutLogo} alt="SPROUT Logo" className="w-20 h-20 object-contain drop-shadow-xs" />
          </div>
          <img src={sproutWordmark} alt="SPROUT" className="h-9 object-contain mx-auto" />
          <p className="font-label-md text-[11px] text-primary font-bold tracking-wider uppercase">
            Smart Farm Rover AI
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Welcome back. Please select your role and sign in.
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex flex-col gap-sm">
          <label className="font-label-md text-label-md text-on-surface uppercase text-center block w-full mb-xs tracking-wider">
            Select Role
          </label>
          <div className="grid grid-cols-3 gap-xs p-1 bg-surface-container-low rounded-lg border border-surface-variant">
            {/* Farmer */}
            <button
              type="button"
              onClick={() => handleRoleSelect(ROLES.FARMER)}
              className={`flex flex-col items-center justify-center p-sm rounded-md transition-all ${
                selectedRole === ROLES.FARMER
                  ? 'bg-surface shadow-xs border border-primary/30 text-primary font-bold'
                  : 'hover:bg-surface-variant text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-xl mb-1">grass</span>
              <span className="font-label-md text-label-md text-center leading-tight">Farmer</span>
            </button>

            {/* Field Agent */}
            <button
              type="button"
              onClick={() => handleRoleSelect(ROLES.FIELD_AGENT)}
              className={`flex flex-col items-center justify-center p-sm rounded-md transition-all ${
                selectedRole === ROLES.FIELD_AGENT
                  ? 'bg-surface shadow-xs border border-primary/30 text-primary font-bold'
                  : 'hover:bg-surface-variant text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-xl mb-1">support_agent</span>
              <span className="font-label-md text-label-md text-center leading-tight">Agri Agent</span>
            </button>

            {/* Adhikari */}
            <button
              type="button"
              onClick={() => handleRoleSelect(ROLES.KRISHI_ADHIKARI)}
              className={`flex flex-col items-center justify-center p-sm rounded-md transition-all ${
                selectedRole === ROLES.KRISHI_ADHIKARI
                  ? 'bg-surface shadow-xs border border-primary/30 text-primary font-bold'
                  : 'hover:bg-surface-variant text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-xl mb-1">local_police</span>
              <span className="font-label-md text-label-md text-center leading-tight">Adhikari</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* Email/Mobile Field */}
          <div className="flex flex-col gap-xs">
            <label className="font-body-sm text-body-sm font-bold text-on-surface" htmlFor="identifier">
              Email or Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your credentials"
                className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-xs">
            <div className="flex justify-between items-center">
              <label className="font-body-sm text-body-sm font-bold text-on-surface" htmlFor="password">
                Password
              </label>
              <a href="#forgot" className="font-label-md text-label-md text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">lock</span>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md text-on-surface transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface cursor-pointer"
            />
            <label htmlFor="remember" className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-bold py-3 px-4 rounded-lg shadow-card hover:shadow-overlay transition-all flex items-center justify-center gap-2 mt-sm"
          >
            {loading ? 'Signing in...' : 'Sign In securely'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </form>

        {/* Demo Note */}
        <div className="text-center pt-sm border-t border-surface-variant">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            SIH Prototype — <span className="font-semibold text-primary">Mock Auth Mode Active</span>
          </p>
        </div>
      </div>
    </div>
  );
}
