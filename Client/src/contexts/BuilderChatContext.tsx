"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
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

interface BuilderState {
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
}

type BuilderAction =
  | { type: "patch"; payload: Partial<BuilderState> }
  | { type: "append-messages"; messages: ChatMessage[] };

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

const initialState: BuilderState = {
  projectId: null,
  messages: [welcomeMessage],
  generatedSections: [],
  activeSection: null,
  chatMode: "project",
  input: "",
  isLoading: false,
  isProjectLoading: true,
  isCreatingProject: false,
  isReordering: false,
  isLoadingHistory: false,
  error: null,
};

function builderReducer(
  state: BuilderState,
  action: BuilderAction,
): BuilderState {
  if (action.type === "append-messages") {
    return { ...state, messages: [...state.messages, ...action.messages] };
  }

  return { ...state, ...action.payload };
}

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sectionIntro(
  mode: BuilderChatMode,
  section?: GeneratedSection | null,
) {
  if (mode === "add-section") return addSectionMessage;
  if (mode === "edit-section" && section) {
    return {
      id: `edit-section-${section.name}`,
      role: "assistant" as const,
      content: `بخش «${section.name}» انتخاب شد. تغییرات موردنظرت را بنویس تا همین بخش را ویرایش کنم.`,
    };
  }

  return welcomeMessage;
}

function sortSections(sections: GeneratedSection[]) {
  return [...sections].sort(
    (first, second) => first.orderIndex - second.orderIndex,
  );
}

const BuilderChatContext = createContext<BuilderChatContextValue | null>(null);

