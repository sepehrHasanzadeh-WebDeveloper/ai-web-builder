import { api } from "./axios";

export type BuilderMessageRole = "user" | "assistant" | "system";

export interface BuilderMessage {
  id: string;
  role: BuilderMessageRole;
  content: string;
  createdAt?: string;
}

export interface GeneratedSection {
  id: string;
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

export interface SectionAiResponse {
  section: GeneratedSection;
}

export async function getProjectMessages(projectId: string) {
  const response = await api.get<ApiResponse<BuilderMessage[]>>(
    `/messages/project/${projectId}`,
  );

  return response.data;
}

export async function getProjectSections(projectId: string) {
  const response = await api.get<ApiResponse<GeneratedSection[]>>(
    `/sections/project/${projectId}`,
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

export async function addSectionWithAI(projectId: string, prompt: string) {
  const response = await api.post<ApiResponse<SectionAiResponse>>(
    "/ai/sections",
    {
      projectId,
      prompt,
    },
  );

  return response.data;
}

export async function editSectionWithAI(sectionId: string, prompt: string) {
  const response = await api.patch<ApiResponse<SectionAiResponse>>(
    `/ai/sections/${sectionId}`,
    { prompt },
  );

  return response.data;
}

export async function getSectionMessages(sectionId: string) {
  const response = await api.get<ApiResponse<BuilderMessage[]>>(
    `/messages/section/${sectionId}`,
  );

  return response.data;
}

export async function updateSectionOrder(
  sectionId: string,
  orderIndex: number,
) {
  const response = await api.patch<ApiResponse<GeneratedSection>>(
    `/sections/${sectionId}`,
    { orderIndex },
  );

  return response.data;
}

export async function deleteSection(sectionId: string) {
  const response = await api.delete<ApiResponse<{ success: boolean }>>(
    `/sections/${sectionId}`,
  );

  return response.data;
}
