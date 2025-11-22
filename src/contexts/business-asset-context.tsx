"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UploadedImage = {
  id: string;
  url: string;
  fileName: string;
  dataUri: string;
};

type BusinessAssetContextType = {
  mannequinImages: UploadedImage[];
  productImages: UploadedImage[];
  addMannequinImages: (files: FileList) => Promise<void>;
  addProductImages: (files: FileList) => Promise<void>;
  removeMannequinImage: (id: string) => void;
  removeProductImage: (id: string) => void;
  getImageDataUri: (url: string) => Promise<string>;
  isLoading: boolean;
};

const BusinessAssetContext = createContext<BusinessAssetContextType | undefined>(undefined);

export function BusinessAssetProvider({ children }: { children: React.ReactNode }) {
  const [mannequinImages, setMannequinImages] = useState<UploadedImage[]>([]);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const savedMannequins = localStorage.getItem("mannequinImages");
    const savedProducts = localStorage.getItem("productImages");

    if (savedMannequins) {
      try {
        setMannequinImages(JSON.parse(savedMannequins).map((p: any) => ({ ...p, dataUri: "" })));
      } catch (e) {
        console.error("Failed to load mannequin images", e);
      }
    }

    if (savedProducts) {
      try {
        setProductImages(JSON.parse(savedProducts).map((p: any) => ({ ...p, dataUri: "" })));
      } catch (e) {
        console.error("Failed to load product images", e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    try {
      const persistable = mannequinImages.map(({ id, url, fileName }) => ({ id, url, fileName }));
      localStorage.setItem("mannequinImages", JSON.stringify(persistable));
    } catch (e) {
      console.error("Failed to persist mannequin images", e);
    }
  }, [mannequinImages]);

  useEffect(() => {
    try {
      const persistable = productImages.map(({ id, url, fileName }) => ({ id, url, fileName }));
      localStorage.setItem("productImages", JSON.stringify(persistable));
    } catch (e) {
      console.error("Failed to persist product images", e);
    }
  }, [productImages]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processAndUploadFiles = async (files: FileList, folderType: 'mannequins' | 'products') => {
    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        const dataUri = await fileToDataUri(file);
        const response = await fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileData: dataUri, folderType }),
        });
        const uploadResult = await response.json();
        
        if (!response.ok) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        return {
          id: uploadResult.id,
          url: uploadResult.url,
          fileName: uploadResult.fileName,
          dataUri: "", // Don't store large data URI in state
        };
      })
    );

    if (folderType === 'mannequins') {
      setMannequinImages((prev) => [...prev, ...newImages]);
    } else {
      setProductImages((prev) => [...prev, ...newImages]);
    }
  };

  const addMannequinImages = async (files: FileList) => {
    await processAndUploadFiles(files, "mannequins");
  };

  const addProductImages = async (files: FileList) => {
    await processAndUploadFiles(files, "products");
  };
  
  const removeMannequinImage = (id: string) => {
    setMannequinImages((prev) => prev.filter((img) => img.id !== id));
    // TODO: Also delete from server
  };

  const removeProductImage = (id: string) => {
    setProductImages((prev) => prev.filter((img) => img.id !== id));
    // TODO: Also delete from server
  };

  const getImageDataUri = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image. Status: ${response.status}`);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to fetch image as data URI:", error);
      throw error;
    }
  };

  return (
    <BusinessAssetContext.Provider
      value={{
        mannequinImages,
        productImages,
        addMannequinImages,
        addProductImages,
        removeMannequinImage,
        removeProductImage,
        getImageDataUri,
        isLoading,
      }}
    >
      {children}
    </BusinessAssetContext.Provider>
  );
}

export function useBusinessAssets() {
  const context = useContext(BusinessAssetContext);
  if (context === undefined) {
    throw new Error("useBusinessAssets must be used within a BusinessAssetProvider");
  }
  return context;
}
