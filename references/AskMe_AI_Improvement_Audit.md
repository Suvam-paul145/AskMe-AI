# 🧠 AskMe AI — Full Deployment Audit & Improvement Notes
> **Audited URL:** https://ask-me-ai-chi.vercel.app  
> **Repo:** https://github.com/Suvam-paul145/AskMe-AI  
> **Audit Date:** May 2026  
> **Severity Tags:** 🔴 CRITICAL · 🟡 IMPORTANT · 🟢 POLISH · 💡 FEATURE ADD

---

## 📋 Table of Contents

1. [Global / Navbar Issues](#1-global--navbar-issues)
2. [Landing Page `/`](#2-landing-page-)
3. [Login Page `/login`](#3-login-page-login)
4. [Features Page `/features`](#4-features-page-features)
5. [Architecture Page `/architecture`](#5-architecture-page-architecture)
6. [Pricing Page `/pricing`](#6-pricing-page-pricing)
7. [Upload Page `/upload`](#7-upload-page-upload)
8. [Dashboard `/dashboard`](#8-dashboard-dashboard)
9. [Workspace `/workspace`](#9-workspace-workspace)
10. [Quiz `/quiz`](#10-quiz-quiz)
11. [Memory Graph `/memory-graph`](#11-memory-graph-memory-graph)
12. [Learning DNA `/dna`](#12-learning-dna-dna)
13. [Planner `/planner`](#13-planner-planner)
14. [Settings `/settings`](#14-settings-settings)
15. [Footer (Global)](#15-footer-global)
16. [Missing Pages / 404s](#16-missing-pages--404s)
17. [SEO & Meta](#17-seo--meta)
18. [Auth Flow (Systemic)](#18-auth-flow-systemic)
19. [Performance & Code Quality](#19-performance--code-quality)

---

## 1. Global / Navbar Issues

### 🔴 CRITICAL — Streak/XP shown for logged-out users
**What's happening:** The navbar displays `0d` and `0 XP` counters even when no user is logged in. This looks like a broken state to a first-time visitor.

**Fix:** In `components/navbar.tsx`, wrap the streak/XP display in a conditional:
```tsx
{user && (
  <div className="flex items-center gap-2">
    <span>{profile?.streak ?? 0}d</span>
    <span>{profile?.xp ?? 0} XP</span>
  </div>
)}
```
Replace with a `Login` button for unauthenticated visitors.

---

### 🔴 CRITICAL — Navbar `/settings` link renders as literal path text
**What's happening:** The settings nav item renders as the text `/settings` instead of a human label like "Settings" or a gear icon. This is a labeling bug.

**Fix:** In `components/navbar.tsx`, change the link content:
```tsx
// ❌ Current (broken render)
<Link href="/settings">/settings</Link>

// ✅ Fix
<Link href="/settings">
  <Settings size={18} />
</Link>
```

---

### 🟡 IMPORTANT — No active state on navbar links
**What's happening:** None of the nav links (`Features`, `Architecture`, `Pricing`) visually indicate which page is currently active.

**Fix:** Use `usePathname()` from `next/navigation` and apply an active class:
```tsx
const pathname = usePathname();
<Link
  href="/features"
  className={pathname === '/features' ? 'text-violet-400 border-b border-violet-400' : 'text-gray-300'}
>
  Features
</Link>
```

---

### 🟡 IMPORTANT — No user avatar / account dropdown when logged in
**What's happening:** After login, there is no visible user avatar, name, or dropdown in the navbar. Users have no clear way to log out or access profile.

**Fix:** Add a `UserMenu` component that shows avatar + dropdown (Profile, Settings, Logout) when `user` session exists.

---

## 2. Landing Page `/`

### 🔴 CRITICAL — Hero banner image broken / missing
**What's happening:** The README references `docs/assets/hero-banner.png` but the landing page doesn't render any actual product screenshot. The cinematic text-only scenes don't demonstrate the product.

**Fix:** Add at least one real product screenshot or a mock UI GIF/video inside the scroll sequence. Students need to *see* the dashboard before signing up.

---

### 🔴 CRITICAL — Zero social proof on the page
**What's happening:** No testimonials, no user count ("trusted by X students"), no university logos, no ratings. The landing page makes no trust-building argument.

**Fix:** Add a social proof section after Scene 04:
- 3 student testimonial cards with photo, name, grade, quote
- A stat bar: e.g. "500+ Documents Processed · 1,200+ Quizzes Generated · 4.9★ Average Rating"

---

### 🟡 IMPORTANT — CTA "Map Your Knowledge System" routes unauthenticated users to login with no context
**What's happening:** Clicking the primary CTA → `/upload` → silently redirects to `/login` with no message. The user doesn't know why they're seeing a login form.

**Fix:** Either:
1. Make the primary CTA "Start Free — No Account Needed" and use a guest/demo mode for first impression
2. Or show a toast/banner on the login page: `"Create a free account to upload your first document"`

---

### 🟡 IMPORTANT — Cinematic scroll scenes have no actual product visuals
**What's happening:** Scenes 02–04 describe "3D topological maps", "morphing interfaces", and "vector alignment" — all with abstract copy but no visual demonstration. This creates skepticism.

**Fix:** Replace or augment each scene with:
- Scene 02 → actual screenshot of the upload pipeline progress steps
- Scene 03 → a real or mocked 3D memory graph screenshot
- Scene 04 → a screenshot of the quiz adaptive interface

---

### 🟡 IMPORTANT — No "How it Works" section
**What's happening:** The landing page has no simple 3-step flow that explains the core promise (Upload → Summarize → Quiz → Track). This is the #1 conversion driver for EdTech tools.

**Fix:** Add a `HowItWorks` section between scenes:
```
Step 1: Upload your PDF or notes
Step 2: AI summarizes, generates quizzes, and indexes your content
Step 3: Study smarter — chat, quiz, and track your weak spots
```

---

### 🟢 POLISH — Footer social links are dead (`#`)
**What's happening:** All three social icon links in the landing footer point to `#` — no actual social profiles linked.

**Fix:** Either link to real profiles (GitHub at minimum: `https://github.com/Suvam-paul145/AskMe-AI`) or remove the social icons entirely.

---

### 🟢 POLISH — No Open Graph image set for link previews
**What's happening:** Sharing the URL on Discord, WhatsApp, or Twitter shows a blank preview. The meta description is generic.

**Fix:** In `app/layout.tsx`:
```tsx
export const metadata = {
  openGraph: {
    title: 'AskMe AI — Cognitive Learning OS',
    description: 'Upload notes → AI tutor, quizzes, and revision plans in 60 seconds.',
    images: ['/og-image.png'],
  }
}
```
Create a proper `og-image.png` in `/public`.

---

## 3. Login Page `/login`

### 🔴 CRITICAL — Sci-fi copy ("Authenticate Cognitive Signature", "Password Key", "Launch Dashboard") is alienating
**What's happening:** These labels are unnecessarily abstract for a login form. Students and judges testing the product will be confused.

**Fix:** Use plain, friendly labels:
- "Authenticate Cognitive Signature" → "Welcome back"
- "Email Address" ✓ (keep)
- "Password Key" → "Password"
- "Launch Dashboard" → "Sign In"
- "Register Profile" → "Create an account"

---

### 🔴 CRITICAL — No "Forgot Password" link
**What's happening:** There's no password reset option visible on the login form. Supabase Auth supports this natively.

**Fix:** Add below the password field:
```tsx
<Link href="/reset-password" className="text-xs text-violet-400 hover:underline">
  Forgot password?
</Link>
```
And create `/app/reset-password/page.tsx` using `supabase.auth.resetPasswordForEmail()`.

---

### 🟡 IMPORTANT — No Google OAuth button
**What's happening:** The README mentions OAuth but the login page only has email/password. Google OAuth dramatically lowers sign-up friction, especially for students with Google accounts.

**Fix:** Add a Google OAuth button:
```tsx
<button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
  Continue with Google
</button>
```
Configure in Supabase Dashboard → Authentication → Providers.

---

### 🟡 IMPORTANT — No redirect-back context after login
**What's happening:** If a user tries to visit `/memory-graph` before logging in, they get redirected to `/login` but after login they land on `/dashboard` — not where they wanted to go.

**Fix:** Preserve the intended URL in a `redirectTo` query param in middleware:
```ts
// middleware.ts
const redirectUrl = new URL('/login', request.url);
redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
return NextResponse.redirect(redirectUrl);
```
Then after login, read `searchParams.get('redirectTo')` and route accordingly.

---

### 🟢 POLISH — No loading state on the "Launch Dashboard" button
**What's happening:** After clicking sign-in, there's no visual feedback while the auth request processes. Users may click multiple times.

**Fix:** Add a loading spinner and disable the button during auth:
```tsx
const [loading, setLoading] = useState(false);
<button disabled={loading}>
  {loading ? <Spinner /> : 'Sign In'}
</button>
```

---

## 4. Features Page `/features`

### 🔴 CRITICAL — "TELEMETRY SYNC INTERFACE: ONLINE — No telemetry data." shown to all visitors
**What's happening:** This telemetry panel on every selected feature card looks like a broken/empty UI to anyone visiting. It was probably meant for authenticated users with real data.

**Fix:** Either:
1. Show hardcoded realistic demo telemetry data for the selected feature (makes it look alive)
2. Or hide the telemetry panel entirely for unauthenticated visitors with a note: "Log in to see live metrics from your study sessions"

---

### 🔴 CRITICAL — Hardcoded fake metrics ("Calibration Index: 96.4%", "Cognitive Load Delta: -42%")
**What's happening:** These numbers are static and identical regardless of which feature or user. Judges/investors will notice this immediately.

**Fix:** Either:
- Connect to real per-user data when logged in
- Or label them clearly as "Platform Benchmarks" or "Average Improvement" to set correct expectations
- Add a footnote: "Based on beta user sessions"

---

### 🟡 IMPORTANT — Clicking a feature card doesn't navigate or open any demo
**What's happening:** The feature grid is purely informational. Clicking cards does nothing. There's no CTA to try each feature.

**Fix:** Add to each feature card:
```tsx
<Link href={featureRoute} className="mt-3 text-xs text-violet-400 underline">
  Try it →
</Link>
```
Map features to their actual pages: Quiz → `/quiz`, Memory Graph → `/memory-graph`, etc.

---

### 🟢 POLISH — Feature grid has no visual hierarchy between "flagship" and secondary features
**What's happening:** All 10 feature cards look the same. The RAG Doubt Solver and Quiz Engine (core MVP features) should be visually elevated.

**Fix:** Add a `featured` badge or larger card size to the top 3–4 features. Use a `featured` prop pattern in the card component.

---

## 5. Architecture Page `/architecture`

### 🔴 CRITICAL — Telemetry log shows hardcoded static timestamps
**What's happening:** The "ARCHITECTURE TELEMETRY READOUT" shows `[8:52:29 AM]` — a static time that never updates. This immediately reveals it's fake to technical reviewers.

**Fix:** Replace with a `useEffect` that generates log entries using `new Date().toLocaleTimeString()` when the node is selected:
```tsx
useEffect(() => {
  const time = new Date().toLocaleTimeString();
  setLogs([
    `[${time}] [PIPELINE] Initializing node step ${nodeId}: ${nodeName}`,
    ...
  ]);
}, [selectedNode]);
```

---

### 🔴 CRITICAL — Misleading copy: "pipeline runs client-side vector synthesis"
**What's happening:** The text "the pipeline runs client-side vector synthesis, maintaining zero database latency" is technically inaccurate — the actual architecture uses server-side Gemini embeddings and Supabase pgvector. This is confusing and factually wrong.

**Fix:** Replace with accurate copy:
> "The architecture overview is rendered client-side for visualization. In production, vector synthesis and retrieval run on Supabase pgvector with Gemini text-embedding-004."

---

### 🟡 IMPORTANT — Selecting different pipeline nodes shows the same static log content
**What's happening:** Clicking Node 02 (Semantic Chunking) should show different log output than Node 01. Currently all nodes show the same template text.

**Fix:** Create a `pipelineNodes` config array with unique `logLines` per node:
```tsx
const pipelineNodes = [
  { id: '01', name: 'Document Ingestion', logs: ['Parsing PDF...', 'Extracting unicode text...'] },
  { id: '02', name: 'Semantic Chunking', logs: ['Splitting into 500-char chunks...', '100-char overlap applied...'] },
  ...
];
```

---

### 🟢 POLISH — No visual diagram of the actual pipeline
**What's happening:** The README has a beautiful Mermaid sequence diagram of the RAG pipeline. This page shows only a node selector and a text log — the actual flow is never visualized.

**Fix:** Render the Mermaid sequence diagram inline on this page using `mermaid.js` or a React Mermaid wrapper. This is the most technically impressive thing you can show.

---

## 6. Pricing Page `/pricing`

### 🔴 CRITICAL — Monthly/Yearly billing toggle doesn't change any prices
**What's happening:** The "Monthly Billing / Yearly billing (Save 25%)" toggle exists but clicking it doesn't change the displayed prices from `$0`, `$12`, `$49`. The toggle is non-functional.

**Fix:** Add state-driven pricing:
```tsx
const [isYearly, setIsYearly] = useState(false);
const proPrice = isYearly ? '$9' : '$12';
const institutionPrice = isYearly ? '$37' : '$49';
```
Display the discounted yearly price when toggled, and show the original price struck through.

---

### 🔴 CRITICAL — No actual payment integration — "Upgrade to Pro" goes to `/upload`
**What's happening:** The "Upgrade to Pro" button routes to `/upload` — which just redirects to login. There is no payment flow.

**Fix (short-term):** Replace the button with a clear disclaimer:
```
"Payments coming soon — all features are free during beta"
```
Or link to a Stripe Checkout session or a waitlist form.

**Fix (proper):** Integrate Stripe Checkout with a Supabase webhook to update `profiles.subscription_tier`.

---

### 🟡 IMPORTANT — No feature comparison table per tier
**What's happening:** The pricing cards list features as bullet points but there's no side-by-side comparison table showing what each tier includes vs. excludes. This is standard SaaS pricing UX.

**Fix:** Add a comparison table below the cards:

| Feature | Free | Pro | Institution |
|---|---|---|---|
| Documents | 3 | Unlimited | Unlimited |
| RAG Chat | ❌ | ✅ | ✅ |
| Quiz Generation | 5/month | Unlimited | Unlimited |
| DNA Profile | ❌ | ✅ | ✅ |
| ...etc | | | |

---

### 🟡 IMPORTANT — "Contact Sales" links to `/contact` which is a 404
**What's happening:** The Institution tier CTA goes to `/contact` — this page doesn't exist.

**Fix:** Either create `/app/contact/page.tsx` with a simple form, or link to a Calendly/email: `mailto:askmeai@yourdomain.com`.

---

### 🟢 POLISH — No FAQ section
**What's happening:** Pricing pages almost always need a FAQ section to handle objections ("Can I cancel anytime?", "What happens to my data?", "Is the free tier really free?").

**Fix:** Add a 5-question accordion FAQ below the pricing cards.

---

## 7. Upload Page `/upload`

### 🔴 CRITICAL — Unauthenticated users hit `/login` with zero context
**What's happening:** Both `"Start Studying"` in the navbar and `"Map Your Knowledge System"` on the landing page route to `/upload`, which immediately redirects to `/login`. The user has no idea why.

**Fix:** Add a contextual message on the login page when `redirectTo=/upload`:
```tsx
{searchParams.redirectTo === '/upload' && (
  <p className="text-sm text-violet-300 mb-4">
    Create a free account to upload your first document.
  </p>
)}
```

---

### 🟡 IMPORTANT — No demo/guest mode for first-time experience
**What's happening:** A hackathon judge or a new visitor cannot try the core product (upload → summarize → quiz) without creating an account. This is a conversion killer.

**Fix:** Add a "Try with Sample Document" button on the upload page that loads a pre-seeded demo PDF (e.g., an NCERT Physics chapter) for unauthenticated users, showing a limited-functionality preview. Gate saving/history behind login.

---

### 🟡 IMPORTANT — No file size/type validation feedback visible in UI
**What's happening:** The README mentions file type checking and size limits, but if a user uploads a `.pptx` or a 50MB file, it's unclear what error they'll see.

**Fix:** Add visible constraints text below the drop zone:
```
Supported: PDF, TXT · Max size: 10MB
```
And show inline validation errors with clear messaging.

---

### 🟢 POLISH — Upload progress stages should be more descriptive
**What's happening:** The README mentions live progress feedback (extracting → chunking → embedding → indexing). Verify these stages are actually visible in the UI with progress percentages.

**Fix:** Ensure each stage shows:
1. ✅ Text Extracted
2. ✅ Chunked into N segments  
3. ✅ Embeddings generated
4. ✅ Indexed in database
5. 🎉 Ready! Summary + Quiz generated

---

## 8. Dashboard `/dashboard`

### 🟡 IMPORTANT — Dashboard is gated without any preview
**What's happening:** The dashboard is entirely behind auth. New users see only the login page with no idea what the dashboard looks like.

**Fix:** Add a "Preview Dashboard" screenshot or animated GIF on the landing page so users know what they're signing up for.

---

### 🟡 IMPORTANT — Streak counter should reset logic be verified
**What's happening:** The `streak` field in the DB is incremented but there should be a daily reset mechanism. Verify that a cron job or Supabase scheduled function actually decrements streak on inactivity.

**Fix:** Add an edge function or Supabase pg_cron that checks if `last_active < now() - interval '1 day'` and resets streak to 0.

---

### 🟢 POLISH — Empty state for new users (no documents) is undefined
**What's happening:** A brand new user who logs in will have zero documents, zero quizzes, zero XP. The dashboard likely shows empty charts/tables with no onboarding guidance.

**Fix:** Add a first-time user onboarding empty state:
```
🎉 Welcome! Upload your first document to get started.
[Upload PDF →]
```
Show this instead of empty chart shells.

---

## 9. Workspace `/workspace`

### 🟡 IMPORTANT — Direct visit to `/workspace` redirects to login but doesn't explain what workspace is
**What's happening:** Workspace requires a `documentId` in the route (`/workspace/[documentId]`) — visiting `/workspace` bare is ambiguous.

**Fix:** Either:
1. Redirect `/workspace` → `/dashboard` (where documents are listed)
2. Or create a `/workspace` index page that shows "Select a document to enter its workspace"

---

### 🟡 IMPORTANT — Chat interface should persist messages per document session
**What's happening:** Verify that `CHAT_MESSAGES` table correctly scopes messages to `document_id`. If not, all chat history appears in every document.

**Fix:** Ensure the `GET /api/chat?documentId=xxx` query filters by both `user_id` AND `document_id`.

---

### 🟢 POLISH — No breadcrumb navigation inside workspace
**What's happening:** Once inside a document workspace, there's no clear way to go back to the documents list.

**Fix:** Add a breadcrumb: `Dashboard → Documents → [Document Title]`

---

## 10. Quiz `/quiz`

### 🟡 IMPORTANT — No timer mode for exam simulation
**What's happening:** The README and roadmap mention "Exam Mode" with a timer. Verify the quiz page actually has a timed mode toggle.

**Fix:** Add a toggle: "Practice Mode / Exam Mode (timed)". In exam mode, show a countdown timer per question and disable hints.

---

### 🟡 IMPORTANT — Quiz results page should have a "Retry" and "View Weak Topics" CTA
**What's happening:** After completing a quiz, users should have clear next actions. If these are missing, the learning loop breaks.

**Fix:** Quiz results page must show:
1. Score breakdown by topic
2. "Retry weak questions" button
3. "View revision plan" button (generated by diagnostics engine)
4. Confetti animation for scores > 80%

---

### 🟢 POLISH — No keyboard navigation support on quiz
**What's happening:** Students taking quizzes often prefer keyboard shortcuts (1/2/3/4 for options, Enter to submit). This is missing.

**Fix:** Add `useEffect` with `keydown` listener:
```tsx
useEffect(() => {
  const handler = (e) => {
    if (e.key === '1') selectOption('A');
    if (e.key === '2') selectOption('B');
    if (e.key === 'Enter') submitAnswer();
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

---

## 11. Memory Graph `/memory-graph`

### 🟡 IMPORTANT — 3D graph is the most impressive feature but completely hidden behind auth
**What's happening:** The memory graph is the visual showpiece of the app. New visitors never see it.

**Fix:** On the landing page Scene 03, embed a non-interactive screenshot or looping video of the 3D memory graph. Add a direct CTA: "See your knowledge map →".

---

### 🟡 IMPORTANT — Graph nodes need a click → study action
**What's happening:** Clicking a node in the memory graph should trigger an action (e.g., open the document, start a quiz on that concept). Verify this connection exists.

**Fix:** Add `onClick` handlers to graph nodes that navigate to:
```tsx
router.push(`/workspace/${node.document_id}?topic=${node.label}`);
```

---

### 🟢 POLISH — No legend for node colors on the graph
**What's happening:** Red/blue/yellow nodes need a visible legend explaining what each color means (Mastered / Learning / Weak / Forgotten).

**Fix:** Add a fixed legend overlay:
```
🟢 Mastered (85-100%)  🔵 Learning (60-84%)  🟡 Weak (35-59%)  🔴 Forgotten (<35%)
```

---

## 12. Learning DNA `/dna`

### 🟡 IMPORTANT — DNA profile shows default 50% values for all new users
**What's happening:** A new user with no quiz history will see every DNA axis at 50 (the default). This is misleading — it implies they're "average" on all axes rather than "not yet measured."

**Fix:** For users with `quiz_attempts_count < 5`, show a placeholder state:
```
Your Learning DNA is forming...
Complete 5 quizzes to unlock your cognitive profile.
[Start a Quiz →]
```

---

### 🟡 IMPORTANT — Archetype description is static/not personalized
**What's happening:** The cognitive archetype name and description should change based on the user's actual DNA scores. Verify this is dynamic and not hardcoded.

**Fix:** Implement archetype assignment logic:
```ts
function getArchetype(dna: CognitiveDNA): string {
  if (dna.conceptual > 75 && dna.retention < 55) return "The Intuitive Analyst";
  if (dna.discipline > 70 && dna.retention > 70) return "The Diligent Accumulator";
  // ... 12 archetypes total
}
```

---

### 🟢 POLISH — No historical DNA evolution chart
**What's happening:** The redesign doc mentions "DNA Evolution Over Time" as a key feature. The current page likely only shows current values.

**Fix:** Add a Recharts `LineChart` below the radar chart showing how each DNA axis has changed over the past 30 days. Pull from `dna_history` table.

---

## 13. Planner `/planner`

### 🟡 IMPORTANT — Planner page is likely empty for new users with no context
**What's happening:** A planner with no tasks and no exam dates set is a blank/confusing screen.

**Fix:** Add an onboarding prompt:
```
No study plan yet.
Tell us your exam date and we'll build your schedule automatically.
[Set Exam Date →]
```

---

### 🟡 IMPORTANT — No exam date input visible
**What's happening:** The "Syllabus Autopilot" engine requires an exam date to generate a schedule. Verify there's a UI to set this, and that it's prominently placed.

**Fix:** Add an "Add Exam" button with a date picker modal that saves to `planner_items` or a dedicated `exams` table.

---

## 14. Settings `/settings`

### 🟡 IMPORTANT — Settings page has no visible content after auth redirect fix
**What's happening:** Based on the redirect analysis, `/settings` is auth-protected. Verify the settings page actually renders all the expected sections once logged in.

**Expected sections that must exist:**
1. Profile editor (name, grade, exam goal)
2. Theme toggle (dark/light)
3. Notification preferences
4. Account deletion option
5. Subscription status / upgrade CTA

**Fix:** Audit `app/settings/page.tsx` against this checklist and add any missing sections.

---

### 🟢 POLISH — No profile completion indicator
**What's happening:** If a user hasn't filled in their grade or exam goal, the AI personalization is degraded. There's no nudge to complete the profile.

**Fix:** Add a profile completion bar at the top of settings:
```
Profile: 60% complete — Add your exam goal to improve AI recommendations
```

---

## 15. Footer (Global)

### 🔴 CRITICAL — `/careers`, `/contact`, `/blog`, `/about` are dead links (likely 404)
**What's happening:** The footer links to these pages but none of them appear to exist in the app router.

**Fix (immediate):** Remove these links from the footer or replace with:
- `/about` → the architecture page or a simple about section
- `/contact` → a `mailto:` link
- `/blog` → remove or link to the GitHub README
- `/careers` → remove for now

**Fix (proper):** Create stub pages for at least `/about` and `/contact`.

---

### 🔴 CRITICAL — Newsletter "Cognitive Dispatch" has no functional subscribe input
**What's happening:** The footer mentions a newsletter subscription but there appears to be no visible input field or submit button in the rendered output.

**Fix:** Either:
1. Add a working email input + submit (integrate with Mailchimp/Resend API)
2. Or remove this section entirely and replace with a "Star on GitHub" CTA

---

### 🟢 POLISH — Footer social icons link to `#`
**What's happening:** The social icon links are empty anchors.

**Fix:** Replace with real links:
- GitHub: `https://github.com/Suvam-paul145/AskMe-AI`
- Remove Twitter/LinkedIn icons if no profiles exist yet

---

## 16. Missing Pages / 404s

The following routes are linked from the UI but likely return 404:

| Route | Linked From | Priority | Fix |
|---|---|---|---|
| `/about` | Footer | 🟡 | Create a simple about page |
| `/contact` | Footer, Pricing CTA | 🔴 | Create contact form or mailto redirect |
| `/blog` | Footer | 🟢 | Remove or link to GitHub |
| `/careers` | Footer | 🟢 | Remove |
| `/chat` | README / workspace | 🟡 | Verify route exists as `/chat/[documentId]` |

---

## 17. SEO & Meta

### 🟡 IMPORTANT — All pages share the same meta title and description
**What's happening:** Every page returns:
- Title: "AskMe AI - Your Personal Cognitive Learning OS"
- Description: "Next-generation Cognitive Learning Operating System..."

This is the same on `/features`, `/pricing`, `/architecture` — no page-specific SEO.

**Fix:** In each `page.tsx`, export individual `metadata`:
```tsx
// app/features/page.tsx
export const metadata = {
  title: 'Features — AskMe AI Cognitive Engines',
  description: '10 AI-powered learning engines: RAG chat, quiz generation, memory graph, and DNA profiling.',
};
```

---

### 🟢 POLISH — No `robots.txt` or `sitemap.xml`
**Fix:** Add `app/robots.txt` and `app/sitemap.ts` in Next.js 13+ format:
```ts
// app/sitemap.ts
export default function sitemap() {
  return [
    { url: 'https://ask-me-ai-chi.vercel.app', lastModified: new Date() },
    { url: 'https://ask-me-ai-chi.vercel.app/features', lastModified: new Date() },
    ...
  ];
}
```

---

## 18. Auth Flow (Systemic)

### 🔴 CRITICAL — All protected routes redirect to `/login` with same generic screen
**What's happening:** `/upload`, `/workspace`, `/dashboard`, `/memory-graph`, `/dna`, `/settings` all silently redirect to login. There's no message like "You need to log in to access the Dashboard."

**Fix:** Pass a `message` param or use a toast system:
```ts
// middleware.ts
const loginUrl = new URL('/login', request.url);
loginUrl.searchParams.set('message', 'Please sign in to continue');
loginUrl.searchParams.set('redirectTo', pathname);
```
On the login page:
```tsx
{searchParams.message && (
  <p className="text-amber-400 text-sm">{searchParams.message}</p>
)}
```

---

### 🟡 IMPORTANT — No email verification step visible
**What's happening:** Supabase Auth by default requires email verification. If this is enabled, users who register may not know to check their inbox, causing drop-off.

**Fix:** After registration, show a prominent screen:
```
📧 Check your inbox!
We sent a verification link to [email]. Click it to activate your account.
```

---

### 🟡 IMPORTANT — "Register Profile" — unclear if it's sign-up or a separate profile step
**What's happening:** The register link text is ambiguous. Students might think "Register Profile" means filling in additional info after sign-up.

**Fix:** Change to "Create Account" or "Sign Up Free".

---

## 19. Performance & Code Quality

### 🟡 IMPORTANT — Verify no API keys are exposed in client bundles
**What's happening:** The `NEXT_PUBLIC_` prefix exposes env vars to the client. `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must NEVER have this prefix.

**Audit checklist:**
```
✅ NEXT_PUBLIC_SUPABASE_URL — OK (public)
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY — OK (public, RLS protected)
❌ GEMINI_API_KEY — Must NOT have NEXT_PUBLIC_ prefix
❌ SUPABASE_SERVICE_ROLE_KEY — Must NOT have NEXT_PUBLIC_ prefix
```

---

### 🟡 IMPORTANT — Add error boundaries around AI-dependent components
**What's happening:** If Gemini API fails (rate limit, timeout, etc.), components that depend on AI responses will throw unhandled errors.

**Fix:** Wrap AI-dependent sections in React `ErrorBoundary` components:
```tsx
<ErrorBoundary fallback={<AIErrorFallback message="AI temporarily unavailable. Please retry." />}>
  <SummaryPanel documentId={id} />
</ErrorBoundary>
```

---

### 🟢 POLISH — Add loading skeletons to all data-fetching components
**What's happening:** Pages that fetch from Supabase (dashboard, workspace, quiz) likely show blank content during load.

**Fix:** Use shadcn/ui `Skeleton` components for all data-loading states:
```tsx
{loading ? <Skeleton className="h-8 w-full" /> : <SummaryContent data={data} />}
```

---

### 🟢 POLISH — Add `next/image` for all image assets
**What's happening:** Any raw `<img>` tags will miss Next.js image optimization (lazy loading, WebP conversion, size hints).

**Fix:** Replace all `<img src="...">` with `<Image src="..." width={} height={} alt="" />` from `next/image`.

---

## 🗂️ Priority Summary

| # | Issue | Severity | Page | Effort |
|---|---|---|---|---|
| 1 | Streak/XP shows for logged-out users | 🔴 CRITICAL | Global | Low |
| 2 | `/settings` link shows as text | 🔴 CRITICAL | Global | Low |
| 3 | No hero product screenshots | 🔴 CRITICAL | Landing | Medium |
| 4 | Zero social proof | 🔴 CRITICAL | Landing | Medium |
| 5 | Login labels are sci-fi/confusing | 🔴 CRITICAL | Login | Low |
| 6 | No forgot password | 🔴 CRITICAL | Login | Low |
| 7 | Telemetry shows "No telemetry data" | 🔴 CRITICAL | Features | Low |
| 8 | Fake hardcoded metrics | 🔴 CRITICAL | Features | Low |
| 9 | Hardcoded static timestamps in architecture | 🔴 CRITICAL | Architecture | Low |
| 10 | Pricing toggle non-functional | 🔴 CRITICAL | Pricing | Low |
| 11 | "Upgrade to Pro" goes to `/upload` | 🔴 CRITICAL | Pricing | Medium |
| 12 | `/contact`, `/careers`, `/blog` are 404s | 🔴 CRITICAL | Footer | Low |
| 13 | Newsletter input non-functional | 🔴 CRITICAL | Footer | Low |
| 14 | Auth redirect has no context message | 🔴 CRITICAL | Auth flow | Low |
| 15 | No Google OAuth | 🟡 IMPORTANT | Login | Medium |
| 16 | No "How it Works" section | 🟡 IMPORTANT | Landing | Medium |
| 17 | No redirect-back after login | 🟡 IMPORTANT | Auth flow | Low |
| 18 | DNA shows 50% defaults for new users | 🟡 IMPORTANT | DNA page | Medium |
| 19 | All pages share same meta title/description | 🟡 IMPORTANT | SEO | Low |
| 20 | API key leak audit | 🟡 IMPORTANT | Security | Low |

---

> **Total: 14 Critical issues · 18 Important issues · 12 Polish items**  
> Estimated fix time for all Criticals: ~2-3 focused development days
