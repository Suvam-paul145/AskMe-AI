"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  theme: "dark" | "light";
  toggleTheme: () => void;
  documents: DocumentNode[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  addDocument: (title: string, size: string, text: string) => DocumentNode;
  chatThreads: Record<string, ChatMessage[]>;
  addMessage: (docId: string, message: string, sender: "user" | "ai", sources?: string[]) => void;
  quizzes: Record<string, QuizQuestion[]>;
  attempts: QuizAttempt[];
  addAttempt: (attempt: Omit<QuizAttempt, "id" | "date">) => void;
  weakTopics: string[];
  xp: number;
  streak: number;
  dailyGoalProgress: number; // percentage
  profile: CognitiveProfile;
  updateProfile: (updates: Partial<CognitiveProfile>) => void;
  nodes: GraphNode[];
  links: GraphLink[];
  updateNodeStrength: (nodeId: string, delta: number) => void;
  planner: PlannerItem[];
  togglePlannerItem: (id: string) => void;
  addPlannerItem: (item: Omit<PlannerItem, "id" | "completed">) => void;
}

// --- INITIAL MOCK DATA ---

const initialDocuments: DocumentNode[] = [
  {
    id: "doc-1",
    title: "Electrostatics & Coulomb's Law Notes.pdf",
    date: "2026-05-20",
    size: "1.2 MB",
    extractedText: "Electrostatics is the branch of physics that deals with the phenomena and properties of stationary or slow-moving electric charges. Coulomb's Law states that the electrical force between two charged objects is directly proportional to the product of the quantity of charge on the objects and inversely proportional to the square of the separation distance between the two objects. Formula: F = k * (q1 * q2) / r^2. Superposition Principle: The total force on a given charge due to a number of other charges is the vector sum of all the individual forces.",
    summary: {
      overview: "Introduction to stationary electric charges, field theories, and Coulomb's mechanical electrical interaction model.",
      keyPoints: [
        "Like charges repel; unlike charges attract.",
        "Electric charge is quantized (q = ne) and conserved.",
        "The electric field E = F / q points away from positive charges and towards negative charges."
      ],
      formulas: [
        "Coulomb's Law: F = k * (q1 * q2) / r^2",
        "Electric Field: E = k * q / r^2",
        "Electrostatic Potential: V = k * q / r"
      ],
      examTips: [
        "Remember that Coulomb's Law is vector-based; calculate magnitudes first, then apply directional geometry.",
        "Expect direct conceptual questions on the shell theorem."
      ],
      confusedTopics: [
        "Confusing Electric Potential (scalar) with Electric Field (vector).",
        "Forgetting the permittivity of free space constant (epsilon_0)."
      ]
    }
  },
  {
    id: "doc-2",
    title: "Intro to Molecular Biology Chapter 3.pdf",
    date: "2026-05-24",
    size: "2.4 MB",
    extractedText: "Molecular biology concerns the molecular basis of biological activity. DNA replication is the biological process of producing two identical replicas of DNA from one original DNA molecule. Central Dogma of Molecular Biology: DNA is transcribed into RNA, which is then translated into proteins. Transcription is the first step of gene expression, where a segment of DNA is copied into RNA by the enzyme RNA polymerase. Translation occurs in the ribosome, where genetic codes are read to form polypeptide chains.",
    summary: {
      overview: "Deep dive into DNA replication mechanics, gene expression pipelines, and structural macromolecule translations.",
      keyPoints: [
        "DNA is double-stranded helix; RNA is single-stranded.",
        "Transcription uses RNA Polymerase reading the template strand 3' to 5'.",
        "Ribosomes read codons (triplets of nucleotides) to align amino acids via tRNA."
      ],
      formulas: [
        "Central Dogma: DNA -> RNA -> Protein",
        "Codon match combinations: 4^3 = 64 options for 20 amino acids"
      ],
      examTips: [
        "Focus on the differences between replication in prokaryotes vs. eukaryotes.",
        "Pay special attention to translation initiation factors."
      ],
      confusedTopics: [
        "Confusing replication direction (always builds 5' to 3') with template reading direction.",
        "Confusing transcription promoters with start codons."
      ]
    }
  }
];

