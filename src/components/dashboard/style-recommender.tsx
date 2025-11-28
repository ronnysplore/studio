"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// Use the outfit recommendations API instead of Server Actions to avoid origin checks
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { GenerateOutfitRecommendationsOutput } from "@/ai/flows/generate-outfit-recommendations";
import { Heart, Loader2, Star, Upload, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useWardrobe } from "@/contexts/wardrobe-context";

type Recommendation = GenerateOutfitRecommendationsOutput[0];

export default function StyleRecommender() {
  const [stylePreferences, setStylePreferences] = useState(
    "I like a minimalist, comfortable style. Neutral colors like black, white, and beige are my favorite. I prefer casual and smart-casual looks."
  );
  const [loading, setLoading] = useState(false);
  const { userPhotos, wardrobeItems, getImageDataUri } = useWardrobe();
  const hasUserImages = userPhotos.length > 0 && wardrobeItems.length > 0;
  const [recommendations, setRecommendations] =
    useState<GenerateOutfitRecommendationsOutput>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations([]);
    try {
      // For outfit recommendations, we'll just use the first photo of the user and some wardrobe items.
      // A more complex implementation could allow the user to select which ones to use.
      const fullBodyImage = userPhotos.find(p => p.url); // find first available
      const faceImage = userPhotos.find(p => p.url); // can be the same, model can distinguish
      const wardrobeSelection = wardrobeItems.slice(0, 5); // Use up to 5 items

      if (!fullBodyImage || !faceImage || wardrobeSelection.length === 0) {
        toast({
          variant: "destructive",
          title: "Not enough images",
          description: "Please upload at least one photo of yourself and some wardrobe items."
        });
        setLoading(false);
        return;
      }
      
      const fullBodyImageDataUri = await getImageDataUri(fullBodyImage.url);
      const faceImageDataUri = await getImageDataUri(faceImage.url);
      const wardrobeItemDataUris = await Promise.all(
        wardrobeSelection.map(item => getImageDataUri(item.url))
      );

      const response = await fetch('/api/outfit-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stylePreferences,
          fullBodyImageDataUri,
          faceImageDataUri,
          wardrobeItemDataUris,
        }),
      });
      const result = await response.json();
      if (!response.ok || 'error' in result) {
        toast({ variant: 'destructive', title: 'Error', description: result?.error || 'Failed to generate recommendations' });
      } else {
        setRecommendations(result);
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to generate recommendations' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 hover:border-primary/50 transition-all shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary rounded-lg">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">AI Style Recommendations</CardTitle>
            <CardDescription className="text-base mt-1">
              Describe your style preferences and get personalized outfit suggestions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!hasUserImages && (
          <Alert className="mb-6 border-accent/50 bg-accent/10">
            <AlertCircle className="h-5 w-5 text-accent-foreground" />
            <AlertTitle className="font-semibold">Upload Your Photos First</AlertTitle>
            <AlertDescription>
              To get personalized recommendations, please upload your photos and wardrobe items in the{" "}
              <Link href="/dashboard/wardrobe" className="font-medium underline text-accent-foreground">
                My Wardrobe
              </Link>{" "}
              tab.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="style-preferences" className="text-base font-semibold">
              My Style Preferences
            </Label>
            <Textarea
              id="style-preferences"
              value={stylePreferences}
              onChange={(e) => setStylePreferences(e.target.value)}
              placeholder="e.g., I love vintage, bohemian style with earthy tones..."
              rows={5}
              disabled={loading}
              className="resize-none border-2 focus:border-primary/50 transition-colors"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !hasUserImages}
            className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {!hasUserImages ? (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload Photos First
              </>
            ) : loading ? 'Generating Recommendations...' : 'Generate Recommendations'}
          </Button>
        </form>
      </CardContent>
      {(loading || recommendations.length > 0) && (
        <CardFooter className="flex flex-col items-start gap-6 p-6 bg-muted/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Generating Your Recommendations...
              </>
            ) : (
              <>
                <Star className="h-5 w-5 text-accent fill-accent" />
                Your Recommendations
              </>
            )}
          </h3>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="w-full h-[400px]" />
                  </CardContent>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <Image
          src={recommendation.outfitImageDataUri}
          alt={recommendation.outfitDescription}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Star className="h-5 w-5 text-accent fill-accent" />
          Outfit Idea
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {recommendation.outfitDescription}
        </p>
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-semibold text-foreground">Confidence Score</Label>
            <span className="text-sm font-bold text-primary">{Math.round(recommendation.confidenceScore * 100)}%</span>
          </div>
          <Progress 
            value={recommendation.confidenceScore * 100} 
            className="h-2 bg-muted"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-4 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex-1 hover:bg-red-50 hover:text-red-600 transition-colors"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-red-500 text-red-500")} />
          {isLiked ? 'Liked' : 'Like'}
        </Button>
        <Button variant="outline" size="sm" className="flex-1 hover:bg-accent/10 hover:border-accent transition-colors">
          <Star className="mr-2 h-4 w-4" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
