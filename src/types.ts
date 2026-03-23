export type UserRole = 'client' | 'builder' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  timezone?: string;
  createdAt: string;
}

export interface BuilderProfile {
  userId: string;
  headline: string;
  bio: string;
  specialties: string[];
  pricingRange: string;
  turnaroundEstimate: string;
  ratingAverage: number;
  ratingCount: number;
  availabilityStatus: 'available' | 'busy' | 'away';
}

export type ProjectStatus = 
  | 'draft' 
  | 'clarifying' 
  | 'confirming' 
  | 'selecting_builder' 
  | 'awaiting_payment' 
  | 'in_progress' 
  | 'delivered' 
  | 'completed';

export interface ProjectRequest {
  id: string;
  clientId: string;
  initialPrompt: string;
  aiQuestions: AIQuestion[];
  aiAnswers: Record<string, string>;
  finalSummary?: ProjectSummary;
  selectedBuilderId?: string;
  quotedPrice?: number;
  estimatedDeliveryTime?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AIQuestion {
  id: string;
  question: string;
  field: string;
}

export interface ProjectSummary {
  project_type: string;
  problem_statement: string;
  target_user: string;
  must_have_features: string[];
  optional_features: string[];
  design_preferences: string;
  deliverables: string[];
  urgency: string;
  constraints: string;
  extra_notes: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  text: string;
  attachments?: string[];
  createdAt: string;
}

export interface Delivery {
  id: string;
  projectId: string;
  downloadLink: string;
  instructions: string;
  completedAt: string;
}
