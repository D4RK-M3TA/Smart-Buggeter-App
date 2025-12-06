import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [billSplitEnabled, setBillSplitEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        billSplitEnabled={billSplitEnabled}
        onBillSplitToggle={setBillSplitEnabled}
      />
      <main className="ml-64 min-h-screen">
        <div className="container py-8 px-6 max-w-7xl">
          <Outlet context={{ billSplitEnabled }} />
        </div>
      </main>
    </div>
  );
}
