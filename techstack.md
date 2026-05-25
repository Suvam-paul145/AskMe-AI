# AskMe AI MVP Tech Stack

## Product Purpose

AskMe AI should help a student turn their own study material into an AI tutor within minutes.

For the hackathon MVP, the product must prove one simple promise:

> Upload notes or a PDF. AskMe AI summarizes it, answers doubts from that material, generates a quiz, detects weak topics, and recommends what to revise next.

This is stronger than building a large "AI learning operating system" in week one. The futuristic roadmap can stay as the vision, but the MVP must be small, reliable, demo-friendly, and shippable.

## One-Week MVP Principle

Build one polished web app, one backend, one database, one AI provider, and one deployment path.

Do not split effort across mobile apps, teacher dashboards, parent dashboards, voice, advanced gamification, Neo4j, Kafka, Kubernetes, custom ML models, or complex microservices.

## Final MVP Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + TypeScript | Fast full-stack web development, easy deployment, strong demo experience |
| Styling | Tailwind CSS + shadcn/ui | Fast professional UI without designing every component from scratch |
| Backend | Next.js API routes / server actions | Avoids maintaining a separate FastAPI backend during a one-week build |
| Database | Supabase Postgres | Auth, relational data, storage, and pgvector in one managed platform |
| Auth | Supabase Auth | Email/password or magic link setup without custom auth work |
| File Storage | Supabase Storage | Store uploaded PDFs and extracted text metadata beside user data |
| Vector Search | Supabase pgvector | Keeps RAG inside Postgres and avoids a separate vector database |
| AI SDK | Vercel AI SDK | Streaming chat UI and model calls fit naturally with Next.js |
| LLM | OpenAI GPT-4o mini for normal tasks, GPT-4o for demo-critical reasoning | Good speed/cost balance while keeping quality available for important flows |
| Embeddings | OpenAI text-embedding-3-small | Cost-effective embeddings for document search |
| PDF Parsing | pdf-parse or unstructured text extraction in Node | Simple PDF text extraction without a Python service |
| Charts | Recharts | Simple dashboard charts for quiz scores and weak topics |
| State/Data Fetching | TanStack Query only if needed | Add only when server state becomes messy; otherwise use simple React state |
| Deployment | Vercel | Easiest Next.js deployment and best hackathon demo flow |
| Monitoring | Sentry free tier | Catch demo-breaking runtime errors quickly |

## Recommended Project Shape

```txt
askme-ai/
  app/
    page.tsx
    dashboard/page.tsx
    upload/page.tsx
    workspace/[documentId]/page.tsx
    quiz/[quizId]/page.tsx
    api/
      upload/route.ts
      documents/[documentId]/summary/route.ts
      chat/route.ts
      quiz/route.ts
      quiz/[quizId]/submit/route.ts
  components/
    upload/
    chat/
    quiz/
    dashboard/
    ui/
  lib/
    ai/
      prompts.ts
      rag.ts
      embeddings.ts
    supabase/
      client.ts
      server.ts
    pdf/
      extract-text.ts
    analytics/
      weak-topics.ts
  supabase/
    migrations/
```

## MVP Features To Build

### 1. Upload Study Material

Student uploads a PDF or text notes file.

The system should:

- Store the original file in Supabase Storage
- Extract text
- Split text into chunks
- Generate embeddings
- Store chunks and embeddings in Supabase Postgres

Demo value: judges immediately see the app works on the student's own material.

### 2. AI Summary

Generate a structured summary from the uploaded material.

The summary should include:

- Key concepts
- Simple explanation
- Important formulas or definitions
- Exam-focused bullet points
- "Things students usually confuse"

Demo value: instant transformation from boring notes into usable study material.

### 3. Contextual Doubt Solver

Student asks questions about the uploaded material.

The system should:

- Embed the question
- Retrieve the top matching document chunks with pgvector
- Ask the LLM to answer only using retrieved context
- Show source snippets or page references when available

Demo value: this separates AskMe AI from a generic chatbot.

### 4. Quiz Generator

Generate a quiz from the uploaded material.

Quiz format for MVP:

- 5 to 10 MCQs
- 4 options each
- Correct answer
- Short explanation
- Topic tag per question
- Difficulty: easy, medium, hard

