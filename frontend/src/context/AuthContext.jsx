import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
  FARMER: 'FARMER',
  FIELD_AGENT: 'FIELD_AGENT',
  KRISHI_ADHIKARI: 'KRISHI_ADHIKARI',
};

const MOCK_USERS = {
  [ROLES.FARMER]: {
    id: 'usr_farmer_01',
    name: 'Rajesh Kumar',
    role: ROLES.FARMER,
    roleTitle: 'Farmer / Farm Owner',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABzgdO7wRgGq0_Ly_xXGaGwPy4lNdHvySrkrsx1bRuYoQ8E0CZttcsykzMjOsf1cdee_tRBRcoRc1UndibeVavkaX5-V74dEj8OWaxvPquQgvf9Wi0j9_zIJ4xs2zws8LHaMZscLriQT8mBWavKPRNgVlTnP3HFxapUYTPH4hHz9IFNm5CuChsO09l3KTinYQD5HTP_mL6nupwQf7xEWCrhXmOH-JWsWktngSqer6r9YYEeLnYyfMl',
    farmName: 'North Field Farm',
    location: 'Sector 4B',
  },
  [ROLES.FIELD_AGENT]: {
    id: 'usr_agent_01',
    name: 'Amit Patel',
    role: ROLES.FIELD_AGENT,
    roleTitle: 'Agri Field Agent',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi0ZhBUmAIimL96mS7STzvN7mk8XAOsTB8s6MpUN6-tbK7XrnU-HPag-i_eQAvThJPjkY2OQUCVks7upfFvXh6tvnekObQSIGS7CD4ygohnQt3WKNQkfLob-j1gyqG10ET3zObfaZKFVHrCoMF8wFvi74XjKPhGeBr5oqpMrKPyAjK6RQTA0Q6gf4-dVqRSwXgk6OacnXtfuv77kY714LO9BI1Bj-6Iyy88TO6KupnsgXo8LGKaNSm',
    farmName: 'Rover Operation Base',
    location: 'All Sectors',
  },
  [ROLES.KRISHI_ADHIKARI]: {
    id: 'usr_adhikari_01',
    name: 'Dr. Vikram Sharma',
    role: ROLES.KRISHI_ADHIKARI,
    roleTitle: 'Senior Krishi Adhikari',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUzozKVz5zy0OpCbs1YOIMw6Odn1mMozEetDoAmwsFXMY8ywWJjxYLLHuy0qolOF1NQLrKEe293koZlRX_Y4isoF9nEPr-woAf1uN4ykA-lLElP7ucCXAZK0cIEGc2yoMj64ajtb4RiSlggmy1_PnM1gxXswOTtx3kf7milh2rFxI7ofpb5ZqSj4ssy2lij71NMlJS2-InQN95hQvRLKE1U3Y3MMusIsnJtV0PCQHWRFq2ySmEwsVt',
    farmName: 'Agricultural Validation Hub',
    location: 'District Center',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_farm_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[ROLES.FARMER];
  });

  const [activeRole, setActiveRole] = useState(user ? user.role : ROLES.FARMER);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smart_farm_user', JSON.stringify(user));
      setActiveRole(user.role);
    } else {
      localStorage.removeItem('smart_farm_user');
    }
  }, [user]);

  const login = (role = ROLES.FARMER, credentials = {}) => {
    const mockUser = MOCK_USERS[role] || MOCK_USERS[ROLES.FARMER];
    setUser(mockUser);
    setActiveRole(mockUser.role);
    return mockUser;
  };

  const switchRole = (role) => {
    if (MOCK_USERS[role]) {
      setUser(MOCK_USERS[role]);
      setActiveRole(role);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('smart_farm_user');
  };

  const hasRole = (...roles) => roles.includes(activeRole);

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        hasRole,
        ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
