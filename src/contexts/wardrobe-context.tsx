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
  isLoading: boolean;
};

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [userPhotos, setUserPhotos] = useState<UploadedImage[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount (fallback)
  useEffect(() => {
    const savedUserPhotos = localStorage.getItem("userPhotos");
    const savedWardrobeItems = localStorage.getItem("wardrobeItems");

    if (savedUserPhotos) {
      try {
        setUserPhotos(JSON.parse(savedUserPhotos));
      } catch (e) {
        console.error("Failed to load user photos", e);
      }
    }

    if (savedWardrobeItems) {
      try {
        setWardrobeItems(JSON.parse(savedWardrobeItems));
      } catch (e) {
        console.error("Failed to load wardrobe items", e);
      }
    }
  }, []);

  // Load from Google Drive when session is available
  useEffect(() => {
    // Temporarily disabled due to network timeout issues
    // TODO: Re-enable when network connectivity to googleapis.com is fixed
    // if (session?.accessToken) {
    //   loadFromDrive();
    // }
  }, [session]);

  // Save to localStorage whenever images change (fallback)
  useEffect(() => {
    localStorage.setItem("userPhotos", JSON.stringify(userPhotos));
  }, [userPhotos]);

  useEffect(() => {
    localStorage.setItem("wardrobeItems", JSON.stringify(wardrobeItems));
  }, [wardrobeItems]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadToDrive = async (
    fileName: string,
    fileData: string,
    folderType: "userPhotos" | "wardrobeItems"
  ): Promise<string | undefined> => {
    // Temporarily disabled due to network timeout issues
    // TODO: Re-enable when network connectivity to googleapis.com is fixed
    return undefined;
    
    /* Original implementation - commented out
    if (!session?.accessToken) {
      return undefined;
    }

    try {
      const response = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileData, folderType }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload to Drive");
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error("Error uploading to Drive:", error);
      return undefined;
    }
    */
  };

  const loadFromDrive = async () => {
    if (!session?.accessToken) {
      return;
    }

    setIsLoading(true);
    try {
      // Load user photos
      const userPhotosResponse = await fetch("/api/drive?folderType=userPhotos");
      if (userPhotosResponse.ok) {
        const { files } = await userPhotosResponse.json();
        if (files && Array.isArray(files)) {
          const userPhotoImages: UploadedImage[] = files.map((file: any) => ({
            id: file.id,
            url: file.thumbnailLink || file.webViewLink,
            fileName: file.name,
            dataUri: "", // Will be loaded on-demand
            driveFileId: file.id,
          }));
          setUserPhotos(userPhotoImages);
        }
      }

      // Load wardrobe items
      const wardrobeItemsResponse = await fetch("/api/drive?folderType=wardrobeItems");
      if (wardrobeItemsResponse.ok) {
        const { files } = await wardrobeItemsResponse.json();
        if (files && Array.isArray(files)) {
          const wardrobeItemImages: UploadedImage[] = files.map((file: any) => ({
            id: file.id,
            url: file.thumbnailLink || file.webViewLink,
            fileName: file.name,
            dataUri: "", // Will be loaded on-demand
            driveFileId: file.id,
          }));
          setWardrobeItems(wardrobeItemImages);
        }
      }
    } catch (error) {
      console.error("Error loading from Drive (will use localStorage):", error);
      // Silently fall back to localStorage - images already loaded in first useEffect
    } finally {
      setIsLoading(false);
    }
  };

  const addUserPhotos = async (files: FileList) => {
    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        const dataUri = await fileToDataUri(file);
        const driveFileId = await uploadToDrive(file.name, dataUri, "userPhotos");
        return {
          id: driveFileId || Math.random().toString(36).substr(2, 9),
          url: dataUri, // Use dataUri as url for persistence
          fileName: file.name,
          dataUri,
          driveFileId,
        };
      })
    );
    setUserPhotos((prev) => [...prev, ...newImages]);
  };

  const addWardrobeItems = async (files: FileList) => {
    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        const dataUri = await fileToDataUri(file);
        const driveFileId = await uploadToDrive(file.name, dataUri, "wardrobeItems");
        return {
          id: driveFileId || Math.random().toString(36).substr(2, 9),
          url: dataUri, // Use dataUri as url for persistence
          fileName: file.name,
          dataUri,
          driveFileId,
        };
      })
    );
    setWardrobeItems((prev) => [...prev, ...newImages]);
  };

  const removeUserPhoto = (id: string) => {
    setUserPhotos((prev) => prev.filter((img) => img.id !== id));
    // TODO: Also delete from Google Drive
  };

  const removeWardrobeItem = (id: string) => {
    setWardrobeItems((prev) => prev.filter((img) => img.id !== id));
    // TODO: Also delete from Google Drive
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
        loadFromDrive,
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

