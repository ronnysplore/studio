// src/app/dashboard/wardrobe/page.tsx
"use client";

import { usePathname } from "next/navigation";
import WardrobeManager from "@/components/dashboard/wardrobe-manager";
import AssetManager from "@/components/business/asset-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WardrobePage() {
  const pathname = usePathname();
  const isBusinessPath = pathname.startsWith('/business');

  if (isBusinessPath) {
    return (
      <div className="animate-fade-in">
        <AssetManager />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
       <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
          <TabsTrigger value="personal">Personal Wardrobe</TabsTrigger>
          <TabsTrigger value="business">Business Assets</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <WardrobeManager />
        </TabsContent>
        <TabsContent value="business">
          <AssetManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
