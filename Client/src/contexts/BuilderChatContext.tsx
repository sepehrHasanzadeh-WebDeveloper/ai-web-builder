"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getApiErrorMessage } from "../api/axios";
import type { BuilderMessage, GeneratedSection } from "../api/builder.api";
import {
  addSectionWithAI,
  deleteSection as deleteSectionRequest,
  editSectionWithAI,
  generateWebsite,
  getProjectMessages,
  getProjectSections,
  getSectionMessages,
  updateSectionOrder,
} from "../api/builder.api";
import { createProject, getProjects } from "../api/projects.api";

export type ChatMessage = BuilderMessage;
export type BuilderChatMode = "project" | "add-section" | "edit-section";

interface BuilderChatContextValue {
  projectId: string | null;
  messages: ChatMessage[];
  generatedSections: GeneratedSection[];
  activeSection: GeneratedSection | null;
  chatMode: BuilderChatMode;
  input: string;
  isLoading: boolean;
  isProjectLoading: boolean;
  isCreatingProject: boolean;
  isReordering: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  setInput: (value: string) => void;
  loadHistory: () => Promise<void>;
  createNewProject: () => Promise<void>;
  startAddingSection: () => void;
  selectSection: (section: GeneratedSection) => Promise<void>;
  reorderSections: (sourceId: string, targetId: string) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  returnToProjectChat: () => void;
  sendMessage: (prompt?: string) => Promise<void>;
  clearMessages: () => void;
}

const BuilderChatContext = createContext<BuilderChatContextValue | null>(null);

const welcomeMessage: ChatMessage = {
  id: "welcome-message",
  role: "assistant",
  content:
    "سلام! من دستیار هوشمند سایت‌ساز هستم. بیا گفت‌وگو کنیم و سایتت را با هم بسازیم.",
};

const addSectionMessage: ChatMessage = {
  id: "add-section-message",
  role: "assistant",
  content: "برای اضافه کردن بخش جدید، ظاهر و محتوای موردنظرت را توضیح بده.",
};

