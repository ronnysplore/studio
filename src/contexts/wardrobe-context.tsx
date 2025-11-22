"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export type UploadedImage = {
  id: string;
  url: string;
  fileName: string;
  dataUri: string; // Base64 data URI for API calls
  driveFileId?: string; // Google Drive file ID
};

type WardrobeContextType = {
  userPhotos: UploadedImage[];
  wardrobeItems: UploadedImage[];
  addUserPhotos: (files: FileList) => Promise<void>;
  addWardrobeItems: (files: FileList) => Promise<void>;
  removeUserPhoto: (id: string) => void;
  removeWardrobeItem: (id: string) => void;
  loadFromDrive: () => Promise<void>;
  getImageDataUri: (url: string) => Promise<string>;
  isLoading: boolean;
};

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [userPhotos, setUserPhotos] = useState<UploadedImage[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount (fallback) — only metadata (no large data URIs)
  useEffect(() => {
    setIsLoading(true);
    const savedUserPhotos = localStorage.getItem("userPhotos");
    const savedWardrobeItems = localStorage.getItem("wardrobeItems");

    if (savedUserPhotos) {
      try {
        const parsed = JSON.parse(savedUserPhotos) as Array<any>;
        setUserPhotos(
          parsed.map((p) => ({ ...p, dataUri: "" }))
        );
      } catch (e) {
        console.error("Failed to load user photos", e);
      }
    }

    if (savedWardrobeItems) {
      try {
        const parsed = JSON.parse(savedWardrobeItems) as Array<any>;
        setWardrobeItems(
          parsed.map((p) => ({ ...p, dataUri: "" }))
        );
      } catch (e) {
        console.error("Failed to load wardrobe items", e);
      }
    }
    setIsLoading(false);
  }, []);


  // Save metadata to localStorage whenever images change (avoid storing dataUri blobs)
  useEffect(() => {
    try {
      const persistable = userPhotos.map(({ id, url, fileName, driveFileId }) => ({
        id,
        url,
        fileName,
        driveFileId,
      }));
      localStorage.setItem("userPhotos", JSON.stringify(persistable));
    } catch (e) {
      console.error("Failed to persist user photos metadata", e);
    }
  }, [userPhotos]);

  useEffect(() => {
    try {
      const persistable = wardrobeItems.map(({ id, url, fileName, driveFileId }) => ({
        id,
        url,
        fileName,
        driveFileId,
      }));
      localStorage.setItem("wardrobeItems", JSON.stringify(persistable));
    } catch (e) {
      console.error("Failed to persist wardrobe items metadata", e);
    }
  }, [wardrobeItems]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processAndUploadFiles = async (files: FileList, folderType: 'userPhotos' | 'wardrobeItems') => {
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
          driveFileId: uploadResult.id, // Using local ID as driveFileId for now
        };
      })
    );

    if (folderType === 'userPhotos') {
      setUserPhotos((prev) => [...prev, ...newImages]);
    } else {
      setWardrobeItems((prev) => [...prev, ...newImages]);
    }
  };

  const addUserPhotos = async (files: FileList) => {
    await processAndUploadFiles(files, "userPhotos");
  };

  const addWardrobeItems = async (files: FileList) => {
    await processAndUploadFiles(files, "wardrobeItems");
  };

  const removeUserPhoto = (id: string) => {
    setUserPhotos((prev) => prev.filter((img) => img.id !== id));
    // TODO: Also delete from server
  };

  const removeWardrobeItem = (id: string) => {
    setWardrobeItems((prev) => prev.filter((img) => img.id !== id));
    // TODO: Also delete from server
  };

  // Helper to fetch an image URL and convert it to a data URI
  const getImageDataUri = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}. Status: ${response.status}`);
      }
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
    <WardrobeContext.Provider
      value={{
        userPhotos,
        wardrobeItems,
        addUserPhotos,
        addWardrobeItems,
        removeUserPhoto,
        removeWardrobeItem,
        loadFromDrive: async () => {}, // Obsolete with local storage
        getImageDataUri,
        isLoading,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error("useWardrobe must be used within a WardrobeProvider");
  }
  return context;
}
