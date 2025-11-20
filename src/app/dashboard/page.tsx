import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StyleRecommender from "@/components/dashboard/style-recommender";
import VirtualTryOn from "@/components/dashboard/virtual-try-on";
import WardrobeManager from "@/components/dashboard/wardrobe-manager";
import { Bot, Scan, Shirt } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Personal Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">
          Explore AI-powered tools to elevate your style
        </p>
      </div>
      <Tabs defaultValue="recommender" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px] h-auto p-1 bg-muted/50">
          <TabsTrigger value="recommender" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Bot className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Style Recommender</span>
            <span className="sm:hidden">Style</span>
          </TabsTrigger>
          <TabsTrigger value="try-on" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all">
            <Scan className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Virtual Try-On</span>
            <span className="sm:hidden">Try-On</span>
          </TabsTrigger>
          <TabsTrigger value="wardrobe" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
            <Shirt className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">My Wardrobe</span>
            <span className="sm:hidden">Wardrobe</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recommender" className="mt-8">
          <StyleRecommender />
        </TabsContent>
        <TabsContent value="try-on" className="mt-8">
          <VirtualTryOn />
        </TabsContent>
        <TabsContent value="wardrobe" className="mt-8">
          <WardrobeManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