const initialQuizzes: Record<string, QuizQuestion[]> = {
  "doc-1": [
    {
      id: "q1-1",
      question: "What happens to the electrostatic force between two charges if the distance between them is doubled?",
      options: [
        "It is doubled.",
        "It is halved.",
        "It becomes four times larger.",
        "It becomes four times smaller."
      ],
      correctAnswer: 3,
      explanation: "By Coulomb's Law, force is inversely proportional to the square of the distance (1/r^2). Doubling the distance (2r)^2 results in 4r^2, making the force 1/4 of its original value.",
      topic: "Coulomb's Law"
    },
    {
      id: "q1-2",
      question: "Is electric potential a scalar or vector quantity?",
      options: [
        "Vector, pointing from positive to negative.",
        "Scalar, having only magnitude.",
        "Vector, pointing from negative to positive.",
        "It depends on the medium."
      ],
      correctAnswer: 1,
      explanation: "Electric potential is work done per unit charge, which does not have a directional vector component. Hence, it is a scalar quantity.",
      topic: "Electric Potential"
    },
    {
      id: "q1-3",
      question: "Which of the following is the correct formula for the electric field of a point charge?",
      options: [
        "E = k * q / r",
        "E = k * q / r^2",
        "E = k * q^2 / r^2",
        "E = k * (q1 * q2) / r^2"
      ],
      correctAnswer: 1,
      explanation: "Electric field strength (E) is force per unit charge (F/q), which yields E = k * q / r^2.",
      topic: "Electric Field"
    }
  ],
  "doc-2": [
    {
      id: "q2-1",
      question: "Which enzyme is primarily responsible for synthesizing RNA from a DNA template?",
      options: [
        "DNA Polymerase",
        "Ligase",
        "RNA Polymerase",
        "Helicase"
      ],
      correctAnswer: 2,
      explanation: "RNA Polymerase binds to DNA templates and transcribes genetic sequences into messenger RNA (mRNA).",
      topic: "Transcription"
    },
    {
      id: "q2-2",
      question: "Where in eukaryotic cells does translation take place?",
      options: [
        "In the nucleus",
        "In the ribosome / cytoplasm",
        "In the lysosome",
        "In the cell membrane"
      ],
      correctAnswer: 1,
      explanation: "Translation happens on ribosomes, which are located in the cytoplasm or bound to the endoplasmic reticulum in eukaryotic cells.",
      topic: "Translation"
    }
  ]
};

const initialChatThreads: Record<string, ChatMessage[]> = {
  "doc-1": [
    {
      id: "m-1",
      sender: "ai",
      text: "Hello! I am your AskMe AI tutor for 'Electrostatics & Coulomb's Law Notes.pdf'. Ask me any doubt about this material, or select a question to begin!",
      timestamp: "22:15"
    }
  ],
  "doc-2": [
    {
      id: "m-2",
      sender: "ai",
      text: "Welcome to your study assistant for 'Intro to Molecular Biology Chapter 3.pdf'. You can ask questions about DNA replication, transcription, and translation.",
      timestamp: "22:18"
    }
  ]
};

const initialAttempts: QuizAttempt[] = [
  {
    id: "att-1",
    documentId: "doc-1",
    documentTitle: "Electrostatics & Coulomb's Law Notes.pdf",
    score: 66,
    totalQuestions: 3,
    correctAnswersCount: 2,
    date: "2026-05-22",
    weakTopics: ["Electric Potential"]
  }
];

const initialNodes: GraphNode[] = [
  { id: "n-1", label: "Coulomb's Law", strength: 88, status: "mastered", x: 250, y: 150 },
  { id: "n-2", label: "Electric Field", strength: 75, status: "learning", x: 380, y: 220 },
  { id: "n-3", label: "Electric Potential", strength: 40, status: "weak", x: 180, y: 280 },
  { id: "n-4", label: "Superposition", strength: 92, status: "mastered", x: 420, y: 100 },
  { id: "n-5", label: "Gauss's Law", strength: 25, status: "forgotten", x: 500, y: 300 },
  { id: "n-6", label: "DNA Replication", strength: 80, status: "learning", x: 600, y: 120 },
  { id: "n-7", label: "Transcription", strength: 70, status: "learning", x: 720, y: 200 },
  { id: "n-8", label: "Translation", strength: 35, status: "weak", x: 680, y: 320 }
];

