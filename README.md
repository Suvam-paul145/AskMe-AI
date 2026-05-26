<p align="center">
  <img src="docs/assets/hero-banner.png" alt="AskMe AI — Cognitive Learning Operating System" width="100%" />
</p>

<p align="center">
  <strong>🧠 Your study material → AI-powered personal tutor in under 60 seconds</strong>
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Features-12%2B%20AI%20Modules-8B5CF6?style=for-the-badge&logo=sparkles&logoColor=white" alt="Features"></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Stack-Next.js%2016%20%2B%20Gemini%202.0-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Tech Stack"></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Setup-5%20Minutes-22C55E?style=for-the-badge&logo=rocket&logoColor=white" alt="Quick Start"></a>
  <a href="#-license"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-comparative-analysis">Comparison</a> •
  <a href="#-database-schema">Schema</a> •
  <a href="#-ai-pipeline">AI Pipeline</a> •
  <a href="#-quick-start">Quick Start</a>
</p>

---

## 🎯 What is AskMe AI?

**AskMe AI** is a **Cognitive Learning Operating System (CLOS)** that transforms any student's raw study material — PDFs, notes, textbooks — into a fully personalized AI tutor. Unlike generic chatbots, AskMe AI is grounded exclusively in *your* uploaded content using a Retrieval-Augmented Generation (RAG) pipeline, ensuring every answer, quiz, and recommendation comes directly from your study material.

> **The Core Promise:** Upload notes → Get an AI summary → Ask doubts with cited answers → Take adaptive quizzes → See your weak topics → Get a personalized revision plan. All in one session.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 📄 Intelligent Document Ingestion
Upload PDFs or text files. The system extracts text, splits it into semantic chunks with overlapping windows, generates 768-dimensional vector embeddings via **Gemini text-embedding-004**, and indexes everything in **pgvector** for instant retrieval.

### 🧠 RAG-Powered Doubt Solver
Ask any question about your material. The system embeds your query, performs cosine similarity search against your document vectors, retrieves the most relevant chunks, and generates precise answers with **source citations** — never hallucinating beyond your content.

### 🎯 AI Quiz Generator
Automatically generates MCQ quizzes from your uploaded material. Each question is topic-tagged, includes 4 options, a correct answer, and a detailed explanation. Quiz difficulty adapts based on the complexity of your content.

### 📊 Weak Topic Detection
After each quiz attempt, an AI diagnostics engine analyzes your wrong answers, identifies weak topics, and generates a **focused revision plan** with specific study actions and time estimates.

</td>
<td width="50%">

### 🔄 Reverse Teacher Mode (RTM)
Explain a concept in your own words, and the AI evaluates your explanation against the source material. Get scored on conceptual accuracy, see identified knowledge gaps, and receive targeted feedback — the most powerful active recall technique.

### 🧬 Cognitive DNA Profile
An 8-axis cognitive profile (Conceptual, Retention, Analytical, Discipline, Consistency, Adaptability, Calibration, Efficiency) that evolves as you study, revealing your unique learning archetype.

### 🕸️ 3D Memory Graph
A real-time topological knowledge map. Mastered concepts glow blue and stabilize; weak concepts pulse red with decay rings. Drag to rotate in 3D. Visualizes your entire knowledge architecture at a glance.

### 📅 AI Study Planner
Smart study session scheduler with cognitive intensity levels (Stealth Spacing → Accelerated Exam Sprint). Prioritize urgent topics, track daily goals, and earn XP for completed sessions.

</td>
</tr>
</table>

<details>
<summary><strong>🔥 Even More Features</strong></summary>

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | Supabase Auth with email/password, session management, and route protection |
| 🎮 **Gamification Engine** | XP system, daily study streaks, and progress tracking to maintain motivation |
| 🌗 **Dark/Light Themes** | Premium dark mode default with system-respecting theme toggle |
| 📱 **Responsive Design** | Fully responsive across desktop, tablet, and mobile viewports |
| ⚡ **Real-time Progress** | Live upload progress with stage-by-stage feedback (extracting → chunking → embedding → indexing) |
| 🎆 **Celebration Effects** | Confetti animations on quiz completion for positive reinforcement |
| 📈 **Analytics Dashboard** | Recharts-powered visualizations for quiz scores, study patterns, and topic mastery over time |
| 🔄 **Auto-generated Content** | Upload triggers automatic summary + quiz + knowledge graph node creation |

</details>

---

## 🏗️ System Architecture

<p align="center">
  <img src="docs/assets/architecture-diagram.png" alt="AskMe AI System Architecture" width="100%" />
