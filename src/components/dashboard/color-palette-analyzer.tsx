
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { AnalyzeColorPaletteOutput } from "@/ai/flows/analyze-color-palette";
import { Loader2, Sparkles, User, AlertCircle, Wand2, CheckCircle, Copy } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useWardrobe } from "@/contexts/wardrobe-context";
import { ScrollArea } from "../ui/scroll-area";

export default function ColorPaletteAnalyzer() {
  const [loading, setLoading] = useState(false);
  const { userPhotos, getImageDataUri } = useWardrobe();
  const [analysisResult, setAnalysisResult] = useState<AnalyzeColorPaletteOutput | null>(null);
  const { toast } = useToast();
  const [selectedUserPhoto, setSelectedUserPhoto] = useState<string>("");

  const handlePhotoSelect = (itemUrl: string) => {
    setSelectedUserPhoto(itemUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserPhoto) {
      toast({
        variant: "destructive",
        title: "No Photo Selected",
        description: "Please select one of your photos to analyze."
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const userImageDataUri = await getImageDataUri(selectedUserPhoto);

      const response = await fetch('/api/color-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userImageDataUri }),
      });
      const result = await response.json();

      if (!response.ok || 'error' in result) {
        throw new Error(result?.error || 'Failed to analyze color palette.');
      } 
      
      setAnalysisResult(result);
      toast({ title: "Success!", description: "Your color palette has been analyzed." });

    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to analyze colors.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast({ description: `Copied ${hex} to clipboard!` });
  }

  const hasPrerequisites = userPhotos.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="border-2 hover:border-primary/50 transition-all shadow-lg sticky top-24">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Color Palette Analyzer</CardTitle>
              <CardDescription className="text-base mt-1">
                Discover your most flattering colors based on your photo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!hasPrerequisites && (
            <Alert className="mb-6 border-accent/50 bg-accent/10">
              <AlertCircle className="h-5 w-5 text-accent-foreground" />
              <AlertTitle className="font-semibold">Upload a Photo First</AlertTitle>
              <AlertDescription>
                To analyze your palette, please add a clear, well-lit photo of yourself in the{" "}
                <Link href="/dashboard/wardrobe" className="font-medium underline text-accent-foreground">
                  My Wardrobe
                </Link>{" "}
                tab.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">1. Select Your Photo</h3>
              <p className="text-sm text-muted-foreground mb-3">For best results, choose a clear, front-facing photo in natural lighting.</p>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                  <div className="flex space-x-4">
                      {userPhotos.length > 0 ? userPhotos.map(photo => (
                          <div key={photo.id} className="relative aspect-[3/4] h-36 flex-shrink-0" onClick={() => handlePhotoSelect(photo.url)}>
                              <Image src={photo.url} alt={photo.fileName} fill className={cn("object-cover rounded-md cursor-pointer transition-all border-4", selectedUserPhoto === photo.url ? "border-primary" : "border-transparent")} />
                              {selectedUserPhoto === photo.url && (
                              <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                                  <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                              )}
                          </div>
                      )) : (
                          <div className="flex flex-col items-center justify-center w-full h-36 text-muted-foreground">
                              <User className="w-10 h-10 mb-2"/>
                              <p>Your photos will appear here.</p>
                          </div>
                      )}
                  </div>
              </ScrollArea>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !hasPrerequisites || !selectedUserPhoto}
              className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
              {loading ? 'Analyzing...' : 'Analyze My Colors'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-center">2. Discover Your Palette!</h3>
        <Card className="relative w-full min-h-[500px] aspect-[4/5] rounded-xl border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden shadow-inner">
            {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Our AI is analyzing your colors...</p>
            </div>
            ) : analysisResult ? (
              <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-center items-center animate-fade-in text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">{analysisResult.season}</h2>
                <div className="flex flex-wrap justify-center gap-2 my-4">
                  {analysisResult.palette.map(color => (
                    <div key={color} className="group relative">
                      <div 
                        style={{ backgroundColor: color }} 
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/50 shadow-md transition-transform group-hover:scale-110 cursor-pointer"
                        onClick={() => handleCopy(color)}
                      />
                      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-foreground text-background px-2 py-1 rounded-md text-xs">
                        {color} <Copy className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollArea className="h-48 mt-4">
                  <p className="text-muted-foreground leading-relaxed text-left p-4">{analysisResult.description}</p>
                </ScrollArea>
              </div>
            ) : (
            <div className="text-center text-muted-foreground p-6">
                <Sparkles className="mx-auto h-12 w-12 mb-2 text-primary" />
                <p className="text-base font-medium">Your personalized color palette will appear here.</p>
            </div>
            )}
        </Card>
      </div>
    </div>
  );
}
