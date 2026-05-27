"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

// --- TYPES ---

export interface DocumentNode {
  id: string;
  title: string;
  date: string;
  size: string;
  extractedText: string;
  summary: {
    overview: string;
    keyPoints: string[];
    formulas: string[];
    examTips: string[];
    confusedTopics: string[];
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index
  explanation: string;
  topic: string;
}

export interface QuizAttempt {
  id: string;
  documentId: string;
  documentTitle: string;
  score: number; // percentage
  totalQuestions: number;
  correctAnswersCount: number;
  date: string;
  weakTopics: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  strength: number; // 0 to 100
  status: "mastered" | "learning" | "weak" | "forgotten" | "unknown";
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface PlannerItem {
  id: string;
  date: string;
  title: string;
  duration: number; // minutes
  completed: boolean;
  isUrgent?: boolean;
}

export interface CognitiveProfile {
  conceptual: number;
  retention: number;
  analytical: number;
  discipline: number;
  consistency: number;
  adaptability: number;
  calibration: number;
  efficiency: number;
  archetype: string;
  description: string;
}

export interface StoreContextType {
  // Auth
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;

  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Documents
  documents: DocumentNode[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  refreshDocuments: () => Promise<void>;

  // Chat
  chatThreads: Record<string, ChatMessage[]>;
  sendMessage: (docId: string, message: string, mode?: string) => Promise<string>;
  loadChatHistory: (docId: string) => Promise<void>;

  // Quiz
  quizzes: Record<string, QuizQuestion[]>;
  loadQuiz: (docId: string) => Promise<void>;
  attempts: QuizAttempt[];
  submitQuizAttempt: (quizId: string, answers: { questionIndex: number; selectedOption: number }[]) => Promise<any>;

  // Weak topics
  weakTopics: string[];

  // Stats
  xp: number;
  streak: number;
  dailyGoalProgress: number;

  // Profile
  profile: CognitiveProfile;
  updateProfile: (updates: Partial<CognitiveProfile>) => void;
  refreshProfile: () => Promise<void>;

  // Graph
  nodes: GraphNode[];
  links: GraphLink[];
  refreshGraph: () => Promise<void>;
  updateNodeStrength: (nodeId: string, delta: number) => void;

  // Planner
  planner: PlannerItem[];
  togglePlannerItem: (id: string) => void;
  addPlannerItem: (item: Omit<PlannerItem, "id" | "completed">) => void;
  refreshPlanner: () => Promise<void>;

  // Upload
  uploadDocument: (file: File, onProgress?: (stage: string, progress: number) => void) => Promise<DocumentNode | null>;
}

// --- DEFAULTS ---

const defaultProfile: CognitiveProfile = {
  conceptual: 50,
  retention: 50,
  analytical: 50,
  discipline: 50,
  consistency: 50,
  adaptability: 50,
  calibration: 50,
  efficiency: 50,
  archetype: "New Learner",
  description: "Your cognitive profile will evolve as you study, take quizzes, and interact with the AI tutor.",
};

// --- STORE CONTEXT ---

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase] = useState(() => createClient());

