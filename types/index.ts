export type ScanType = "poop" | "ears" | "teeth" | "skin" | "eyes";
export type Severity = "green" | "yellow" | "red";
export type Urgency = "routine" | "soon" | "urgent";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
}

export interface DogDTO {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  photoUrl?: string;
  createdAt: string;
}

export interface ScanAIResult {
  severity: Severity;
  title: string;
  summary: string;
  concerns: string[];
  recommendations: string[];
  shouldSeeVet: boolean;
  urgency: Urgency;
}

export interface ScanDTO {
  id: string;
  dogId: string;
  scanType: ScanType;
  imageUrl: string;
  aiResult: ScanAIResult;
  createdAt: string;
}

export interface ChatMessageDTO {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSessionDTO {
  id: string;
  dogId: string;
  messages: ChatMessageDTO[];
  createdAt: string;
  updatedAt: string;
}

export const SCAN_TYPES: { key: ScanType; label: string; emoji: string }[] = [
  { key: "poop", label: "Poop", emoji: "💩" },
  { key: "ears", label: "Ears", emoji: "👂" },
  { key: "teeth", label: "Teeth", emoji: "🦷" },
  { key: "skin", label: "Skin", emoji: "🐾" },
  { key: "eyes", label: "Eyes", emoji: "👁️" },
];

export const COMMON_BREEDS = [
  "Labrador Retriever",
  "Golden Retriever",
  "German Shepherd",
  "French Bulldog",
  "Bulldog",
  "Poodle",
  "Beagle",
  "Rottweiler",
  "Dachshund",
  "Yorkshire Terrier",
  "Boxer",
  "Siberian Husky",
  "Great Dane",
  "Shih Tzu",
  "Chihuahua",
  "Border Collie",
  "Australian Shepherd",
  "Cavalier King Charles Spaniel",
  "Pomeranian",
  "Bernese Mountain Dog",
  "Mixed / Other",
];