</p>

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer"]
        A["Next.js 16 App Router"]
        B["React 19 + TypeScript"]
        C["Tailwind CSS + Framer Motion"]
    end

    subgraph API["⚡ API Layer"]
        D["/api/upload"]
        E["/api/chat"]
        F["/api/quiz"]
        G["/api/quiz/submit"]
        H["/api/documents"]
        I["/api/planner"]
        J["/api/profile"]
        K["/api/graph"]
    end

    subgraph AI["🧠 AI Services Layer"]
        L["Gemini 2.0 Flash — LLM"]
        M["text-embedding-004 — Vectors"]
        N["RAG Pipeline"]
        O["PDF Extractor"]
    end

    subgraph DB["🗄️ Data Layer — Supabase"]
        P["Supabase Auth"]
        Q["PostgreSQL + pgvector"]
        R["Supabase Storage"]
        S["Row Level Security"]
    end

    A --> D & E & F & G & H & I & J & K
    D --> O --> N --> M --> Q
    E --> N --> L
    F --> L
    G --> L
    D & E & F --> P
    D --> R
    H & I & J & K --> Q
```

### RAG Pipeline — Deep Dive

```mermaid
sequenceDiagram
    participant S as 📄 Student
    participant U as 🔼 Upload API
    participant P as 📝 PDF Parser
    participant C as ✂️ Chunker
    participant E as 🧮 Embedding Model
    participant V as 🗄️ pgvector DB
    participant G as 🤖 Gemini LLM

    Note over S,G: === INGESTION PHASE ===
    S->>U: Upload PDF/TXT file
    U->>P: Extract raw text
    P->>C: Split into 500-char chunks (100-char overlap)
    C->>E: Generate 768-dim embeddings per chunk
    E->>V: Store chunks + vectors in pgvector
    U->>G: Generate structured summary
    U->>G: Auto-generate 5 MCQ quiz questions

    Note over S,G: === QUERY PHASE ===
    S->>E: Ask a doubt → embed question
    E->>V: Cosine similarity search (top 5 matches)
    V->>G: Send retrieved chunks as context
    G->>S: Grounded answer with source citations
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph Ingestion["📥 Document Ingestion"]
        A[PDF/TXT Upload] --> B[Text Extraction]
        B --> C[Semantic Chunking]
        C --> D[Vector Embedding]
        D --> E[(pgvector Index)]
    end

    subgraph Intelligence["🧠 AI Intelligence"]
        F[Student Query] --> G[Query Embedding]
        G --> H{Cosine Similarity}
        E --> H
        H --> I[Top-K Chunks Retrieved]
        I --> J[Gemini 2.0 Flash]
        J --> K[Grounded Response]
    end

    subgraph Learning["📊 Adaptive Learning"]
        L[Quiz Generation] --> M[Answer Submission]
        M --> N[Weak Topic Analysis]
        N --> O[Revision Plan]
        O --> P[Knowledge Graph Update]
    end

    Ingestion --> Intelligence
    Intelligence --> Learning
