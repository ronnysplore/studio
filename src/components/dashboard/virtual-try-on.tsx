"use client";

import { useState } from "react";
import Image from "next/image";
// Use API route instead of Next.js Server Action to avoid forwarded host/origin mismatch
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "../ui/skeleton";
import { useWardrobe } from "@/contexts/wardrobe-context";

export default function VirtualTryOn() {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { userPhotos, wardrobeItems, addUserPhotos, addWardrobeItems } = useWardrobe();
  const { toast } = useToast();

  const [selectedUserPhoto, setSelectedUserPhoto] = useState<string>("");
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<string>("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserPhoto || !selectedWardrobeItem) {
      toast({
        variant: "destructive",
        title: "Missing Images",
        description: "Please select both a photo and a wardrobe item.",
      });
      return;
    }

    setLoading(true);
    setResultImage(null);

    try {
      // Find the selected images to get their dataUri
      const userPhoto = userPhotos.find((p) => p.url === selectedUserPhoto);
      const wardrobeItem = wardrobeItems.find((w) => w.url === selectedWardrobeItem);

      if (!userPhoto || !wardrobeItem) {
        throw new Error("Selected images not found");
      }

      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhotoDataUri: userPhoto.dataUri,
          outfitImageDataUri: wardrobeItem.dataUri,
        }),
      });

      const result = await response.json();

      if (!response.ok || "error" in result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result?.error || "Failed to generate try-on",
        });
      } else {
        setResultImage(result.tryOnImageDataUri || result.tryOnImage || null);
        toast({ title: "Success!", description: "Try-on generated successfully" });
        
        /* Temporarily disabled - Drive save
        try {
          await fetch("/api/save-outfit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageDataUri: result.tryOnImageDataUri,
              fileName: `try-on-${Date.now()}.png`,
            }),
          });
          
          toast({
            title: "Success!",
            description: "Try-on generated and saved to Google Drive",
          });
        } catch (saveError) {
          console.error("Failed to save to Drive:", saveError);
          toast({
            title: "Generated!",
            description: "Try-on generated (save to Drive failed)",
          });
        }
        */
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate try-on. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 hover:border-primary/50 transition-all shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-lg">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Virtual Try-On</CardTitle>
            <CardDescription className="text-base mt-1">
              See how clothing looks on you with AI-powered visualization
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm">1</span>
                Your Photo
              </label>
              {userPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Upload your photo first</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('user-photo-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <input
                    id="user-photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && addUserPhotos(e.target.files)}
                  />
                </div>
              ) : (
                <>
                  <Select value={selectedUserPhoto} onValueChange={setSelectedUserPhoto}>
                    <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Select your photo" />
                    </SelectTrigger>
                    <SelectContent>
                      {userPhotos.map(photo => (
                        <SelectItem key={photo.id} value={photo.url}>{photo.fileName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedUserPhoto && (
                    <div className="rounded-xl border-2 border-dashed border-primary/30 p-3 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 transition-colors">
                      <Image src={selectedUserPhoto} alt="Selected user" width={120} height={120} className="rounded-lg object-cover mx-auto shadow-md" />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-3">
              <label className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm">2</span>
                Wardrobe Item
              </label>
              {wardrobeItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Upload a wardrobe item</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('wardrobe-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Item
                  </Button>
                  <input
                    id="wardrobe-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && addWardrobeItems(e.target.files)}
                  />
                </div>
              ) : (
                <>
                  <Select value={selectedWardrobeItem} onValueChange={setSelectedWardrobeItem}>
                    <SelectTrigger className="h-12 border-2 hover:border-accent/50 transition-colors">
                      <SelectValue placeholder="Select a wardrobe item" />
                    </SelectTrigger>
                    <SelectContent>
                      {wardrobeItems.map(item => (
                        <SelectItem key={item.id} value={item.url}>{item.fileName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedWardrobeItem && (
                    <div className="rounded-xl border-2 border-dashed border-accent/30 p-3 bg-gradient-to-br from-accent/5 to-transparent hover:border-accent/50 transition-colors">
                      <Image src={selectedWardrobeItem} alt="Selected item" width={120} height={120} className="rounded-lg object-cover mx-auto shadow-md" />
                    </div>
                  )}
                </>
              )}
            </div>
            <Button type="submit" disabled={loading || !selectedUserPhoto || !selectedWardrobeItem} className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50">
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Generate Try-On
            </Button>
          </form>
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border-2 border-dashed border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm">3</span>
              <h3 className="font-semibold text-lg">Result</h3>
            </div>
            <div className="relative w-full max-w-[350px] aspect-[3/4] rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center bg-card overflow-hidden shadow-lg">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : resultImage ? (
                <Image
                  src={resultImage}
                  alt="Virtual try-on result"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                    <Wand2 className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-base font-medium">Your generated image will appear here</p>
                  <p className="text-sm mt-2 opacity-75">Select your photo and an item, then click Generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
