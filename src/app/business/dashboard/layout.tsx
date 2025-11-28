// src/app/business/dashboard/layout.tsx
"use client";

import DashboardLayout from '@/app/dashboard/layout';
import { BusinessAssetProvider } from '@/contexts/business-asset-context';

export default function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
        {children}
    </DashboardLayout>
  );
}
