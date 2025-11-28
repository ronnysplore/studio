
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, CheckCircle,Palette, Image as ImageIcon, Download } from "lucide-react";
import { useBusinessAssets } from "@/contexts/business-asset-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "../ui/textarea";

const generationSteps = [
    "Briefing the AI stylist...",
    "Selecting the best angles...",
    "Setting up virtual lighting...",
    "Composing the shot...",
    "Rendering the final catalog image...",
    "Polishing the final look...",
];

export default function CatalogGenerator() {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(generationSteps[0]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [catalogStyle, setCatalogStyle] = useState("A clean, bright, and professional look for an e-commerce website. Use a plain light gray background.");
  const { mannequinImages, productImages, getImageDataUri } = useBusinessAssets();
  const { toast } = useToast();

  const [selectedMannequin, setSelectedMannequin] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

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
    link.download = `catalog-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMannequin || !selectedProduct) {
      toast({
        variant: "destructive",
        title: "Missing Selections",
        description: "Please select a mannequin and a product.",
      });
      return;
    }

    setLoading(true);
    setResultImage(null);

    try {
      const mannequinImage = await getImageDataUri(selectedMannequin);
      const productImage = await getImageDataUri(selectedProduct);

      const response = await fetch('/api/business-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          catalogStyleDescription: catalogStyle,
          mannequinImage,
          productImage,
        }),
      });

      const result = await response.json();

      if (!response.ok || "error" in result) {
        throw new Error(result?.error || "Failed to generate catalog image");
      }

      setResultImage(result.catalogImage || null);
      toast({ title: "Success!", description: "Catalog image generated successfully." });

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
  
  const hasPrerequisites = mannequinImages.length > 0 && productImages.length > 0;

  return (
    <Card className="w-full mx-auto border-2 shadow-xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">AI Visual Catalog Generator</h1>
            <p className="text-lg text-muted-foreground mt-2">Create professional catalog images by combining your assets.</p>
        </div>
        
        {!hasPrerequisites && (
            <Alert className="mb-6 max-w-2xl mx-auto border-accent/50 bg-accent/10">
              <AlertTitle className="font-semibold">Upload Your Business Assets First</AlertTitle>
              <AlertDescription>
                To get started, please add your mannequin and product photos in the "My Wardrobe" tab (business assets section will appear there).
              </AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-3">1. Select Mannequin Asset</h3>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                        <div className="flex space-x-4">
                            {mannequinImages.length > 0 ? mannequinImages.map(photo => (
                                <div key={photo.id} className="relative aspect-[3/4] h-36 flex-shrink-0" onClick={() => setSelectedMannequin(photo.url)}>
                                    <Image src={photo.url} alt={photo.fileName} fill className={cn("object-cover rounded-md cursor-pointer transition-all border-4", selectedMannequin === photo.url ? "border-primary" : "border-transparent")} />
                                    {selectedMannequin === photo.url && (
                                    <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    )}
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center w-full h-36 text-muted-foreground">
                                    <ImageIcon className="w-10 h-10 mb-2"/>
                                    <p>Your mannequin images will appear here.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                
                <div>
                    <h3 className="font-semibold text-lg mb-3">2. Select Product Asset</h3>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                        <div className="flex space-x-4">
                            {productImages.length > 0 ? productImages.map(item => (
                                <div key={item.id} className="relative aspect-square h-36 flex-shrink-0" onClick={() => setSelectedProduct(item.url)}>
                                    <Image src={item.url} alt={item.fileName} fill className={cn("object-cover rounded-md cursor-pointer transition-all border-4", selectedProduct === item.url ? "border-primary" : "border-transparent")} />
                                    {selectedProduct === item.url && (
                                    <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    )}
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center w-full h-36 text-muted-foreground">
                                    <Palette className="w-10 h-10 mb-2"/>
                                    <p>Your product images will appear here.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
                
                <div>
                    <h3 className="font-semibold text-lg mb-3">3. Describe Catalog Style</h3>
                     <Textarea value={catalogStyle} onChange={e => setCatalogStyle(e.target.value)} placeholder="e.g., Dark, moody, high-fashion editorial..." rows={3} disabled={loading} />
                </div>

                <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !selectedMannequin || !selectedProduct} 
                    className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
                >
                    {loading ? 'Generating...' : 'Generate Catalog Image'}
                    <Wand2 className="h-5 w-5" />
                </Button>
            </div>

            <div className="space-y-4 sticky top-24">
                 <h3 className="font-semibold text-lg text-center">4. See The Result!</h3>
                <div className="relative w-full aspect-[4/5] rounded-xl border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden shadow-inner">
                    {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium animate-fade-in">{loadingText}</p>
                    </div>
                    ) : resultImage ? (
                    <Image src={resultImage} alt="Generated catalog image" fill className="object-cover animate-fade-in" />
                    ) : (
                    <div className="text-center text-muted-foreground p-6">
                        <Wand2 className="mx-auto h-12 w-12 mb-2 text-primary" />
                        <p className="text-base font-medium">Your Generated Catalog Image will appear here!</p>
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

    