```

---

## 📊 Comparative Analysis

### AskMe AI vs. Existing EdTech Platforms

<table>
<thead>
<tr>
<th align="left">Capability</th>
<th align="center">AskMe AI 🧠</th>
<th align="center">ChatGPT</th>
<th align="center">Quizlet</th>
<th align="center">Notion AI</th>
<th align="center">Khan Academy</th>
<th align="center">Anki</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Learns from YOUR material</strong></td>
<td align="center">✅ RAG-grounded</td>
<td align="center">❌ Generic</td>
<td align="center">❌ Manual cards</td>
<td align="center">⚠️ Page-level</td>
<td align="center">❌ Fixed curriculum</td>
<td align="center">❌ Manual</td>
</tr>
<tr>
<td><strong>Source-cited answers</strong></td>
<td align="center">✅ Chunk refs</td>
<td align="center">❌ No sources</td>
<td align="center">❌ N/A</td>
<td align="center">❌ No citations</td>
<td align="center">❌ N/A</td>
<td align="center">❌ N/A</td>
</tr>
<tr>
<td><strong>Auto quiz from notes</strong></td>
<td align="center">✅ AI-generated</td>
<td align="center">⚠️ Manual prompt</td>
<td align="center">⚠️ Template-based</td>
<td align="center">❌ None</td>
<td align="center">✅ Pre-built</td>
<td align="center">❌ Manual</td>
</tr>
<tr>
<td><strong>Weak topic detection</strong></td>
<td align="center">✅ AI diagnostics</td>
<td align="center">❌ None</td>
<td align="center">⚠️ Basic stats</td>
<td align="center">❌ None</td>
<td align="center">⚠️ Exercise-level</td>
<td align="center">⚠️ Interval-based</td>
</tr>
<tr>
<td><strong>Reverse Teacher Mode</strong></td>
<td align="center">✅ Unique</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
</tr>
<tr>
<td><strong>3D Memory Graph</strong></td>
<td align="center">✅ Interactive</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
</tr>
<tr>
<td><strong>Cognitive DNA Profile</strong></td>
<td align="center">✅ 8-axis</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">⚠️ Basic progress</td>
<td align="center">❌ None</td>
</tr>
<tr>
<td><strong>Revision plan generation</strong></td>
<td align="center">✅ AI-driven</td>
<td align="center">⚠️ If prompted</td>
<td align="center">❌ None</td>
<td align="center">❌ None</td>
<td align="center">⚠️ Suggested</td>
<td align="center">⚠️ SRS only</td>
</tr>
<tr>
<td><strong>Free to deploy</strong></td>
<td align="center">✅ Open source</td>
<td align="center">❌ Paid API</td>
<td align="center">⚠️ Freemium</td>
<td align="center">❌ Paid</td>
<td align="center">✅ Free</td>
<td align="center">✅ Free</td>
</tr>
<tr>
<td><strong>Data ownership</strong></td>
<td align="center">✅ Self-hosted</td>
<td align="center">❌ OpenAI cloud</td>
<td align="center">❌ Quizlet cloud</td>
<td align="center">❌ Notion cloud</td>
<td align="center">❌ KA servers</td>
<td align="center">✅ Local</td>
</tr>
</tbody>
</table>

### Competitive Positioning Map

```mermaid
quadrantChart
    title Personalization vs Intelligence Depth
    x-axis Low Personalization --> High Personalization
    y-axis Shallow Intelligence --> Deep Intelligence
    quadrant-1 "🏆 The Future"
    quadrant-2 Smart but Generic
    quadrant-3 Basic Tools
    quadrant-4 Personalized but Shallow
    "AskMe AI": [0.88, 0.85]
    ChatGPT: [0.25, 0.90]
    Khan Academy: [0.45, 0.60]
    Quizlet: [0.55, 0.30]
    Notion AI: [0.35, 0.50]
    Anki: [0.70, 0.25]
    Google Bard: [0.20, 0.75]
    Duolingo: [0.65, 0.45]