function editSectionMessage(sectionName: string): ChatMessage {
  return {
    id: `edit-section-${sectionName}`,
    role: "assistant",
    content: `بخش «${sectionName}» انتخاب شد. تغییرات موردنظرت را بنویس تا همین بخش را ویرایش کنم.`,
  };
}

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
  const [activeSection, setActiveSection] = useState<GeneratedSection | null>(
    null,
  );
  const [chatMode, setChatMode] = useState<BuilderChatMode>("project");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveProject = async () => {
      if (providedProjectId) {
        if (isMounted) {
          window.localStorage.setItem("currentProjectId", providedProjectId);
          setProjectId(providedProjectId);
          setIsProjectLoading(false);
        }
        return;
      }

      const queryProjectId = new URLSearchParams(window.location.search).get(
        "projectId",
      );
      const storedProjectId = window.localStorage.getItem("currentProjectId");

      if (queryProjectId) {
        if (isMounted) {
          window.localStorage.setItem("currentProjectId", queryProjectId);
          setProjectId(queryProjectId);
          setIsProjectLoading(false);
        }
        return;
      }

      setError(null);

      try {
        const projectsResponse = await getProjects();
        const activeProject =
          projectsResponse.data?.find(
            (project) => project.id === storedProjectId,
          ) ?? projectsResponse.data?.[0];

        if (activeProject && isMounted) {
          window.localStorage.setItem("currentProjectId", activeProject.id);
          setProjectId(activeProject.id);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsProjectLoading(false);
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
      setChatMode("project");
      setActiveSection(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const createNewProject = useCallback(async () => {
    if (isCreatingProject) return;

    setIsCreatingProject(true);
    setError(null);

    try {
      const response = await createProject({
        name: "پروژه جدید",
        description: "پروژه ساخته‌شده از Builder",
      });
      const createdProject = response.data;

      if (!createdProject) {
        throw new Error("پروژه ساخته نشد.");
      }

      window.localStorage.setItem("currentProjectId", createdProject.id);
      setProjectId(createdProject.id);
      setGeneratedSections([]);
      setMessages([welcomeMessage]);
      setChatMode("project");
      setActiveSection(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsCreatingProject(false);
    }
  }, [isCreatingProject]);

  const startAddingSection = useCallback(() => {
    if (!projectId) return;

    setChatMode("add-section");
    setActiveSection(null);
    setMessages([addSectionMessage]);
    setInput("");
    setError(null);
  }, [projectId]);

  const selectSection = useCallback(async (section: GeneratedSection) => {
    setChatMode("edit-section");
    setActiveSection(section);
    setInput("");
    setError(null);
    setMessages([editSectionMessage(section.name)]);
    setIsLoadingHistory(true);

    try {
      const response = await getSectionMessages(section.id);
      if (response.data && response.data.length > 0) {
        setMessages(response.data);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const returnToProjectChat = useCallback(() => {
    setChatMode("project");
    setActiveSection(null);
    setInput("");
    setError(null);
    void loadHistory();
  }, [loadHistory]);

  const reorderSections = useCallback(
    async (sourceId: string, targetId: string) => {
      if (sourceId === targetId || isReordering) return;

      const previousSections = [...generatedSections];
      const orderedSections = [...generatedSections].sort(
        (first, second) => first.orderIndex - second.orderIndex,
      );
      const sourceIndex = orderedSections.findIndex(
        (section) => section.id === sourceId,
      );
      const targetIndex = orderedSections.findIndex(
        (section) => section.id === targetId,
      );

      if (sourceIndex < 0 || targetIndex < 0) return;

      const [movedSection] = orderedSections.splice(sourceIndex, 1);
      orderedSections.splice(targetIndex, 0, movedSection);
      const nextSections = orderedSections.map((section, index) => ({
        ...section,
        orderIndex: index,
      }));

      setGeneratedSections(nextSections);
      setIsReordering(true);
      setError(null);

      try {
        await Promise.all(
          nextSections.map((section) =>
            updateSectionOrder(section.id, section.orderIndex),
          ),
        );
      } catch (requestError) {
        setGeneratedSections(previousSections);
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsReordering(false);
      }
    },
    [generatedSections, isReordering],
  );

  const deleteSection = useCallback(
    async (sectionId: string) => {
      const previousSections = [...generatedSections];
      const nextSections = generatedSections.filter(
        (section) => section.id !== sectionId,
      );

      if (nextSections.length === previousSections.length) return;

      setGeneratedSections(nextSections);
      setError(null);

      if (activeSection?.id === sectionId) {
        setActiveSection(null);
        setChatMode("project");
        setMessages([welcomeMessage]);
      }

      try {
        await deleteSectionRequest(sectionId);
      } catch (requestError) {
        setGeneratedSections(previousSections);
        setError(getApiErrorMessage(requestError));
      }
    },
    [activeSection, generatedSections],
  );

  const sendMessage = useCallback(
    async (prompt?: string) => {
      const content = (prompt ?? input).trim();

      if (!content || isLoading || isLoadingHistory) return;

      if (!projectId) {
        setError("ابتدا یک پروژه بسازید.");
        return;
      }

      if (chatMode === "edit-section" && !activeSection) {
        setError("بخشی برای ویرایش انتخاب نشده است.");
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
        let assistantMessage = "تغییرات با موفقیت انجام شد.";

        if (chatMode === "add-section") {
          const response = await addSectionWithAI(projectId, content);
          assistantMessage = response.message || "بخش جدید با موفقیت اضافه شد.";
        } else if (chatMode === "edit-section" && activeSection) {
          const response = await editSectionWithAI(activeSection.id, content);
          assistantMessage =
            response.message || "بخش انتخاب‌شده با موفقیت ویرایش شد.";
        } else {
          const response = await generateWebsite(projectId, content);
          assistantMessage =
            response.message || "وب‌سایت با موفقیت توسط هوش مصنوعی ساخته شد.";
        }

        const sectionsResponse = await getProjectSections(projectId);
        const nextSections = sectionsResponse.data ?? [];
        setGeneratedSections(nextSections);

        if (activeSection) {
          setActiveSection(
            nextSections.find((section) => section.id === activeSection.id) ??
              activeSection,
          );
        }

        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: createClientId(),
            role: "assistant",
            content: assistantMessage,
          },
        ]);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [activeSection, chatMode, input, isLoading, isLoadingHistory, projectId],
  );

  const clearMessages = useCallback(() => {
    setMessages(
      chatMode === "add-section"
        ? [addSectionMessage]
        : chatMode === "edit-section" && activeSection
          ? [editSectionMessage(activeSection.name)]
          : [welcomeMessage],
    );
    setError(null);
  }, [activeSection, chatMode]);

  const contextValue = useMemo<BuilderChatContextValue>(
    () => ({
      projectId,
      messages,
      generatedSections,
      activeSection,
      chatMode,
      input,
      isLoading,
      isProjectLoading,
      isCreatingProject,
      isReordering,
      isLoadingHistory,
      error,
      setInput,
      loadHistory,
      createNewProject,
      startAddingSection,
      selectSection,
      reorderSections,
      deleteSection,
      returnToProjectChat,
      sendMessage,
      clearMessages,
    }),
    [
      projectId,
      messages,
      generatedSections,
      activeSection,
      chatMode,
      input,
      isLoading,
      isProjectLoading,
      isCreatingProject,
      isReordering,
      isLoadingHistory,
      error,
      loadHistory,
      createNewProject,
      startAddingSection,
      selectSection,
      reorderSections,
      deleteSection,
      returnToProjectChat,
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
