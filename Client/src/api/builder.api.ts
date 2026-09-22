import { api } from "./axios";

export type BuilderMessageRole = "user" | "assistant" | "system";

export interface BuilderMessage {
  id: string;
  role: BuilderMessageRole;
  content: string;
  createdAt?: string;
}

export interface GeneratedSection {
  name: string;
  key: string;
  orderIndex: number;
  htmlCode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface GenerateWebsiteResponse {
  sections: GeneratedSection[];
}

export async function getProjectMessages(projectId: string) {
  const response = await api.get<ApiResponse<BuilderMessage[]>>(
    `/messages/project/${projectId}`,
  );

  return response.data;
}

export async function generateWebsite(projectId: string, prompt: string) {
  const response = await api.post<ApiResponse<GenerateWebsiteResponse>>(
    "/ai/generate",
    {
      projectId,
      prompt,
    },
  );

  return response.data;
}
