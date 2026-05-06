import { ReactElement } from "react";

export interface Assignment {
  userId: string;
  role: string;
  status: string;
  teamId: string | null;
  team?: {
    id: string;
    name: string;
  } | null;
}

export interface Simulation {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  assignmentStatus: string;
  createdAt: string;
  assignments: Assignment[];
}

export interface Communication {
  id: string;
  type: string;
  content: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  subject?: string;
  payload?: Record<string, unknown>;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

export interface Injection {
  id: string;
  title: string;
  content: string;
  scenarioName: string;
  createdAt: string;
  acknowledged: boolean;
  type: string;
  imageUrl?: string;
  videoUrl?: string;
  attachments?: {
    type: string;
    url: string;
    name: string;
  }[];
}

export interface ParticipantViewData {
  simulation: Simulation;
  counts: {
    email: number;
    call: number;
    sms: number;
    alert: number;
    memo: number;
    newsBroadcast: number;
    newspaper: number;
    social: number;
    report: number;
  };
  communications: {
    email: Communication[];
    call: Communication[];
    sms: Communication[];
    alert: Communication[];
    memo: Communication[];
    newsBroadcast: Communication[];
    newspaper: Communication[];
    social: Communication[];
    report: Communication[];
  };
  injections: Injection[];
}

export type ChannelKey = keyof ParticipantViewData["communications"];

export interface CombinedContentItem extends Partial<Communication>, Partial<Injection> {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  isInjection: boolean;
}
