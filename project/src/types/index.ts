export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "article" | "video" | "guide";
  url: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  role?: "caretaker" | "patient";
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  phoneNumber?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes?: string;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  schedule: string;
  participants: number;
}

export interface FeedbackForm {
  rating: number;
  comment: string;
  category: string;
  email?: string;
}

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  type: "medical" | "personal" | "emergency";
}

export interface RoutineTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  category: "medication" | "exercise" | "meal" | "other";
}

export interface ForumPost {
  id: string;
  author: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  replies: ForumReply[];
}

export interface ForumReply {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
}
