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
import { Loader2, Wand2, Upload } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useWardrobe } from "@/contexts/wardrobe-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

const StepIndicator = ({ number, label }: { number: number; label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold">
      {number}
    </div>
    <h3 className="font-semibold text-lg">{label}</h3>
  </div>
);

export default function VirtualTryOn() {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { userPhotos, wardrobeItems, addUserPhotos, addWardrobeItems, getImageDataUri } = useWardrobe();
  const { toast } = useToast();
  const { data: session } = useSession();

  const [selectedUserPhoto, setSelectedUserPhoto] = useState<string>("");
  const [selectedWardrobeItem, setSelectedWardrobeItem] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserPhoto || !selectedWardrobeItem) {
      toast({
        variant: "destructive",
        title: "Missing Selections",
        description: "Please select both your photo and a wardrobe item to generate a try-on.",
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
      const wardrobeItem = wardrobeItems.find((w) => w.url === selectedWardrobeItem);

      if (!userPhoto || !wardrobeItem) throw new Error("Selected images not found");

      const userPhotoDataUri = userPhoto.dataUri || await getImageDataUri(userPhoto.url);
      const outfitImageDataUri = wardrobeItem.dataUri || await getImageDataUri(wardrobeItem.url);

      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPhotoDataUri, outfitImageDataUri }),
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

  const InputSection = ({
    items,
    selectedValue,
    onValueChange,
    onUpload,
    uploadId,
    placeholder,
  }: {
    items: { url: string; id: string; fileName: string }[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    onUpload: (files: FileList) => void;
    uploadId: string;
    placeholder: string;
  }) => (
    <div className="space-y-3">
        {items.length > 0 ? (
            <>
                <Select value={selectedValue} onValueChange={onValueChange}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map(item => (
                            <SelectItem key={item.id} value={item.url}>{item.fileName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="relative w-full aspect-square max-w-sm mx-auto rounded-lg bg-muted overflow-hidden border">
                    {selectedValue ? (
                        <Image src={selectedValue} alt="Selected item" fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4 text-center">
                            Select an image to see a preview
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors w-full h-full aspect-square max-w-sm mx-auto">
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
        )}
    </div>
);


  return (
    <Card className="w-full mx-auto border-0 shadow-none">
      <CardHeader className="pb-8">
        <CardTitle className="text-3xl font-bold tracking-tight">Virtual Try-On</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          See how clothing looks on you with AI-powered visualization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          <div className="space-y-8">
            <div>
              <StepIndicator number={1} label="Your Photo" />
              <InputSection
                items={userPhotos}
                selectedValue={selectedUserPhoto}
                onValueChange={setSelectedUserPhoto}
                onUpload={addUserPhotos}
                uploadId="user-photo-upload-main"
                placeholder="Select your photo"
              />
            </div>

            <div>
              <StepIndicator number={2} label="Wardrobe Item" />
              <InputSection
                items={wardrobeItems}
                selectedValue={selectedWardrobeItem}
                onValueChange={setSelectedWardrobeItem}
                onUpload={addWardrobeItems}
                uploadId="wardrobe-item-upload-main"
                placeholder="Select a wardrobe item"
              />
            </div>

            <Button 
                onClick={handleSubmit} 
                disabled={loading || !selectedUserPhoto || !selectedWardrobeItem} 
                className="w-full h-14 text-lg shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-3"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        Generate Try-On
                        <Wand2 className="h-5 w-5" />
                    </>
                )}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center md:text-left">AI Try-On Result</h3>
            <div className="relative w-full aspect-square rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden shadow-inner">
                {loading ? (
                <Skeleton className="w-full h-full" />
                ) : resultImage ? (
                <Image src={resultImage} alt="Virtual try-on result" fill className="object-cover" />
                ) : (
                <div className="text-center text-muted-foreground p-6">
                    <p className="text-base font-medium">Your generated image will appear here</p>
                </div>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
