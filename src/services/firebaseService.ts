import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  where,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "";

/**
 * Ensures a URL is secure (HTTPS) and handles Cloudinary/Firebase paths
 */
export const getSecureUrl = (url: string | undefined): string => {
  if (!url) return "/logo192.png"; // Fallback
  
  // 1. Force HTTPS
  let secureUrl = url.replace(/^http:\/\//i, "https://");
  
  // 2. Handle relative paths
  if (secureUrl.startsWith("/")) {
    secureUrl = `${window.location.origin}${secureUrl}`;
  }
  
  // 3. Cloudinary specific: Ensure 'secure_url' style
  if (secureUrl.includes("cloudinary.com")) {
    // Cloudinary URLs are usually secure by default if they have /upload/
    // but we can enforce it.
  }

  return secureUrl;
};


const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing. Check your .env file.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
};

// --- Types ---
export interface CalendarImage {
  id: string;
  month: string;
  image: string;
  createdAt?: string;
  storagePath?: string;
}

export interface AdImage {
  id: string;
  url: string;
  link?: string;
  text?: string;
  visible?: boolean;
  createdAt?: string;
  storagePath?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  image?: string;
  createdAt: any;
}

// --- Calendar Images ---

export const fetchCalendarImages = async (): Promise<CalendarImage[]> => {
  try {
    const q = query(collection(db, "calendarImages"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CalendarImage[];
  } catch (error) {
    console.error("Error fetching calendar images:", error);
    return [];
  }
};

export const uploadCalendarImage = async (monthName: string, file: File): Promise<CalendarImage | null> => {
  try {
    // Upload image to Cloudinary
    const downloadURL = await uploadToCloudinary(file);
    const storagePath = `cloudinary_${Date.now()}`;

    // Save to Firestore
    const docRef = await addDoc(collection(db, "calendarImages"), {
      month: monthName,
      image: downloadURL,
      storagePath,
      createdAt: Timestamp.now()
    });

    return { id: docRef.id, month: monthName, image: downloadURL, storagePath };
  } catch (error) {
    console.error("Error uploading calendar image:", error);
    return null;
  }
};

export const deleteCalendarImage = async (id: string, storagePath?: string) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, "calendarImages", id));

    // Note: Deleting from Cloudinary via client is not recommended. 
    // It requires an API secret. The image will remain in Cloudinary unless deleted via a backend.

    return true;
  } catch (error) {
    console.error("Error deleting calendar image:", error);
    return false;
  }
};

// --- Ads Images ---

export const fetchAdsImages = async (): Promise<AdImage[]> => {
  try {
    const q = query(collection(db, "adsImages"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdImage[];
  } catch (error) {
    console.error("Error fetching ads images:", error);
    return [];
  }
};

export const uploadAdImage = async (file: File | null, link?: string, text?: string, visible: boolean = true): Promise<AdImage | null> => {
  try {
    let downloadURL = "";
    let storagePath = "";
    
    if (file) {
      downloadURL = await uploadToCloudinary(file);
      storagePath = `ads_${Date.now()}`;
    }

    const adData: any = {
      link: link || "",
      text: text || "",
      visible,
      createdAt: Timestamp.now()
    };
    
    if (downloadURL) {
      adData.url = downloadURL;
      adData.storagePath = storagePath;
    }

    const docRef = await addDoc(collection(db, "adsImages"), adData);

    return { id: docRef.id, url: downloadURL, ...adData };
  } catch (error) {
    console.error("Error uploading ad:", error);
    return null;
  }
};

export const updateAdVisibility = async (id: string, visible: boolean) => {
  try {
    await setDoc(doc(db, "adsImages", id), { visible }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating ad visibility:", error);
    return false;
  }
};

export const deleteAdImage = async (id: string, storagePath?: string) => {
  try {
    await deleteDoc(doc(db, "adsImages", id));
    return true;
  } catch (error) {
    console.error("Error deleting ad image:", error);
    return false;
  }
};