```

### Why AskMe AI Wins

```mermaid
mindmap
  root((AskMe AI))
    🎯 Content Grounding
      RAG Pipeline
      Source Citations
      No Hallucinations
      Your Material Only
    🧪 Active Learning
      Auto Quiz Generation
      Reverse Teacher Mode
      Weak Topic Detection
      Spaced Revision Plans
    🧬 Cognitive Modeling
      8-Axis DNA Profile
      3D Memory Graph
      Learning Archetypes
      Adaptive Difficulty
    🏗️ Open Architecture
      Self-Hosted
      Free Gemini API
      Full Data Ownership
      Extensible Codebase
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    PROFILES ||--o{ DOCUMENTS : uploads
    PROFILES ||--o{ QUIZZES : takes
    PROFILES ||--o{ QUIZ_ATTEMPTS : records
    PROFILES ||--o{ CHAT_MESSAGES : sends
    PROFILES ||--o{ PLANNER_ITEMS : schedules
    PROFILES ||--o{ GRAPH_NODES : maps
    DOCUMENTS ||--o{ DOCUMENT_CHUNKS : "chunked into"
    DOCUMENTS ||--o{ QUIZZES : "generates"
    DOCUMENTS ||--o{ CHAT_MESSAGES : "references"
    QUIZZES ||--o{ QUIZ_ATTEMPTS : "attempts"
    GRAPH_NODES ||--o{ GRAPH_LINKS : connects

    PROFILES {
        uuid id PK
        text full_name
        text grade
        text exam_goal
        jsonb cognitive_profile
        int xp
        int streak
        timestamptz created_at
    }

    DOCUMENTS {
        uuid id PK
        uuid user_id FK
        text title
        text file_url
        text extracted_text
        jsonb summary
        timestamptz created_at
    }

    DOCUMENT_CHUNKS {
        uuid id PK
        uuid document_id FK
        int chunk_index
        text content
        vector embedding "768-dim"
        jsonb metadata
    }

    QUIZZES {
        uuid id PK
        uuid document_id FK
        uuid user_id FK
        text title
        jsonb questions
    }

    QUIZ_ATTEMPTS {
        uuid id PK
        uuid quiz_id FK
        uuid user_id FK
        jsonb answers
        int score
        jsonb weak_topics
        jsonb revision_plan
    }

    CHAT_MESSAGES {
        uuid id PK
        uuid document_id FK
        uuid user_id FK
        text sender
        text content
        jsonb sources
    }

    GRAPH_NODES {
        uuid id PK
        uuid user_id FK
        text label
        int strength
        text status
    }
```

---

## 🤖 AI Pipeline

### Five AI Engines

```mermaid
graph LR
    subgraph E1["📋 Summary Engine"]
        A1[Document Text] --> A2[Structured JSON Summary]
        A2 --> A3["Key Points + Formulas + Exam Tips"]
    end

    subgraph E2["💬 RAG Chat Engine"]
        B1[Student Query] --> B2[Vector Search]
        B2 --> B3[Context + LLM]
        B3 --> B4[Cited Answer]
    end

    subgraph E3["📝 Quiz Engine"]
        C1[Document Text] --> C2[MCQ Generation]
        C2 --> C3["Topic-Tagged Questions"]
    end

    subgraph E4["🔍 Diagnostics Engine"]
        D1[Wrong Answers] --> D2[Pattern Analysis]
        D2 --> D3[Weak Topics + Revision Plan]
    end

    subgraph E5["🔄 RTM Engine"]
        E51[Student Explanation] --> E52[Source Comparison]
        E52 --> E53["Score + Gaps + Feedback"]
    end
```

| Engine | Model | Input | Output |
|--------|-------|-------|--------|
| **Summary** | Gemini 2.0 Flash | Extracted document text (15K chars) | Structured JSON: overview, key points, formulas, exam tips, confusions |
| **RAG Chat** | Gemini 2.0 Flash + text-embedding-004 | Student question + top-5 vector-matched chunks | Natural language answer with source citations |
| **Quiz Gen** | Gemini 2.0 Flash | Extracted document text | Array of MCQs with options, correct answer, explanation, topic tag |
| **Diagnostics** | Gemini 2.0 Flash | Wrong answer analysis payload | Weak topics array + revision plan with actions and time estimates |
| **RTM** | Gemini 2.0 Flash | Student explanation + source context | Score (0–100), strengths, gaps, feedback, suggested review topics |

---

## 🛠️ Tech Stack

```mermaid
graph LR
    subgraph Frontend
        A[Next.js 16] --> B[React 19]
        B --> C[TypeScript 5]
        C --> D[Tailwind CSS 4]
        D --> E[Framer Motion]
        E --> F[Recharts]
        F --> G[Lucide Icons]
    end

    subgraph Backend
        H[Next.js API Routes] --> I[Server Components]
        I --> J[Middleware Auth]
    end

    subgraph AI
        K[Google Gemini 2.0 Flash] --> L[text-embedding-004]
        L --> M[RAG Pipeline]
        M --> N[pdf-parse v2]
    end

    subgraph Database
        O[Supabase] --> P[PostgreSQL]
        P --> Q[pgvector Extension]
        O --> R[Supabase Auth]
        O --> S[Supabase Storage]
        O --> T[Row Level Security]
    end

    Frontend --> Backend --> AI --> Database
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework with server components |
| **Language** | TypeScript 5 | Type-safe development across frontend and backend |
| **Styling** | Tailwind CSS 4 | Utility-first CSS with custom design tokens |
| **Animation** | Framer Motion | Smooth page transitions and micro-interactions |
| **Charts** | Recharts | Dashboard data visualizations |
| **AI Model** | Gemini 2.0 Flash | Primary LLM for all AI features (free tier) |
| **Embeddings** | text-embedding-004 | 768-dimensional vector embeddings |
| **Database** | Supabase PostgreSQL | Relational data + pgvector for similarity search |
| **Auth** | Supabase Auth | Email/password authentication with session management |
| **Storage** | Supabase Storage | Secure file storage for uploaded PDFs |
| **PDF Parsing** | pdf-parse v2 | Server-side PDF text extraction |
| **Deployment** | Vercel | Edge-optimized hosting with serverless functions |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.0
- **pnpm** (recommended) or npm
- **Supabase** account ([supabase.com](https://supabase.com))
- **Google AI** API key ([aistudio.google.com](https://aistudio.google.com/apikey))

### 1. Clone & Install

```bash
git clone https://github.com/Suvam-paul145/AskMe-AI.git
cd AskMe-AI
pnpm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Fill in your credentials:

```env
# Supabase (Dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google AI (aistudio.google.com/apikey)
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Initialize Database

1. Go to your **Supabase Dashboard → SQL Editor**
2. Run the migration file: [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)
3. Enable the `vector` extension: **Dashboard → Extensions → Search "vector" → Enable**

### 4. Launch

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live! 🎉

---

## 📁 Project Structure

```
askme-ai/
├── app/                          # Next.js App Router pages
│   ├── api/                      # 9 API endpoints
│   │   ├── auth/callback/        # OAuth callback handler
│   │   ├── chat/                 # RAG-powered chat (GET/POST)
│   │   ├── documents/            # Document listing (GET)
│   │   ├── graph/                # Knowledge graph (GET/PATCH)
│   │   ├── planner/              # Study planner CRUD
│   │   ├── profile/              # Cognitive profile (GET/PATCH)
│   │   ├── quiz/                 # Quiz generation (GET/POST)
│   │   │   └── submit/           # Quiz submission + AI analysis
│   │   └── upload/               # File ingestion pipeline
│   ├── chat/                     # RAG chat interface
│   ├── dashboard/                # Analytics dashboard
│   ├── dna/                      # Cognitive DNA profile
│   ├── login/                    # Auth (sign in/sign up)
│   ├── memory-graph/             # 3D knowledge visualization
│   ├── planner/                  # Study session planner
│   ├── quiz/                     # Interactive quiz system
│   ├── settings/                 # User preferences
│   ├── upload/                   # Document upload interface
│   ├── workspace/                # Main study workspace
│   └── page.tsx                  # Cinematic landing page
├── components/                   # Shared UI components
│   ├── navbar.tsx                # Navigation with XP/streak
│   └── footer.tsx                # Site footer
├── lib/                          # Core business logic
│   ├── ai/
│   │   ├── gemini.ts             # Gemini API client (6 functions)
│   │   ├── prompts.ts            # 5 crafted AI prompts
│   │   └── rag.ts                # RAG pipeline (chunk/embed/search)
│   ├── pdf/
│   │   └── extract-text.ts       # PDF text extraction
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Auth session refresh
│   └── store.tsx                 # Global state management
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Full DB schema + RLS
├── middleware.ts                  # Route protection
└── .env.local                    # Environment configuration
```

---

## 🎬 Demo Flow

```mermaid
journey
    title Student Learning Journey with AskMe AI
    section Upload
      Open AskMe AI: 5: Student
      Upload study PDF: 5: Student
      AI extracts and indexes content: 5: System
      See structured summary: 4: Student
    section Learn
      Ask a doubt about the material: 5: Student
      Get RAG-grounded answer with sources: 5: System
      Try Reverse Teacher Mode: 4: Student
      Get evaluated on explanation accuracy: 4: System
    section Test
      Take auto-generated quiz: 5: Student
      Submit answers for AI analysis: 5: Student
      View weak topics identified: 4: System
      Get personalized revision plan: 5: System
    section Grow
      Check 3D Memory Graph: 4: Student
      Review Cognitive DNA Profile: 4: Student
      Plan study sessions: 5: Student
      Track XP and streaks: 5: Student
```

---

## 🔒 Security

- **Row Level Security (RLS)** — Every table has RLS policies ensuring users can only access their own data
- **Server-side API keys** — All AI and database credentials are server-only (never exposed to the client)
- **Auth middleware** — Routes are protected with Supabase session validation
- **Input validation** — File type checking, size limits, and sanitized inputs on all API routes
- **Service role isolation** — Admin operations use a separate service role client

---

## 🗺️ Roadmap

- [ ] 🔊 Voice-based doubt solving
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🤝 Collaborative study rooms
- [ ] 📷 OCR for handwritten notes
- [ ] 🌍 Multi-language support
- [ ] 📊 Teacher dashboard for classroom analytics
- [ ] 🔗 LMS integration (Google Classroom, Canvas)
- [ ] 🎮 Advanced gamification (badges, leaderboards, challenges)
- [ ] 🧠 Custom fine-tuned models for subject-specific tutoring

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with 🧠 by <a href="https://github.com/Suvam-paul145">Suvam Paul</a></strong>
  <br />
  <sub>Powered by Gemini 2.0 Flash • Supabase • Next.js 16</sub>
</p>

<p align="center">
  <a href="https://github.com/Suvam-paul145/AskMe-AI">⭐ Star this repo</a> if AskMe AI helped you learn smarter!
</p>
