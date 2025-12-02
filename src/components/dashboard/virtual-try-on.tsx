
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, CheckCircle, User, Shirt, Download, Sparkles, Building2, MessageCircle } from "lucide-react";
import { useWardrobe } from "@/contexts/wardrobe-context";
import { useBusinessAssets } from "@/contexts/business-asset-context";
import { useSession } from "next-auth/react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const generationSteps = [
    "Warming up the AI stylist...",
    "Analyzing your photo...",
    "Selecting the perfect outfit...",
    "Draping the virtual fabric...",
    "Adjusting for a perfect fit...",
    "Rendering the final image...",
    "Almost there...",
];

const PRESET_INSTRUCTIONS = [
  "Business Casual",
  "Date Night",
  "Workout",
  "Travel",
  "Party",
  "Minimalist",
  "Bohemian",
  "Edgy",
  "Classic",
  "Seasonal"
];

const DAILY_LIMIT = 3;

// Personal Try-On Component
function PersonalTryOn() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(generationSteps[0]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { userPhotos, wardrobeItems, getImageDataUri } = useWardrobe();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [selectedUserPhoto, setSelectedUserPhoto] = useState<string>("");
  const [selectedWardrobeItems, setSelectedWardrobeItems] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  
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
  const remainingGenerations = Math.max(0, DAILY_LIMIT - generationCount);

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
        body: JSON.stringify({ 
          userPhotoDataUri, 
          outfitImageDataUris,
          customInstructions: customInstructions.trim() || undefined
        }),
      });

      const result = await response.json();

      if (!response.ok || "error" in result) {
        throw new Error(result?.error || "Failed to generate try-on");
      }
      
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
  
  

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left Panel - Selections */}
      <div className="flex-1 flex flex-col min-w-0 lg:max-w-md">
        {/* Header with limit badge */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Personal Try-On</h2>
          <Badge variant={canGenerate ? "secondary" : "destructive"} className="text-xs">
            {isLimitLoading ? "..." : `${remainingGenerations}/${DAILY_LIMIT} left today`}
          </Badge>
        </div>

        {/* Selection sections */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Your Photo */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm font-medium">Your Photo</span>
              {selectedUserPhoto && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
            </div>
            <ScrollArea className="flex-1 rounded-lg border bg-muted/20">
              <div className="flex gap-2 p-3">
                {userPhotos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => handlePhotoSelect(photo.url)}
                    className={cn(
                      "relative h-24 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      selectedUserPhoto === photo.url 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <Image 
                      src={photo.url} 
                      alt={photo.fileName} 
                      fill 
                      className="object-cover"
                      sizes="80px"
                    />
                    {selectedUserPhoto === photo.url && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-primary drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
                {userPhotos.length === 0 && (
                  <div className="flex items-center justify-center w-full py-6 text-muted-foreground">
                    <User className="w-6 h-6 mr-2" />
                    <span className="text-sm">No photos yet</span>
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Wardrobe Items */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm font-medium">Wardrobe Items</span>
              {selectedWardrobeItems.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {selectedWardrobeItems.length} selected
                </Badge>
              )}
            </div>
            <ScrollArea className="flex-1 rounded-lg border bg-muted/20">
              <div className="flex gap-2 p-3">
                {wardrobeItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleWardrobeSelect(item.url)}
                    className={cn(
                      "relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      selectedWardrobeItems.includes(item.url) 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <Image 
                      src={item.url} 
                      alt={item.fileName} 
                      fill 
                      className="object-cover"
                      sizes="96px"
                    />
                    {selectedWardrobeItems.includes(item.url) && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-primary drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
                {wardrobeItems.length === 0 && (
                  <div className="flex items-center justify-center w-full py-6 text-muted-foreground">
                    <Shirt className="w-6 h-6 mr-2" />
                    <span className="text-sm">No items yet</span>
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="mt-6 space-y-3">
          <Label htmlFor="personal-custom-instructions" className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Style Instructions (Optional)
          </Label>
          <Textarea
            id="personal-custom-instructions"
            placeholder="Describe the style, occasion, or preferences for this outfit... (e.g., 'Business meeting outfit', 'Casual weekend look', 'Earth tones only')"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            className="resize-none"
            rows={3}
            maxLength={200}
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESET_INSTRUCTIONS.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const newInstruction = customInstructions.trim() 
                    ? `${customInstructions.trim()}, ${preset}`
                    : preset;
                  if (newInstruction.length <= 200) {
                    setCustomInstructions(newInstruction);
                  }
                }}
              >
                {preset}
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {customInstructions.length}/200
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !selectedUserPhoto || selectedWardrobeItems.length === 0 || !canGenerate || isLimitLoading} 
          className="w-full mt-4 h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Try-On
            </>
          )}
        </Button>
      </div>

      {/* Right Panel - Result */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xl font-semibold">Result</span>
          </div>
          {resultImage && !loading && (
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
        
        <div className="flex-1 rounded-xl border-2 border-dashed bg-muted/20 flex items-center justify-center overflow-hidden relative min-h-[300px] lg:min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Wand2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-muted-foreground font-medium animate-pulse max-w-[200px]">
                {loadingText}
              </p>
            </div>
          ) : resultImage ? (
            <Image 
              src={resultImage} 
              alt="Virtual try-on result" 
              fill 
              className="object-contain p-2" 
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8" />
              </div>
              <p className="font-medium">Your result will appear here</p>
              <p className="text-sm mt-1">Select a photo and outfit, then generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Business Try-On Component
function BusinessTryOn() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(generationSteps[0]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { mannequinImages, productImages, getImageDataUri } = useBusinessAssets();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [selectedMannequinPhoto, setSelectedMannequinPhoto] = useState<string>("");
  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  
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
  const remainingGenerations = Math.max(0, DAILY_LIMIT - generationCount);

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
    link.download = `business-try-on-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProductSelect = (itemUrl: string) => {
    setSelectedProductItems(prev => 
      prev.includes(itemUrl) ? prev.filter(url => url !== itemUrl) : [...prev, itemUrl]
    );
  };
  
  const handleMannequinSelect = (itemUrl: string) => {
    setSelectedMannequinPhoto(itemUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMannequinPhoto || selectedProductItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Selections",
        description: "Please select a mannequin photo and at least one product item.",
      });
      return;
    }
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to generate a business try-on.",
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
      const userPhotoDataUri = await getImageDataUri(selectedMannequinPhoto);
      
      const outfitImageDataUris = await Promise.all(
        selectedProductItems.map(url => getImageDataUri(url))
      );

      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userPhotoDataUri, 
          outfitImageDataUris,
          customInstructions: customInstructions.trim() || undefined
        }),
      });

      const result = await response.json();

      if (!response.ok || "error" in result) {
        throw new Error(result?.error || "Failed to generate business try-on");
      }
      
      await fetch('/api/user/limit', { method: 'POST' });
      setGenerationCount(prev => prev + 1);

      const generatedImage = result.tryOnImageDataUri || null;
      setResultImage(generatedImage);

      if (generatedImage && session?.accessToken) {
        await fetch('/api/save-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageDataUri: generatedImage, fileName: `business-try-on-${Date.now()}.png` }),
        });
        toast({ title: "Success!", description: "Business try-on generated and saved to your history." });
      } else {
        toast({ title: "Success!", description: "Business try-on generated successfully." });
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
  
  

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Left Panel - Selections */}
      <div className="flex-1 flex flex-col min-w-0 lg:max-w-md">
        {/* Header with limit badge */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Business Try-On</h2>
          <Badge variant={canGenerate ? "secondary" : "destructive"} className="text-xs">
            {isLimitLoading ? "..." : `${remainingGenerations}/${DAILY_LIMIT} left today`}
          </Badge>
        </div>

        {/* Selection sections */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Mannequin Photo */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm font-medium">Mannequin Photo</span>
              {selectedMannequinPhoto && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
            </div>
            <ScrollArea className="flex-1 rounded-lg border bg-muted/20">
              <div className="flex gap-2 p-3">
                {mannequinImages.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => handleMannequinSelect(photo.url)}
                    className={cn(
                      "relative h-24 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      selectedMannequinPhoto === photo.url 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <Image 
                      src={photo.url} 
                      alt={photo.fileName} 
                      fill 
                      className="object-cover"
                      sizes="80px"
                    />
                    {selectedMannequinPhoto === photo.url && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-primary drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
                {mannequinImages.length === 0 && (
                  <div className="flex items-center justify-center w-full py-6 text-muted-foreground">
                    <User className="w-6 h-6 mr-2" />
                    <span className="text-sm">No mannequin photos yet</span>
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Product Items */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm font-medium">Product Items</span>
              {selectedProductItems.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {selectedProductItems.length} selected
                </Badge>
              )}
            </div>
            <ScrollArea className="flex-1 rounded-lg border bg-muted/20">
              <div className="flex gap-2 p-3">
                {productImages.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleProductSelect(item.url)}
                    className={cn(
                      "relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      selectedProductItems.includes(item.url) 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <Image 
                      src={item.url} 
                      alt={item.fileName} 
                      fill 
                      className="object-cover"
                      sizes="96px"
                    />
                    {selectedProductItems.includes(item.url) && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-primary drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
                {productImages.length === 0 && (
                  <div className="flex items-center justify-center w-full py-6 text-muted-foreground">
                    <Shirt className="w-6 h-6 mr-2" />
                    <span className="text-sm">No products yet</span>
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className="mt-6 space-y-3">
          <Label htmlFor="business-custom-instructions" className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Style Instructions (Optional)
          </Label>
          <Textarea
            id="business-custom-instructions"
            placeholder="Describe the style, occasion, or preferences for this product showcase... (e.g., 'Professional presentation', 'Casual lifestyle', 'Sporty and active')"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            className="resize-none"
            rows={3}
            maxLength={200}
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESET_INSTRUCTIONS.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  const newInstruction = customInstructions.trim() 
                    ? `${customInstructions.trim()}, ${preset}`
                    : preset;
                  if (newInstruction.length <= 200) {
                    setCustomInstructions(newInstruction);
                  }
                }}
              >
                {preset}
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {customInstructions.length}/200
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !selectedMannequinPhoto || selectedProductItems.length === 0 || !canGenerate || isLimitLoading} 
          className="w-full mt-4 h-12 text-base font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Business Try-On
            </>
          )}
        </Button>
      </div>

      {/* Right Panel - Result */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xl font-semibold">Result</span>
          </div>
          {resultImage && !loading && (
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
        
        <div className="flex-1 rounded-xl border-2 border-dashed bg-muted/20 flex items-center justify-center overflow-hidden relative min-h-[300px] lg:min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Wand2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-muted-foreground font-medium animate-pulse max-w-[200px]">
                {loadingText}
              </p>
            </div>
          ) : resultImage ? (
            <Image 
              src={resultImage} 
              alt="Business try-on result" 
              fill 
              className="object-contain p-2" 
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8" />
              </div>
              <p className="font-medium">Your result will appear here</p>
              <p className="text-sm mt-1">Select a mannequin and products, then generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VirtualTryOn() {
  return (
    <div className="h-full">
      <Tabs defaultValue="personal" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Try-On
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Business Try-On
          </TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="flex-1 m-0">
          <PersonalTryOn />
        </TabsContent>
        <TabsContent value="business" className="flex-1 m-0">
          <BusinessTryOn />
        </TabsContent>
      </Tabs>
    </div>
  );
}
