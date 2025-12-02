"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, History, Calendar, Search, Filter, Grid3x3, List, Sparkles, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type GeneratedOutfit = {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink: string;
  createdTime: string;
};

// Function to get high-quality image URL from Google Drive file ID
const getHighQualityImageUrl = (fileId: string) => {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

type ViewMode = "grid" | "list";
type SortBy = "newest" | "oldest" | "name";

export default function HistoryPage() {
  const { data: session } = useSession();
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<GeneratedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedOutfit, setSelectedOutfit] = useState<GeneratedOutfit | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (session?.accessToken) {
      loadHistory();
    }
  }, [session]);

  useEffect(() => {
    filterAndSortOutfits();
  }, [outfits, searchQuery, sortBy]);

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

  const filterAndSortOutfits = () => {
    let filtered = outfits.filter(outfit =>
      outfit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
        case "oldest":
          return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredOutfits(filtered);
  };

  const downloadOutfit = (outfit: GeneratedOutfit) => {
    window.open(outfit.webViewLink, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getTimeOfDay = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground text-center">Please sign in to view your outfit history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Your Style Journey
              </h1>
              <p className="text-muted-foreground">
                {outfits.length > 0 ? `${outfits.length} AI-generated look${outfits.length === 1 ? '' : 's'}` : 'Your generated try-ons'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-muted-foreground mt-4">Loading your style history...</p>
          </div>
        ) : outfits.length === 0 ? (
          <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
                <History className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Your Style Journey Starts Here</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Create your first AI-generated try-on and watch your style collection grow. Every look tells a story!
              </p>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Creating
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8 p-4 bg-muted/30 rounded-xl backdrop-blur-sm border">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your outfits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                  <SelectTrigger className="w-[140px] bg-background/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">By Name</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex rounded-lg border bg-background/50">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredOutfits.length} of {outfits.length} outfit{filteredOutfits.length === 1 ? '' : 's'}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Content */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredOutfits.map((outfit) => (
                  <Card key={outfit.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] bg-gradient-to-br from-background to-muted/20">
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                      {outfit.thumbnailLink ? (
                        <Image
                          src={getHighQualityImageUrl(outfit.id)}
                          alt={outfit.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          placeholder="blur"
                          blurDataURL={outfit.thumbnailLink}
                          onError={(e) => {
                            // Fallback to thumbnail if high-quality fails
                            e.currentTarget.src = outfit.thumbnailLink;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-accent/10">
                          <Sparkles className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={() => setSelectedOutfit(outfit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={() => downloadOutfit(outfit)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Badge variant="secondary" className="bg-background/80 text-foreground">
                          {formatDate(outfit.createdTime)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="font-medium truncate mb-1 text-sm">{outfit.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(outfit.createdTime)} • {getTimeOfDay(outfit.createdTime)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOutfits.map((outfit) => (
                  <Card key={outfit.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-background to-muted/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-muted/50 to-muted flex-shrink-0">
                          {outfit.thumbnailLink ? (
                            <Image
                              src={getHighQualityImageUrl(outfit.id)}
                              alt={outfit.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = outfit.thumbnailLink;
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Sparkles className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{outfit.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(outfit.createdTime)}
                            </div>
                            <span>•</span>
                            <span>{getTimeOfDay(outfit.createdTime)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOutfit(outfit)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadOutfit(outfit)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!selectedOutfit} onOpenChange={(open) => !open && setSelectedOutfit(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                {selectedOutfit?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="relative mt-4 w-full aspect-[3/4] rounded-xl bg-muted overflow-hidden">
              {selectedOutfit?.thumbnailLink && (
                <Image 
                  src={getHighQualityImageUrl(selectedOutfit.id)} 
                  alt={selectedOutfit.name} 
                  fill 
                  className="object-contain"
                  priority
                  onError={(e) => {
                    e.currentTarget.src = selectedOutfit.thumbnailLink;
                  }}
                />
                />
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Created {formatDate(selectedOutfit?.createdTime || "")} at {getTimeOfDay(selectedOutfit?.createdTime || "")}
              </div>
              <Button onClick={() => selectedOutfit && downloadOutfit(selectedOutfit)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
