
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, CheckCircle, User, Shirt, AlertCircle, Info, Download } from "lucide-react";
import { useWardrobe } from "@/contexts/wardrobe-context";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const generationSteps = [
    "Warming up the AI stylist...",
    "Analyzing your photo...",
    "Selecting the perfect outfit...",
    "Draping the virtual fabric...",
    "Adjusting for a perfect fit...",
    "Rendering the final image...",
    "Almost there...",
];

const DAILY_LIMIT = 3;

export default function VirtualTryOn() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(generationSteps[0]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { userPhotos, wardrobeItems, getImageDataUri } = useWardrobe();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [selectedUserPhoto, setSelectedUserPhoto] = useState<string>("");
  const [selectedWardrobeItems, setSelectedWardrobeItems] = useState<string[]>([]);
  
  const [generationCount, setGenerationCount] = useState(0);
  const [isLimitLoading, setIsLimitLoading] = useState(true);

  const fetchGenerationCount = async () => {
    if (!session) return;
    setIsLimitLoading(true);
    try {
      const response = await fetch('/api/user/limit');
      if (response.ok) {
        const data = await response.json();
        setGenerationCount(data.count);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch daily generation limit.' });
      }
    } catch (error) {
      console.error("Could not fetch daily generation limit", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch daily generation limit.' });
    } finally {
      setIsLimitLoading(false);
    }
  };

  useEffect(() => {
    fetchGenerationCount();
  }, [session]);


  const canGenerate = generationCount < DAILY_LIMIT;

  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (loading) {
          let i = 0;
          setLoadingText(generationSteps[i]);
          interval = setInterval(() => {
              i = (i + 1) % generationSteps.length;
              setLoadingText(generationSteps[i]);
          }, 2500);
      }
      return () => clearInterval(interval);
  }, [loading]);

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `style-ai-try-on-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWardrobeSelect = (itemUrl: string) => {
    setSelectedWardrobeItems(prev => 
      prev.includes(itemUrl) ? prev.filter(url => url !== itemUrl) : [...prev, itemUrl]
    );
  };
  
  const handlePhotoSelect = (itemUrl: string) => {
    setSelectedUserPhoto(itemUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserPhoto || selectedWardrobeItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Selections",
        description: "Please select your photo and at least one wardrobe item.",
      });
      return;
    }
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to generate a virtual try-on.",
      });
      return;
    }

    if (!canGenerate) {
      toast({
        variant: "destructive",
        title: "Daily Limit Reached",
        description: `You have reached your daily limit of ${DAILY_LIMIT} generations. Please try again tomorrow.`,
      });
      return;
    }

    setLoading(true);
    setResultImage(null);

    try {
      const userPhotoDataUri = await getImageDataUri(selectedUserPhoto);
      
      const outfitImageDataUris = await Promise.all(
        selectedWardrobeItems.map(url => getImageDataUri(url))
      );

      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPhotoDataUri, outfitImageDataUris }),
      });

      const result = await response.json();

      if (!response.ok || "error" in result) {
        throw new Error(result?.error || "Failed to generate try-on");
      }
      
      // Increment count on server
      await fetch('/api/user/limit', { method: 'POST' });
      setGenerationCount(prev => prev + 1);


      const generatedImage = result.tryOnImageDataUri || null;
      setResultImage(generatedImage);

      if (generatedImage && session?.accessToken) {
        await fetch('/api/save-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUri: generatedImage, fileName: `try-on-${Date.now()}.png` }),
        });
        toast({ title: "Success!", description: "Try-on generated and saved to your history." });
      } else {
        toast({ title: "Success!", description: "Try-on generated successfully." });
      }

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const hasPrerequisites = userPhotos.length > 0 && wardrobeItems.length > 0;

  return (
    <Card className="w-full mx-auto border-2 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">AI Magic Try-On</h1>
            <p className="text-lg text-muted-foreground mt-2">Visualize how different clothing items look on your photo.</p>
        </div>
        
        {!hasPrerequisites && (
            <Alert className="mb-6 max-w-2xl mx-auto border-accent/50 bg-accent/10">
              <AlertCircle className="h-5 w-5 text-accent-foreground" />
              <AlertTitle className="font-semibold">Upload Your Photos First</AlertTitle>
              <AlertDescription>
                To get started, please add photos of yourself and your clothing in the{" "}
                <Link href="/dashboard/wardrobe" className="font-medium underline text-accent-foreground">
                  My Wardrobe
                </Link>{" "}
                tab.
              </AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-3">1. Select Your Photo</h3>
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
                
                <div>
                    <h3 className="font-semibold text-lg mb-3">2. Select Wardrobe Item(s)</h3>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                        <div className="flex space-x-4">
                            {wardrobeItems.length > 0 ? wardrobeItems.map(item => (
                                <div key={item.id} className="relative aspect-square h-36 flex-shrink-0" onClick={() => handleWardrobeSelect(item.url)}>
                                    <Image src={item.url} alt={item.fileName} fill className={cn("object-cover rounded-md cursor-pointer transition-all border-4", selectedWardrobeItems.includes(item.url) ? "border-primary" : "border-transparent")} />
                                    {selectedWardrobeItems.includes(item.url) && (
                                    <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    )}
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center w-full h-36 text-muted-foreground">
                                    <Shirt className="w-10 h-10 mb-2"/>
                                    <p>Your wardrobe items will appear here.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Daily Limit</AlertTitle>
                  <AlertDescription>
                    {isLimitLoading ? (
                      'Loading your limit...'
                    ) : (
                      `You can generate ${Math.max(0, DAILY_LIMIT - generationCount)} more image${DAILY_LIMIT - generationCount !== 1 ? 's' : ''} today. Your limit will reset tomorrow.`
                    )}
                  </AlertDescription>
                </Alert>

                <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !selectedUserPhoto || selectedWardrobeItems.length === 0 || !canGenerate || isLimitLoading} 
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
                >
                    {loading ? 'Generating...' : 'Generate Try-On Image'}
                    <Wand2 className="h-5 w-5" />
                </Button>
            </div>

            <div className="space-y-4 sticky top-24">
                 <h3 className="font-semibold text-lg text-center">3. See The Magic Happen!</h3>
                <div className="relative w-full aspect-[4/5] rounded-xl border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden shadow-inner">
                    {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium animate-fade-in">{loadingText}</p>
                    </div>
                    ) : resultImage ? (
                    <Image src={resultImage} alt="Virtual try-on result" fill className="object-cover animate-fade-in" />
                    ) : (
                    <div className="text-center text-muted-foreground p-6">
                        <Wand2 className="mx-auto h-12 w-12 mb-2 text-primary" />
                        <p className="text-base font-medium">Your Virtual Try-On will appear here!</p>
                    </div>
                    )}
                </div>
                {resultImage && !loading && (
                  <Button onClick={handleDownload} className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    