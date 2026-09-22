import { api } from "./axios";

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export async function getProjects() {
  const response = await api.get<ApiResponse<Project[]>>("/projects");

  return response.data;
}

export async function createProject(data: {
  name: string;
  description?: string;
}) {
  const response = await api.post<ApiResponse<Project>>("/projects", data);

  return response.data;
}