Demo value: active recall feels more impressive than summarization alone.

### 5. Weak Topic Detection

After quiz submission, calculate weak topics from wrong answers.

MVP logic:

- Group wrong answers by topic tag
- Count accuracy per topic
- Mark weak topics below 60 percent accuracy
- Generate a short revision plan for the weakest 2 to 3 topics

Demo value: proves AskMe AI adapts to the student.

## Database Tables

Use this minimal schema first.

```sql
profiles
- id uuid primary key
- full_name text
- grade text
- exam_goal text
- created_at timestamptz

documents
- id uuid primary key
- user_id uuid
- title text
- file_url text
- extracted_text text
- summary jsonb
- created_at timestamptz

document_chunks
- id uuid primary key
- document_id uuid
- user_id uuid
- chunk_index int
- content text
- embedding vector(1536)
- metadata jsonb

quizzes
- id uuid primary key
- document_id uuid
- user_id uuid
- title text
- questions jsonb
- created_at timestamptz

quiz_attempts
- id uuid primary key
- quiz_id uuid
- user_id uuid
- answers jsonb
- score int
- weak_topics jsonb
- revision_plan jsonb
- created_at timestamptz
```

## AI Prompts Needed

Keep prompt work limited to four prompts.

| Prompt | Purpose |
|---|---|
| Summary prompt | Turn extracted notes into structured study notes |
| RAG answer prompt | Answer doubts only from retrieved chunks |
| Quiz prompt | Generate valid JSON quiz questions with topic tags |
| Weak-topic prompt | Explain mistakes and create a focused revision plan |

All AI outputs that enter the database should be JSON. This prevents UI-breaking responses during the demo.

## What To Avoid For MVP

Do not build these in the first week:

- Separate FastAPI backend
- ChromaDB, Pinecone, or multiple vector stores
- Neo4j memory graph
- Kafka, Redis Streams, Celery, or background workers
- Mobile app
- Voice assistant
- OCR for handwritten notes
- Parent dashboard
- Teacher dashboard
- Full gamification system
- Advanced learning DNA profile
- Custom ML models
- Complex payment system
- Multi-language support beyond a simple "explain in Hindi" demo option

These are good future features, but they will slow down the MVP.

## One-Week Build Plan

### Day 1: Foundation

- Create Next.js app with TypeScript
- Add Tailwind CSS and shadcn/ui
- Set up Supabase project
- Add auth
- Create database tables
- Deploy early to Vercel

### Day 2: Upload Pipeline

- Build upload page
- Store PDF in Supabase Storage
- Extract text
- Save document record
- Show extracted preview

### Day 3: Embeddings and Summary

- Chunk extracted text
- Generate embeddings
- Store vectors in pgvector
- Generate and display AI summary

### Day 4: RAG Chat

- Build chat UI
- Retrieve relevant chunks
- Stream AI answer
- Add source snippets
- Test with one strong demo PDF

### Day 5: Quiz System

- Generate quiz JSON from document
- Build quiz UI
- Store quiz attempts
- Show score and explanations

### Day 6: Weak Topics and Dashboard

- Detect weak topics from quiz answers
- Generate revision plan
- Build dashboard with documents, scores, weak topics, and next actions
- Add Recharts visualizations if time allows

### Day 7: Polish and Demo

- Fix bugs
- Add loading states and empty states
- Add sample demo document
- Prepare 3-minute demo flow
- Record backup demo video
- Lock scope

## Hackathon Demo Flow

1. Open dashboard with a clean student profile.
2. Upload a real study PDF.
3. Show summary generated from the PDF.
4. Ask a specific doubt and show the answer cites the uploaded material.
5. Generate a quiz.
6. Answer 2 questions wrong intentionally.
7. Show weak topic detection and revision plan.
8. Close with: "AskMe AI turns any student's notes into a personal tutor."

## Winning Differentiator

The MVP should not compete as "another ChatGPT wrapper."

It should compete as:

> A personal learning engine that understands your uploaded material, tests you on it, finds your weak topics, and tells you exactly what to revise next.

That is the smallest version of the larger AskMe AI vision that can realistically be built in one week.