const initialLinks: GraphLink[] = [
  { source: "n-1", target: "n-2" },
  { source: "n-1", target: "n-3" },
  { source: "n-2", target: "n-5" },
  { source: "n-6", target: "n-7" },
  { source: "n-7", target: "n-8" }
];

const initialPlanner: PlannerItem[] = [
  { id: "pl-1", date: "2026-05-26", title: "Review Electric Potential formulas", duration: 15, completed: false, isUrgent: true },
  { id: "pl-2", date: "2026-05-26", title: "Translation RTM active recall session", duration: 25, completed: false },
  { id: "pl-3", date: "2026-05-27", title: "Electrostatics full revision simulator", duration: 45, completed: false },
  { id: "pl-4", date: "2026-05-25", title: "Central Dogma summary check", duration: 10, completed: true }
];

const initialProfile: CognitiveProfile = {
  conceptual: 82,
  retention: 54,
  analytical: 73,
  discipline: 60,
  consistency: 65,
  adaptability: 80,
  calibration: 68,
  efficiency: 72,
  archetype: "The Intuitive Analyst",
  description: "You have strong pattern recognition and abstract reasoning speeds, but tend to struggle with consistent spacing and schedule adherence. We recommend structural revision reminders."
};

// --- RAG & MISTAKE PROCESSING LOGIC MOCKS ---

const generateMockSummary = (title: string, text: string) => {
  const words = text.split(" ");
  const overview = `Detailed cognitive synthesis of the study materials regarding ${title.replace(/\.[^/.]+$/, "")}. Analyze core thematic links and key concepts.`;
  const keyPoints = [
    `Foundational mechanics of ${words[0] || "Concept"} are thoroughly mapped.`,
    "High structural consistency is validated in active schemas.",
    "Revision priority indicates moderate decay speed."
  ];
  const formulas = [
    `Rate of mastery = f(${words[2] || "Topic"} * retention)`,
    "Cognitive load <= 1.0"
  ];
  return {
    overview,
    keyPoints,
    formulas,
    examTips: ["Review the definitions of keywords.", "Practice MCQ representations."],
    confusedTopics: ["Mistaking intermediate links for root causes."]
  };
};

const generateMockQuiz = (title: string, text: string): QuizQuestion[] => {
  return [
    {
      id: `q-mock-${Date.now()}-1`,
      question: `What is the primary core concept introduced in this document about '${title}'?`,
      options: [
        "A highly general biological process",
        "The conceptual framework of study",
        "A specific calculation parameter",
        "An introductory definition layout"
      ],
      correctAnswer: 1,
      explanation: `The material details foundational principles regarding the subject '${title}' directly.`,
      topic: "Introduction"
    },
    {
      id: `q-mock-${Date.now()}-2`,
      question: `Why is the mathematical / physical formulation of this topic significant?`,
      options: [
        "It provides quantitative validation",
        "It helps make guess decisions",
        "It replaces qualitative diagrams",
        "It reduces focus times"
      ],
      correctAnswer: 0,
      explanation: "Formulations allow calculations and structural predictive calibrations in experimental environments.",
      topic: "Formulation"
    }
  ];
};

