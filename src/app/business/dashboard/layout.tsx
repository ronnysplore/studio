// src/app/business/dashboard/layout.tsx
"use client";

import { BusinessAssetProvider } from '@/contexts/business-asset-context';
import DashboardLayout from '@/app/dashboard/layout';

export default function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <BusinessAssetProvider>
          {children}
      </BusinessAssetProvider>
    </DashboardLayout>
  );
}
