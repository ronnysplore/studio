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

  // Load from localStorage on mount (fallback) — only metadata (no large data URIs)
  useEffect(() => {
    const savedUserPhotos = localStorage.getItem("userPhotos");
    const savedWardrobeItems = localStorage.getItem("wardrobeItems");

    if (savedUserPhotos) {
      try {
        const parsed = JSON.parse(savedUserPhotos) as Array<any>;
        setUserPhotos(
          parsed.map((p) => ({
            id: p.id,
            url: p.url,
            fileName: p.fileName,
            dataUri: "",
            driveFileId: p.driveFileId,
          }))
        );
      } catch (e) {
        console.error("Failed to load user photos", e);
      }
    }

    if (savedWardrobeItems) {
      try {
        const parsed = JSON.parse(savedWardrobeItems) as Array<any>;
        setWardrobeItems(
          parsed.map((p) => ({
            id: p.id,
            url: p.url,
            fileName: p.fileName,
            dataUri: "",
            driveFileId: p.driveFileId,
          }))
        );
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

  // Upload to local filesystem via the new /api/uploads route (fallback for dev)
  const uploadToDrive = async (
    fileName: string,
    fileData: string,
    folderType: "userPhotos" | "wardrobeItems"
  ): Promise<{ id?: string; url?: string } | undefined> => {
    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileData, folderType }),
      });

      if (!response.ok) {
        console.error("Upload to filesystem failed", await response.text());
        return undefined;
      }

      const result = await response.json();
      return { id: result.id, url: result.url };
    } catch (error) {
      console.error("Error uploading to filesystem:", error);
      return undefined;
    }
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
        const uploadResult = await uploadToDrive(file.name, dataUri, "userPhotos");
        const id = uploadResult?.id || Math.random().toString(36).substr(2, 9);
        const url = uploadResult?.url || dataUri;
        return {
          id,
          url,
          fileName: file.name,
          dataUri: "",
          driveFileId: uploadResult?.id,
        };
      })
    );
    setUserPhotos((prev) => [...prev, ...newImages]);
  };

  const addWardrobeItems = async (files: FileList) => {
    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        const dataUri = await fileToDataUri(file);
        const uploadResult = await uploadToDrive(file.name, dataUri, "wardrobeItems");
        const id = uploadResult?.id || Math.random().toString(36).substr(2, 9);
        const url = uploadResult?.url || dataUri;
        return {
          id,
          url,
          fileName: file.name,
          dataUri: "",
          driveFileId: uploadResult?.id,
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