// --- STORE CONTEXT ---

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [documents, setDocuments] = useState<DocumentNode[]>(initialDocuments);
  const [selectedDocId, setSelectedDocId] = useState<string | null>("doc-1");
  const [chatThreads, setChatThreads] = useState<Record<string, ChatMessage[]>>(initialChatThreads);
  const [quizzes, setQuizzes] = useState<Record<string, QuizQuestion[]>>(initialQuizzes);
  const [attempts, setAttempts] = useState<QuizAttempt[]>(initialAttempts);
  const [weakTopics, setWeakTopics] = useState<string[]>(["Electric Potential"]);
  const [xp, setXp] = useState<number>(340);
  const [streak, setStreak] = useState<number>(5);
  const [dailyGoalProgress, setDailyGoalProgress] = useState<number>(40);
  const [profile, setProfile] = useState<CognitiveProfile>(initialProfile);
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [links, setLinks] = useState<GraphLink[]>(initialLinks);
  const [planner, setPlanner] = useState<PlannerItem[]>(initialPlanner);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("askme-theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
        document.documentElement.className = storedTheme;
      } else {
        document.documentElement.className = "dark";
      }

      const storedDocs = localStorage.getItem("askme-docs");
      if (storedDocs) setDocuments(JSON.parse(storedDocs));

      const storedChat = localStorage.getItem("askme-chat");
      if (storedChat) setChatThreads(JSON.parse(storedChat));

      const storedQuizzes = localStorage.getItem("askme-quizzes");
      if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));

      const storedAttempts = localStorage.getItem("askme-attempts");
      if (storedAttempts) setAttempts(JSON.parse(storedAttempts));

      const storedWeak = localStorage.getItem("askme-weak");
      if (storedWeak) setWeakTopics(JSON.parse(storedWeak));

      const storedXp = localStorage.getItem("askme-xp");
      if (storedXp) setXp(parseInt(storedXp, 10));

      const storedStreak = localStorage.getItem("askme-streak");
      if (storedStreak) setStreak(parseInt(storedStreak, 10));

      const storedProfile = localStorage.getItem("askme-profile");
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedNodes = localStorage.getItem("askme-nodes");
      if (storedNodes) setNodes(JSON.parse(storedNodes));

      const storedLinks = localStorage.getItem("askme-links");
      if (storedLinks) setLinks(JSON.parse(storedLinks));

      const storedPlanner = localStorage.getItem("askme-planner");
      if (storedPlanner) setPlanner(JSON.parse(storedPlanner));
    }
  }, []);

  // Save on modification
  const saveAndSetTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("askme-theme", newTheme);
    document.documentElement.className = newTheme;
  };

  const toggleTheme = () => {
    saveAndSetTheme(theme === "dark" ? "light" : "dark");
  };

  const addDocument = (title: string, size: string, text: string) => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: DocumentNode = {
      id: newDocId,
      title,
      date: new Date().toISOString().split("T")[0],
      size,
      extractedText: text,
      summary: generateMockSummary(title, text)
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    localStorage.setItem("askme-docs", JSON.stringify(updatedDocs));

    const newThread: ChatMessage[] = [
      {
        id: `m-init-${Date.now()}`,
        sender: "ai",
        text: `Hello! I have fully ingested '${title}' into your vector model. Ask me any conceptual question or double tap terms to explain them.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];

    const updatedChats = { ...chatThreads, [newDocId]: newThread };
    setChatThreads(updatedChats);
    localStorage.setItem("askme-chat", JSON.stringify(updatedChats));

    const generatedQuiz = generateMockQuiz(title, text);
    const updatedQuizzes = { ...quizzes, [newDocId]: generatedQuiz };
    setQuizzes(updatedQuizzes);
    localStorage.setItem("askme-quizzes", JSON.stringify(updatedQuizzes));

    // Update Nodes and Links
    const cleanTitle = title.replace(/\.[^/.]+$/, "");
    const newNodeId = `n-${newDocId}`;
    const newNode: GraphNode = {
      id: newNodeId,
      label: cleanTitle,
      strength: 45,
      status: "learning",
      x: 300 + Math.random() * 200,
      y: 200 + Math.random() * 150
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    localStorage.setItem("askme-nodes", JSON.stringify(updatedNodes));

    // Link new node to a random existing node
    if (nodes.length > 0) {
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      const updatedLinks = [...links, { source: randomNode.id, target: newNodeId }];
      setLinks(updatedLinks);
      localStorage.setItem("askme-links", JSON.stringify(updatedLinks));
    }

    // Grant XP
    const newXp = xp + 50;
    setXp(newXp);
    localStorage.setItem("askme-xp", newXp.toString());

    setSelectedDocId(newDocId);
    return newDoc;
  };

  const addMessage = (docId: string, text: string, sender: "user" | "ai", sources?: string[]) => {
    const thread = chatThreads[docId] || [];
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sources
    };

    const updatedThread = [...thread, newMessage];
    const updatedChats = { ...chatThreads, [docId]: updatedThread };
    setChatThreads(updatedChats);
    localStorage.setItem("askme-chat", JSON.stringify(updatedChats));

    // Grant XP for asking questions
    if (sender === "user") {
      const newXp = xp + 5;
      setXp(newXp);
      localStorage.setItem("askme-xp", newXp.toString());
      setDailyGoalProgress(Math.min(100, dailyGoalProgress + 10));
    }
  };

  const addAttempt = (attemptData: Omit<QuizAttempt, "id" | "date">) => {
    const newAttempt: QuizAttempt = {
      ...attemptData,
      id: `attempt-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };

    const updatedAttempts = [newAttempt, ...attempts];
    setAttempts(updatedAttempts);
    localStorage.setItem("askme-attempts", JSON.stringify(updatedAttempts));

    // Process weak topics
    const uniqueWeak = Array.from(new Set([...weakTopics, ...attemptData.weakTopics]));
    setWeakTopics(uniqueWeak);
    localStorage.setItem("askme-weak", JSON.stringify(uniqueWeak));

    // Adjust memory graph node strengths based on performance
    const cleanDocTitle = attemptData.documentTitle.replace(/\.[^/.]+$/, "");
    const matchingNode = nodes.find(n => n.label.toLowerCase() === cleanDocTitle.toLowerCase() || n.id === `n-${attemptData.documentId}`);
    if (matchingNode) {
      updateNodeStrength(matchingNode.id, attemptData.score >= 80 ? 15 : -10);
    }

    // Adjust profile variables
    const newAdaptability = Math.min(100, profile.adaptability + 3);
    const newCalibration = Math.min(100, Math.round(profile.calibration + (attemptData.score / 10)));
    const updatedProfile = {
      ...profile,
      adaptability: newAdaptability,
      calibration: newCalibration,
      consistency: Math.min(100, profile.consistency + 5)
    };
    setProfile(updatedProfile);
    localStorage.setItem("askme-profile", JSON.stringify(updatedProfile));

    // Create a revision planner item if score is low
    if (attemptData.score < 70) {
      attemptData.weakTopics.forEach(topic => {
        const newItem: PlannerItem = {
          id: `pl-new-${Date.now()}-${Math.random()}`,
          date: new Date().toISOString().split("T")[0],
          title: `Practice weak topic: ${topic}`,
          duration: 20,
          completed: false,
          isUrgent: true
        };
        const updatedPlanner = [...planner, newItem];
        setPlanner(updatedPlanner);
        localStorage.setItem("askme-planner", JSON.stringify(updatedPlanner));
      });
    }

    // Grant XP based on score
    const scoreBonus = Math.round(attemptData.score / 2);
    const newXp = xp + 30 + scoreBonus;
    setXp(newXp);
    localStorage.setItem("askme-xp", newXp.toString());
    setDailyGoalProgress(Math.min(100, dailyGoalProgress + 30));
  };

  const updateNodeStrength = (nodeId: string, delta: number) => {
    const updatedNodes = nodes.map(node => {
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
    });
    setNodes(updatedNodes);
    localStorage.setItem("askme-nodes", JSON.stringify(updatedNodes));
  };

  const updateProfile = (updates: Partial<CognitiveProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem("askme-profile", JSON.stringify(updatedProfile));
  };

  const togglePlannerItem = (id: string) => {
    const updatedPlanner = planner.map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        if (nextState) {
          // Grant XP for completing tasks
          const newXp = xp + 15;
          setXp(newXp);
          localStorage.setItem("askme-xp", newXp.toString());
          setDailyGoalProgress(Math.min(100, dailyGoalProgress + 20));
        }
        return { ...item, completed: nextState };
      }
      return item;
    });
    setPlanner(updatedPlanner);
    localStorage.setItem("askme-planner", JSON.stringify(updatedPlanner));
  };

  const addPlannerItem = (itemData: Omit<PlannerItem, "id" | "completed">) => {
    const newItem: PlannerItem = {
      ...itemData,
      id: `pl-${Date.now()}`,
      completed: false
    };
    const updatedPlanner = [...planner, newItem];
    setPlanner(updatedPlanner);
    localStorage.setItem("askme-planner", JSON.stringify(updatedPlanner));
  };

  return (
    <StoreContext.Provider
      value={{
        theme,
        toggleTheme,
        documents,
        selectedDocId,
        setSelectedDocId,
        addDocument,
        chatThreads,
        addMessage,
        quizzes,
        attempts,
        addAttempt,
        weakTopics,
        xp,
        streak,
        dailyGoalProgress,
        profile,
        updateProfile,
        nodes,
        links,
        updateNodeStrength,
        planner,
        togglePlannerItem,
        addPlannerItem
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
