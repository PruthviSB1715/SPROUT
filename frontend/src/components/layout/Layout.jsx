import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden antialiased">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 overflow-y-auto p-gutter md:p-container-margin pb-24 md:pb-container-margin relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
