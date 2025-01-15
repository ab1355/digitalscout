export interface User {
  id: string;
  username: string;
  email: string;
  age: number;
  badges: Badge[];
  progress: ChallengeProgress[];
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  requirements: string[];
  category: 'coding' | 'cybersecurity' | 'digital_citizenship';
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'coding' | 'cybersecurity' | 'digital_citizenship';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  badgeId: string;
  steps: ChallengeStep[];
}

export interface ChallengeStep {
  id: string;
  order: number;
  instructions: string;
  verificationMethod: 'automatic' | 'manual';
  resources?: string[];
}

export interface ChallengeProgress {
  userId: string;
  challengeId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: number;
  completedSteps: string[];
  startedAt: Date;
  completedAt?: Date;
}
