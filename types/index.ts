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

export type Mood = "happy" | "normal" | "low" | "sick";
export type Appetite = "good" | "normal" | "low" | "none";

export type ReminderKind =
  | "vaccine"
  | "flea-tick"
  | "heartworm"
  | "weigh-in"
  | "vet-visit"
  | "grooming"
  | "other";

export interface ReminderDTO {
  id: string;
  dogId: string;
  kind: ReminderKind;
  title: string;
  dueDate: string;
  recurDays?: number;
  completedAt?: string;
  createdAt: string;
}

export const REMINDER_KINDS: { key: ReminderKind; label: string; emoji: string }[] = [
  { key: "vaccine", label: "Vaccine", emoji: "💉" },
  { key: "flea-tick", label: "Flea/Tick", emoji: "🦟" },
  { key: "heartworm", label: "Heartworm", emoji: "💊" },
  { key: "weigh-in", label: "Weigh-in", emoji: "⚖️" },
  { key: "vet-visit", label: "Vet visit", emoji: "🏥" },
  { key: "grooming", label: "Grooming", emoji: "✂️" },
  { key: "other", label: "Other", emoji: "📌" },
];

export interface WellnessEntryDTO {
  id: string;
  dogId: string;
  date: string;
  mood?: Mood;
  appetite?: Appetite;
  weight?: number;
  notes?: string;
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

export const SCAN_TIPS: Record<ScanType, string[]> = {
  poop: [
    "Use natural daylight if possible.",
    "Get the whole stool in frame, from above.",
    "Clean background (grass or paper) shows color best.",
  ],
  ears: [
    "Gently lift the ear flap to expose the canal.",
    "Use a phone flashlight — no direct flash.",
    "Get close enough to see skin detail.",
  ],
  teeth: [
    "Lift the lip to show gums and back molars.",
    "Good lighting — avoid shadows on teeth.",
    "Focus on tartar / color at the gum line.",
  ],
  skin: [
    "Part the fur so skin is clearly visible.",
    "Sharp focus on the affected spot, close up.",
    "Include a coin or finger for size if helpful.",
  ],
  eyes: [
    "Straight on, both eyes visible if possible.",
    "Soft lighting — bright flash can hide redness.",
    "Get close so the iris and whites are sharp.",
  ],
};

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
