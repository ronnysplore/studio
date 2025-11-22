"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Upload, CheckCircle } from "lucide-react";
import { useWardrobe } from "@/contexts/wardrobe-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const StepIndicator = ({ number, label }: { number: number; label: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
      {number}
    </div>
    <h3 className="font-semibold text-xl">{label}</h3>
  </div>
);

export default function VirtualTryOn() {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { userPhotos, wardrobeItems, addUserPhotos, addWardrobeItems, getImageDataUri } = useWardrobe();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [selectedUserPhoto, setSelectedUserPhoto] = useState<string>("");
  const [selectedWardrobeItems, setSelectedWardrobeItems] = useState<string[]>([]);

  const handleWardrobeSelect = (itemUrl: string) => {
    setSelectedWardrobeItems(prev => 
      prev.includes(itemUrl) ? prev.filter(url => url !== itemUrl) : [...prev, itemUrl]
    );
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

    setLoading(true);
    setResultImage(null);

    try {
      const userPhoto = userPhotos.find((p) => p.url === selectedUserPhoto);
      if (!userPhoto) throw new Error("Selected user photo not found");

      const userPhotoDataUri = userPhoto.dataUri || await getImageDataUri(userPhoto.url);
      
      const outfitImageDataUris = await Promise.all(
        selectedWardrobeItems.map(async (url) => {
          const item = wardrobeItems.find((w) => w.url === url);
          if (!item) throw new Error(`Wardrobe item with url ${url} not found`);
          return item.dataUri || await getImageDataUri(item.url);
        })
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

      const generatedImage = result.tryOnImageDataUri || result.tryOnImage || null;
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
    <Card className="w-full mx-auto border-0 shadow-none">
      <CardHeader className="pb-8 text-center">
        <CardTitle className="text-4xl font-bold tracking-tight">Virtual Try-On</CardTitle>
        <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Visualize how different clothing items look on you. Select your photo, choose one or more items, and let our AI do the rest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          <div className="w-full space-y-6">
            <div className="space-y-4">
              <StepIndicator number={1} label="Choose Your Photo" />
              {userPhotos.length > 0 ? (
                <>
                  <Select value={selectedUserPhoto} onValueChange={setSelectedUserPhoto}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your photo" />
                    </SelectTrigger>
                    <SelectContent>
                      {userPhotos.map(item => (
                        <SelectItem key={item.id} value={item.url}>{item.fileName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative w-full max-w-sm mx-auto aspect-[4/5] rounded-lg bg-muted overflow-hidden border-2">
                    {selectedUserPhoto && <Image src={selectedUserPhoto} alt="Selected user photo" fill className="object-cover" />}
                  </div>
                </>
              ) : (
                <UploadPlaceholder onUpload={addUserPhotos} uploadId="user-photo-upload-main" />
              )}
            </div>

            <div className="space-y-4">
              <StepIndicator number={2} label="Select Wardrobe Item(s)" />
              {wardrobeItems.length > 0 ? (
                <ScrollArea className="h-64 w-full rounded-md border p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {wardrobeItems.map(item => (
                      <div key={item.id} className="relative aspect-square" onClick={() => handleWardrobeSelect(item.url)}>
                        <Image src={item.url} alt={item.fileName} fill className={cn("object-cover rounded-md cursor-pointer transition-all border-2", selectedWardrobeItems.includes(item.url) ? "border-primary" : "border-transparent")} />
                        {selectedWardrobeItems.includes(item.url) && (
                          <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <UploadPlaceholder onUpload={addWardrobeItems} uploadId="wardrobe-item-upload-main" />
              )}
            </div>
          </div>

          <div className="space-y-4 sticky top-24">
            <StepIndicator number={3} label="See The Result" />
            <div className="relative w-full aspect-[4/5] rounded-xl border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden shadow-inner">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating your try-on...</p>
                  </div>
                ) : resultImage ? (
                  <Image src={resultImage} alt="Virtual try-on result" fill className="object-cover" />
                ) : (
                  <div className="text-center text-muted-foreground p-6">
                    <Wand2 className="mx-auto h-12 w-12 mb-2" />
                    <p className="text-base font-medium">Your generated image will appear here</p>
                  </div>
                )}
            </div>
             <Button 
                onClick={handleSubmit} 
                disabled={loading || !selectedUserPhoto || selectedWardrobeItems.length === 0} 
                className="w-full h-14 text-lg shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
            >
                {loading ? 'Generating...' : 'Generate Try-On'}
                <Wand2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const UploadPlaceholder = ({ onUpload, uploadId }: { onUpload: (files: FileList) => void; uploadId: string; }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors w-full h-48">
      <p className="text-sm text-muted-foreground mb-3">Upload an image to start</p>
      <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(uploadId)?.click()}
      >
          <Upload className="mr-2 h-4 w-4" />
          Upload
      </Button>
      <input
          id={uploadId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
  </div>
);
