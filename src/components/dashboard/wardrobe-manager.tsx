
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Upload, X, Eye } from "lucide-react";
import { useWardrobe } from "@/contexts/wardrobe-context";
import type { UploadedImage } from "@/contexts/wardrobe-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

type ImageCategory = {
  title: string;
  description: string;
  images: UploadedImage[];
  onUpload: (files: FileList) => void;
  onRemove: (image: UploadedImage) => void;
};

export default function WardrobeManager() {
  const { userPhotos, wardrobeItems, addUserPhotos, addWardrobeItems, removeUserPhoto, removeWardrobeItem } = useWardrobe();
  const [imageToDelete, setImageToDelete] = useState<{ image: UploadedImage; type: 'user' | 'wardrobe' } | null>(null);
  const [imageToPreview, setImageToPreview] = useState<UploadedImage | null>(null);

  const handleDelete = () => {
    if (imageToDelete) {
      if (imageToDelete.type === 'user') {
        removeUserPhoto(imageToDelete.image);
      } else {
        removeWardrobeItem(imageToDelete.image);
      }
      setImageToDelete(null);
    }
  };

  const categories: ImageCategory[] = [
    {
      title: "My Photos",
      description: "Your full-body and face photos for accurate recommendations.",
      images: userPhotos,
      onUpload: addUserPhotos,
      onRemove: (image: UploadedImage) => setImageToDelete({ image, type: 'user' }),
    },
    {
      title: "My Wardrobe Items",
      description: "Images of your clothes, shoes, and accessories.",
      images: wardrobeItems,
      onUpload: addWardrobeItems,
      onRemove: (image: UploadedImage) => setImageToDelete({ image, type: 'wardrobe' }),
    },
  ];

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <Card key={category.title} className="border-2 transition-all shadow-lg">
          <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-muted/50 to-transparent border-b p-4 sm:p-6">
            <div>
              <CardTitle className="text-xl">{category.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{category.description}</CardDescription>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto"
              onClick={() => document.getElementById(`upload-${category.title}`)?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <input
              id={`upload-${category.title}`}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && category.onUpload(e.target.files)}
            />
          </CardHeader>
          <CardContent className="p-6">
            {category.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {category.images.map((image) => (
                  <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                    <Image
                      src={image.url}
                      alt={image.fileName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      onClick={() => setImageToPreview(image)}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setImageToPreview(image)}
                        className="p-1.5 bg-background/80 text-foreground rounded-full hover:bg-background shadow-lg"
                        aria-label="Preview image"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => category.onRemove(image)}
                        className="p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-lg"
                        aria-label="Delete image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2 pointer-events-none">
                      <p className="text-white text-xs font-medium truncate">{image.fileName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <PlusCircle className="h-12 w-12 text-primary" />
                </div>
                <p className="text-lg font-semibold">No items yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Upload" to add your first item and start building your digital wardrobe.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image from your wardrobe and Google Drive? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!imageToPreview} onOpenChange={(open) => !open && setImageToPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{imageToPreview?.fileName}</DialogTitle>
          </DialogHeader>
          <div className="relative mt-4 w-full aspect-[4/5] rounded-lg bg-muted">
            {imageToPreview && (
              <Image 
                src={imageToPreview.url} 
                alt={imageToPreview.fileName} 
                fill 
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
