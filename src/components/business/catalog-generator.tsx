"use client";

import { useState } from "react";
import Image from "next/image";
// Use API route to generate business catalog instead of Server Action
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Loader2, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";

export default function CatalogGenerator() {
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [catalogStyle, setCatalogStyle] = useState("A clean, bright, and professional look for an e-commerce website. Use a plain light gray background.");
  const { toast } = useToast();

  const mannequinImages = PlaceHolderImages.filter(p => p.id.startsWith('mannequin-'));
  const productImages = PlaceHolderImages.filter(p => p.id.startsWith('product-'));

  const [selectedMannequin, setSelectedMannequin] = useState(mannequinImages[0].imageUrl);
  const [selectedProduct, setSelectedProduct] = useState(productImages[0].imageUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultImage(null);
    try {
      const response = await fetch('/api/business-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogStyleDescription: catalogStyle }),
      });
      const result = await response.json();
      if (!response.ok || 'error' in result) {
        toast({ variant: 'destructive', title: 'Error', description: result?.error || 'Failed to generate catalog' });
      } else {
        setResultImage(result.catalogImage || result.catalogImageDataUri || null);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate catalog' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Visual Catalog Generator</CardTitle>
        <CardDescription>
          Create professional catalog images by combining your assets with an AI-powered stylist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-medium">Mannequin</label>
              <Select defaultValue={selectedMannequin} onValueChange={setSelectedMannequin}>
                <SelectTrigger><SelectValue placeholder="Select mannequin" /></SelectTrigger>
                <SelectContent>{mannequinImages.map(img => <SelectItem key={img.id} value={img.imageUrl}>{img.description}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium">Product</label>
              <Select defaultValue={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{productImages.map(img => <SelectItem key={img.id} value={img.imageUrl}>{img.description}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium">Catalog Style Description</label>
              <Textarea value={catalogStyle} onChange={e => setCatalogStyle(e.target.value)} placeholder="e.g., Dark, moody, high-fashion editorial..." rows={3} disabled={loading} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate Catalog Image
            </Button>
          </form>
          <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-4">Generated Catalog Image</h3>
            <div className="relative w-full max-w-md aspect-video rounded-lg border-2 border-dashed flex items-center justify-center">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : resultImage ? (
                <Image src={resultImage} alt="Generated catalog image" fill className="object-contain rounded-md" />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <Wand2 className="mx-auto h-12 w-12" />
                  <p className="mt-2">Your generated image will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
