"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type GeneratedOutfit = {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink: string;
  createdTime: string;
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.accessToken) {
      loadHistory();
    }
  }, [session]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/drive?folderType=generatedOutfits");
      if (response.ok) {
        const { files } = await response.json();
        setOutfits(files);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load outfit history",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadOutfit = (outfit: GeneratedOutfit) => {
    window.open(outfit.webViewLink, "_blank");
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your outfit history</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary rounded-lg">
              <History className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Outfit History</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            View all your AI-generated try-on images saved in Google Drive
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : outfits.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <History className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No outfits yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Your generated try-on images will appear here. Head to the Virtual Try-On tab to create your first outfit!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {outfits.map((outfit) => (
              <Card key={outfit.id} className="group overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/50">
                <div className="relative aspect-[3/4] bg-muted">
                  {outfit.thumbnailLink ? (
                    <Image
                      src={outfit.thumbnailLink}
                      alt={outfit.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-accent/10">
                      <History className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="font-medium truncate mb-2">{outfit.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(outfit.createdTime).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <Button
                    onClick={() => downloadOutfit(outfit)}
                    variant="outline"
                    className="w-full hover:bg-primary hover:text-white transition-colors"
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    View/Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