  // Auth
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Data
  const [documents, setDocuments] = useState<DocumentNode[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [chatThreads, setChatThreads] = useState<Record<string, ChatMessage[]>>({});
  const [quizzes, setQuizzes] = useState<Record<string, QuizQuestion[]>>({});
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [dailyGoalProgress, setDailyGoalProgress] = useState<number>(0);
  const [profile, setProfile] = useState<CognitiveProfile>(defaultProfile);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [planner, setPlanner] = useState<PlannerItem[]>([]);

  // --- AUTH ---
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("askme-theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
        document.documentElement.className = storedTheme;
      } else {
        document.documentElement.className = "dark";
      }
    }
  }, []);

  // Load data when user signs in
  useEffect(() => {
    if (user) {
      refreshDocuments();
      refreshProfile();
      refreshGraph();
      refreshPlanner();
    } else {
      // Reset state on sign out
      setDocuments([]);
      setSelectedDocId(null);
      setChatThreads({});
      setQuizzes({});
      setAttempts([]);
      setWeakTopics([]);
      setXp(0);
      setStreak(0);
      setProfile(defaultProfile);
      setNodes([]);
      setLinks([]);
      setPlanner([]);
    }
  }, [user]);

  // --- AUTH FUNCTIONS ---
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // --- THEME ---
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("askme-theme", newTheme);
    document.documentElement.className = newTheme;
  };

  // --- DOCUMENTS ---
  const refreshDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        const docs: DocumentNode[] = (data.documents || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          date: d.created_at?.split("T")[0] || "",
          size: d.file_size || "—",
          extractedText: d.extracted_text || "",
          summary: d.summary || {
            overview: "",
            keyPoints: [],
            formulas: [],
            examTips: [],
            confusedTopics: [],
          },
        }));
        setDocuments(docs);
        if (docs.length > 0 && !selectedDocId) {
          setSelectedDocId(docs[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  }, [selectedDocId]);

  // --- CHAT ---
  const loadChatHistory = useCallback(async (docId: string) => {
    try {
      const res = await fetch(`/api/chat?documentId=${docId}`);
      if (res.ok) {
        const data = await res.json();
        const messages: ChatMessage[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          sender: m.sender,
          text: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sources: m.sources,
        }));
        setChatThreads((prev) => ({ ...prev, [docId]: messages }));
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  }, []);

  const sendMessage = useCallback(async (docId: string, message: string, mode?: string): Promise<string> => {
    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatThreads((prev) => ({
      ...prev,
      [docId]: [...(prev[docId] || []), userMsg],
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, documentId: docId, mode }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sources: data.sources,
        };
        setChatThreads((prev) => ({
          ...prev,
          [docId]: [...(prev[docId] || []), aiMsg],
        }));
        setXp((prev) => prev + 5);
        setDailyGoalProgress((prev) => Math.min(100, prev + 10));
        return data.response;
      }
      const errorText = data.error || "Sorry, I couldn't process your request. Please try again.";
      const aiMsg: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatThreads((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), aiMsg],
      }));
      return errorText;
    } catch (err) {
      console.error("Chat error:", err);
      const errorText = "Network or server error. Please try again.";
      const aiMsg: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        text: errorText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatThreads((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), aiMsg],
      }));
      return errorText;
    }
  }, []);

  // --- QUIZ ---
  const loadQuiz = useCallback(async (docId: string) => {
    try {
      const res = await fetch(`/api/quiz?documentId=${docId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.quizzes && data.quizzes.length > 0) {
          const latestQuiz = data.quizzes[0];
          const questions: QuizQuestion[] = (latestQuiz.questions || []).map((q: any, idx: number) => ({
            id: `${latestQuiz.id}-q${idx}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            topic: q.topic,
          }));
          setQuizzes((prev) => ({ ...prev, [docId]: questions }));
        }
      }
    } catch (err) {
      console.error("Failed to load quiz:", err);
    }
  }, []);

  const submitQuizAttempt = useCallback(async (quizId: string, answers: { questionIndex: number; selectedOption: number }[]) => {
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.attempt) {
          const newAttempt: QuizAttempt = {
            id: data.attempt.id,
            documentId: "",
            documentTitle: "",
            score: data.attempt.score,
            totalQuestions: data.attempt.totalQuestions,
            correctAnswersCount: data.attempt.correctCount,
            date: new Date().toISOString().split("T")[0],
            weakTopics: data.attempt.weakTopics || [],
          };
          setAttempts((prev) => [newAttempt, ...prev]);
          setXp((prev) => prev + (data.attempt.xpGain || 30));
          setDailyGoalProgress((prev) => Math.min(100, prev + 30));
          if (data.attempt.weakTopics) {
            setWeakTopics((prev) => [...new Set([...prev, ...data.attempt.weakTopics])]);
          }
        }
        return data;
      }
      return null;
    } catch (err) {
      console.error("Submit quiz error:", err);
      return null;
    }
  }, []);

  // --- PROFILE ---
  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const cogProfile = data.profile.cognitive_profile || {};
          setProfile({
            conceptual: cogProfile.conceptual ?? 50,
            retention: cogProfile.retention ?? 50,
            analytical: cogProfile.analytical ?? 50,
            discipline: cogProfile.discipline ?? 50,
            consistency: cogProfile.consistency ?? 50,
            adaptability: cogProfile.adaptability ?? 50,
            calibration: cogProfile.calibration ?? 50,
            efficiency: cogProfile.efficiency ?? 50,
            archetype: cogProfile.archetype || "New Learner",
            description: cogProfile.description || "Your profile will evolve with study activity.",
          });
          setXp(data.profile.xp || 0);
          setStreak(data.profile.streak || 0);
        }
        if (data.weakTopics) {
          setWeakTopics(data.weakTopics);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<CognitiveProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    // Persist to server
    fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cognitive_profile: { ...profile, ...updates } }),
    }).catch(console.error);
  }, [profile]);

  // --- GRAPH ---
  const refreshGraph = useCallback(async () => {
    try {
      const res = await fetch("/api/graph");
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error("Failed to fetch graph:", err);
    }
  }, []);

  const updateNodeStrength = useCallback((nodeId: string, delta: number) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const newStrength = Math.max(0, Math.min(100, node.strength + delta));
          let status: GraphNode["status"] = "unknown";
          if (newStrength >= 85) status = "mastered";
          else if (newStrength >= 60) status = "learning";
          else if (newStrength >= 35) status = "weak";
          else status = "forgotten";
          return { ...node, strength: newStrength, status };
        }
        return node;
      })
    );

    // Persist to server
    fetch("/api/graph", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, delta }),
    }).catch(console.error);
  }, []);

  // --- PLANNER ---
  const refreshPlanner = useCallback(async () => {
    try {
      const res = await fetch("/api/planner");
      if (res.ok) {
        const data = await res.json();
        setPlanner(
          (data.items || []).map((item: any) => ({
            id: item.id,
            date: item.date || "",
            title: item.title,
            duration: item.duration,
            completed: item.completed,
            isUrgent: item.is_urgent,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch planner:", err);
    }
  }, []);

  const togglePlannerItem = useCallback((id: string) => {
    setPlanner((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          if (nextState) {
            setXp((x) => x + 15);
            setDailyGoalProgress((p) => Math.min(100, p + 20));
          }
          // Persist to server
          fetch("/api/planner", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, completed: nextState }),
          }).catch(console.error);
          return { ...item, completed: nextState };
        }
        return item;
      })
    );
  }, []);

  const addPlannerItem = useCallback((itemData: Omit<PlannerItem, "id" | "completed">) => {
    const tempId = `temp-${Date.now()}`;
    const newItem: PlannerItem = { ...itemData, id: tempId, completed: false };
    setPlanner((prev) => [...prev, newItem]);

    // Persist to server
    fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: itemData.title,
        date: itemData.date,
        duration: itemData.duration,
        isUrgent: itemData.isUrgent,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.item) {
          setPlanner((prev) =>
            prev.map((p) =>
              p.id === tempId
                ? { ...p, id: data.item.id }
                : p
            )
          );
        }
      })
      .catch(console.error);
  }, []);

  // --- UPLOAD ---
  const uploadDocument = useCallback(async (
    file: File,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<DocumentNode | null> => {
    try {
      onProgress?.("Uploading file to secure storage...", 10);

      const formData = new FormData();
      formData.append("file", file);

      onProgress?.("Extracting text and generating AI analysis...", 30);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      onProgress?.("Processing vector embeddings...", 70);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      onProgress?.("Syncing cognitive profile...", 90);

      // Refresh data
      await refreshDocuments();
      await refreshGraph();
      setXp((prev) => prev + 50);

      onProgress?.("Ingestion complete!", 100);

      if (data.document) {
        setSelectedDocId(data.document.id);
        return {
          id: data.document.id,
          title: data.document.title,
          date: new Date().toISOString().split("T")[0],
          size: data.document.fileSize,
          extractedText: "",
          summary: data.document.summary,
        };
      }
      return null;
    } catch (err: any) {
      console.error("Upload error:", err);
      throw err;
    }
  }, [refreshDocuments, refreshGraph]);

  return (
    <StoreContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        theme,
        toggleTheme,
        documents,
        selectedDocId,
        setSelectedDocId,
        refreshDocuments,
        chatThreads,
        sendMessage,
        loadChatHistory,
        quizzes,
        loadQuiz,
        attempts,
        submitQuizAttempt,
        weakTopics,
        xp,
        streak,
        dailyGoalProgress,
        profile,
        updateProfile,
        refreshProfile,
        nodes,
        links,
        refreshGraph,
        updateNodeStrength,
        planner,
        togglePlannerItem,
        addPlannerItem,
        refreshPlanner,
        uploadDocument,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
