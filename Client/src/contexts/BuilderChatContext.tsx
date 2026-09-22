"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  generateWebsite,
  getProjectMessages,
  getProjectSections,
} from "../api/builder.api";
import { getApiErrorMessage } from "../api/axios";
import { createProject, getProjects } from "../api/projects.api";
import type {
  BuilderMessage,
  GeneratedSection,
} from "../api/builder.api";

export type ChatMessage = BuilderMessage;

interface BuilderChatContextValue {
  projectId: string | null;
  messages: ChatMessage[];
  generatedSections: GeneratedSection[];
  input: string;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  setInput: (value: string) => void;
  loadHistory: () => Promise<void>;
  sendMessage: (prompt?: string) => Promise<void>;
  clearMessages: () => void;
}

const BuilderChatContext = createContext<BuilderChatContextValue | null>(
  null,
);

const welcomeMessage: ChatMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "سلام! من دستیار هوشمند سایت‌ساز هستم. بیا گفت‌وگو کنیم و سایتت را با هم بسازیم.",
};

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function BuilderChatProvider({
  children,
  projectId: providedProjectId,
}: {
  children: ReactNode;
  projectId?: string;
}) {
  const [projectId, setProjectId] = useState<string | null>(
    providedProjectId ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [generatedSections, setGeneratedSections] = useState<
    GeneratedSection[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveProject = async () => {
      if (providedProjectId) {
        if (isMounted) {
          window.localStorage.setItem("currentProjectId", providedProjectId);
          setProjectId(providedProjectId);
        }
        return;
      }

      const queryProjectId = new URLSearchParams(window.location.search).get(
        "projectId",
      );
      const storedProjectId = window.localStorage.getItem("currentProjectId");
      const knownProjectId = queryProjectId ?? storedProjectId;

      if (knownProjectId) {
        if (isMounted) {
          window.localStorage.setItem("currentProjectId", knownProjectId);
          setProjectId(knownProjectId);
        }
        return;
      }

      setIsLoadingHistory(true);
      setError(null);

      try {
        const projectsResponse = await getProjects();
        let activeProject = projectsResponse.data?.[0];

        if (!activeProject) {
          const createdProjectResponse = await createProject({
            name: "پروژه جدید",
            description: "پروژه ساخته‌شده از Builder",
          });
          activeProject = createdProjectResponse.data ?? undefined;
        }

        if (!activeProject) {
          throw new Error("پروژه‌ای برای بازکردن پیدا نشد.");
        }

        if (isMounted) {
          window.localStorage.setItem("currentProjectId", activeProject.id);
          setProjectId(activeProject.id);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    void resolveProject();

    return () => {
      isMounted = false;
    };
  }, [providedProjectId]);

  const loadHistory = useCallback(async () => {
    if (!projectId) return;

    setIsLoadingHistory(true);
    setError(null);

    try {
      const [messagesResponse, sectionsResponse] = await Promise.all([
        getProjectMessages(projectId),
        getProjectSections(projectId),
      ]);

      setMessages(
        messagesResponse.data && messagesResponse.data.length > 0
          ? messagesResponse.data
          : [welcomeMessage],
      );
      setGeneratedSections(sectionsResponse.data ?? []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const sendMessage = useCallback(
    async (prompt?: string) => {
      const content = (prompt ?? input).trim();

      if (!content || isLoading || isLoadingHistory) return;

      if (!projectId) {
        setError("شناسه پروژه پیدا نشد. Builder را با projectId باز کنید.");
        return;
      }

      const userMessage: ChatMessage = {
        id: createClientId(),
        role: "user",
        content,
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setInput("");
      setError(null);
      setIsLoading(true);

      try {
        const response = await generateWebsite(projectId, content);

        // همه‌ی سکشن‌ها را دوباره می‌خوانیم تا بخش‌های قبلی در Preview باقی بمانند.
        const sectionsResponse = await getProjectSections(projectId);
        setGeneratedSections(
          sectionsResponse.data ?? response.data?.sections ?? [],
        );

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createClientId(),
            role: "assistant",
            content:
              response.message || "وب‌سایت با موفقیت توسط هوش مصنوعی ساخته شد.",
          },
        ]);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, isLoadingHistory, projectId],
  );

  const clearMessages = useCallback(() => {
    setMessages([welcomeMessage]);
    setError(null);
  }, []);

  const contextValue = useMemo<BuilderChatContextValue>(
    () => ({
      projectId,
      messages,
      generatedSections,
      input,
      isLoading,
      isLoadingHistory,
      error,
      setInput,
      loadHistory,
      sendMessage,
      clearMessages,
    }),
    [
      projectId,
      messages,
      generatedSections,
      input,
      isLoading,
      isLoadingHistory,
      error,
      loadHistory,
      sendMessage,
      clearMessages,
    ],
  );

  return (
    <BuilderChatContext.Provider value={contextValue}>
      {children}
    </BuilderChatContext.Provider>
  );
}

export function useBuilderChat() {
  const context = useContext(BuilderChatContext);

  if (!context) {
    throw new Error(
      "useBuilderChat باید داخل BuilderChatProvider استفاده شود.",
    );
  }

  return context;
}