export function BuilderChatProvider({
  children,
  projectId: providedProjectId,
}: {
  children: ReactNode;
  projectId?: string;
}) {
  const [state, dispatch] = useReducer(builderReducer, {
    ...initialState,
    projectId: providedProjectId ?? null,
  });

  const patch = useCallback((payload: Partial<BuilderState>) => {
    dispatch({ type: "patch", payload });
  }, []);

  const appendMessages = useCallback((messages: ChatMessage[]) => {
    dispatch({ type: "append-messages", messages });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveProject = async () => {
      const queryProjectId = new URLSearchParams(window.location.search).get(
        "projectId",
      );
      const storedProjectId = window.localStorage.getItem("currentProjectId");
      const knownProjectId = providedProjectId ?? queryProjectId;

      if (knownProjectId) {
        window.localStorage.setItem("currentProjectId", knownProjectId);
        patch({ projectId: knownProjectId, isProjectLoading: false });
        return;
      }

      patch({ error: null });

      try {
        const response = await getProjects();
        const project =
          response.data?.find((item) => item.id === storedProjectId) ??
          response.data?.[0];

        if (isMounted && project) {
          window.localStorage.setItem("currentProjectId", project.id);
          patch({ projectId: project.id });
        }
      } catch (requestError) {
        if (isMounted) patch({ error: getApiErrorMessage(requestError) });
      } finally {
        if (isMounted) patch({ isProjectLoading: false });
      }
    };

    void resolveProject();
    return () => {
      isMounted = false;
    };
  }, [patch, providedProjectId]);

  const loadHistory = useCallback(async () => {
    if (!state.projectId) return;

    patch({ isLoadingHistory: true, error: null });

    try {
      const [messagesResponse, sectionsResponse] = await Promise.all([
        getProjectMessages(state.projectId),
        getProjectSections(state.projectId),
      ]);

      patch({
        messages: messagesResponse.data?.length
          ? messagesResponse.data
          : [welcomeMessage],
        generatedSections: sectionsResponse.data ?? [],
        activeSection: null,
        chatMode: "project",
      });
    } catch (requestError) {
      patch({ error: getApiErrorMessage(requestError) });
    } finally {
      patch({ isLoadingHistory: false });
    }
  }, [patch, state.projectId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const createNewProject = useCallback(async () => {
    if (state.isCreatingProject) return;

    patch({ isCreatingProject: true, error: null });

    try {
      const response = await createProject({
        name: "پروژه جدید",
        description: "پروژه ساخته‌شده از Builder",
      });
      const project = response.data;

      if (!project) throw new Error("پروژه ساخته نشد.");

      window.localStorage.setItem("currentProjectId", project.id);
      patch({
        projectId: project.id,
        generatedSections: [],
        messages: [welcomeMessage],
        activeSection: null,
        chatMode: "project",
      });
    } catch (requestError) {
      patch({ error: getApiErrorMessage(requestError) });
    } finally {
      patch({ isCreatingProject: false });
    }
  }, [patch, state.isCreatingProject]);

  const resetChat = useCallback(
    (mode: BuilderChatMode, section?: GeneratedSection | null) => {
      patch({
        chatMode: mode,
        activeSection: section ?? null,
        messages: [sectionIntro(mode, section)],
        input: "",
        error: null,
      });
    },
    [patch],
  );

  const startAddingSection = useCallback(() => {
    if (state.projectId) resetChat("add-section");
  }, [resetChat, state.projectId]);

  const selectSection = useCallback(
    async (section: GeneratedSection) => {
      resetChat("edit-section", section);
      patch({ isLoadingHistory: true });

      try {
        const response = await getSectionMessages(section.id);
        if (response.data?.length) patch({ messages: response.data });
      } catch (requestError) {
        patch({ error: getApiErrorMessage(requestError) });
      } finally {
        patch({ isLoadingHistory: false });
      }
    },
    [patch, resetChat],
  );

  const returnToProjectChat = useCallback(() => {
    resetChat("project");
    void loadHistory();
  }, [loadHistory, resetChat]);

  const reorderSections = useCallback(
    async (sourceId: string, targetId: string) => {
      if (sourceId === targetId || state.isReordering) return;

      const previousSections = [...state.generatedSections];
      const orderedSections = sortSections(state.generatedSections);
      const sourceIndex = orderedSections.findIndex(
        ({ id }) => id === sourceId,
      );
      const targetIndex = orderedSections.findIndex(
        ({ id }) => id === targetId,
      );

      if (sourceIndex < 0 || targetIndex < 0) return;

      const [movedSection] = orderedSections.splice(sourceIndex, 1);
      orderedSections.splice(targetIndex, 0, movedSection);
      const nextSections = orderedSections.map((section, orderIndex) => ({
        ...section,
        orderIndex,
      }));

      patch({
        generatedSections: nextSections,
        isReordering: true,
        error: null,
      });

      try {
        await Promise.all(
          nextSections.map(({ id, orderIndex }) =>
            updateSectionOrder(id, orderIndex),
          ),
        );
      } catch (requestError) {
        patch({
          generatedSections: previousSections,
          error: getApiErrorMessage(requestError),
        });
      } finally {
        patch({ isReordering: false });
      }
    },
    [patch, state.generatedSections, state.isReordering],
  );

  const deleteSection = useCallback(
    async (sectionId: string) => {
      const previousSections = state.generatedSections;
      const nextSections = previousSections.filter(
        ({ id }) => id !== sectionId,
      );
      if (nextSections.length === previousSections.length) return;

      const isActive = state.activeSection?.id === sectionId;
      patch({
        generatedSections: nextSections,
        ...(isActive
          ? {
              activeSection: null,
              chatMode: "project" as const,
              messages: [welcomeMessage],
            }
          : {}),
        error: null,
      });

      try {
        await deleteSectionRequest(sectionId);
      } catch (requestError) {
        patch({
          generatedSections: previousSections,
          error: getApiErrorMessage(requestError),
        });
      }
    },
    [patch, state.activeSection, state.generatedSections],
  );

  const sendMessage = useCallback(
    async (prompt?: string) => {
      const content = (prompt ?? state.input).trim();
      if (!content || state.isLoading || state.isLoadingHistory) return;

      if (!state.projectId) {
        patch({ error: "ابتدا یک پروژه بسازید." });
        return;
      }

      if (state.chatMode === "edit-section" && !state.activeSection) {
        patch({ error: "بخشی برای ویرایش انتخاب نشده است." });
        return;
      }

      appendMessages([{ id: createClientId(), role: "user", content }]);
      patch({ input: "", error: null, isLoading: true });

      try {
        let assistantMessage = "تغییرات با موفقیت انجام شد.";
        let createdSection: GeneratedSection | null = null;

        if (state.chatMode === "add-section") {
          const response = await addSectionWithAI(state.projectId, content);
          createdSection = response.data?.section ?? null;
          assistantMessage = response.message || "بخش جدید با موفقیت اضافه شد.";
        } else if (state.chatMode === "edit-section" && state.activeSection) {
          const response = await editSectionWithAI(
            state.activeSection.id,
            content,
          );
          assistantMessage =
            response.message || "بخش انتخاب‌شده با موفقیت ویرایش شد.";
        } else {
          const response = await generateWebsite(state.projectId, content);
          assistantMessage =
            response.message || "وب‌سایت با موفقیت توسط هوش مصنوعی ساخته شد.";
        }

        const sectionsResponse = await getProjectSections(state.projectId);
        const generatedSections = sectionsResponse.data ?? [];
        // بعد از ساخت سکشن، همان سکشن را به‌عنوان سکشن فعال نگه می‌داریم تا
        // پیام بعدی به API ویرایش همان سکشن برود، نه API ساخت سکشن جدید.
        if (!createdSection && state.chatMode === "add-section") {
          const previousSectionIds = new Set(
            state.generatedSections.map(({ id }) => id),
          );
          createdSection =
            generatedSections.find(
              ({ id }) => !previousSectionIds.has(id),
            ) ?? null;
        }

        const nextActiveSection = createdSection
          ? (generatedSections.find(
              ({ id }) => id === createdSection?.id,
            ) ?? createdSection)
          : state.activeSection
          ? (generatedSections.find(
              ({ id }) => id === state.activeSection?.id,
            ) ?? state.activeSection)
          : null;

        patch({ generatedSections });

        // تاریخچه‌ی همان سکشن را باز می‌کنیم تا چت بلافاصله روی سکشن تازه‌ساخته‌شده
        // قرار بگیرد و پیام بعدی به ویرایش همان سکشن ارسال شود.
        if (createdSection && nextActiveSection) {
          await selectSection(nextActiveSection);
          return;
        }

        patch({
          activeSection: nextActiveSection,
          chatMode: createdSection ? "edit-section" : state.chatMode,
        });
        appendMessages([
          {
            id: createClientId(),
            role: "assistant",
            content: assistantMessage,
          },
        ]);
      } catch (requestError) {
        patch({ error: getApiErrorMessage(requestError) });
      } finally {
        patch({ isLoading: false });
      }
    },
    [appendMessages, patch, selectSection, state],
  );

  const clearMessages = useCallback(() => {
    patch({
      messages: [sectionIntro(state.chatMode, state.activeSection)],
      error: null,
    });
  }, [patch, state.activeSection, state.chatMode]);

  const setInput = useCallback((input: string) => patch({ input }), [patch]);

  const contextValue = useMemo<BuilderChatContextValue>(
    () => ({
      ...state,
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
      state,
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
