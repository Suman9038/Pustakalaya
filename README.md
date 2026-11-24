# 📚 Pustakalaya (पुस्तकालय)
### *Next-Gen AI-Native Digital Library & Knowledge Operating System*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-1.3+-1C3C3C.svg?style=for-the-badge&logo=chainlink&logoColor=white)](https://www.langchain.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC2626.svg?style=for-the-badge&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Celery](https://img.shields.io/badge/Celery-Distributed_Tasks-37814A.svg?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/)
[![Redis](https://img.shields.io/badge/Redis-Cache_%26_Broker-FF4438.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

---

## 🌟 Overview

**Pustakalaya** transforms traditional static PDF/EPUB repositories into a **Living Knowledge Partner**. Rather than passively skimming documents, users can interact, converse, synthesize, and extract deep insights using grounded **Retrieval-Augmented Generation (RAG)**.

Built on an asynchronous, high-throughput microservices backend (FastAPI, SQLAlchemy Async, Celery, Redis, Qdrant) and a modern frontend (React 19, Tailwind v4, GSAP), Pustakalaya pairs research-grade document search with an editorial aesthetic: **Modern Obsidian & Warm Amber Gold**.

---

## 🚀 Key Highlights & Innovative Features

### 1. 🔍 Clickable In-Book Citation Jump (Feature 1.1)
* **Precise Grounding:** Every factual claim, chapter summary, and concept explanation produced by the AI assistant includes an inline page citation tag (e.g., `[Page 42]`).
* **Interactive Luxury Badges:** Custom Markdown renderers transform citation tags into interactive amber badges with hover states.
* **Instant Reader Jump:** Clicking any badge instantly fetches the document blob from Appwrite storage and launches the built-in reader jumped directly to that page (`#page=42`), eliminating manual searching.

### 2. ⚡ Real-Time SSE Ingestion & Embedding Pipeline
* **Multi-Format Processing:** Ingests PDF (PyMuPDF with exact layout bounds), EPUB, DOCX, and TXT files.
* **Distributed Celery Architecture:** Heavy text extraction, semantic chunking, and vector embedding are offloaded to asynchronous background Celery workers.
* **Live Progress Tracking:** Replaced polling and fake timers with **Server-Sent Events (SSE)** over Redis pub/sub. The frontend `UploadProgress` modal dynamically displays live parsed pages, generated chunks, and embedding batches, auto-redirecting to chat upon completion.

### 3. 🧠 BookAwareRetriever & TOC Synthesis
* **Table of Contents Fix:** Resolves standard MMR diversity filtering issues that discard adjacent early front-matter chunks.
* **Automatic TOC Expansion:** Detects queries mentioning chapters, outlines, or tables of contents and automatically merges front-matter chunks (0–5) with vector similarity results ($k=10$).

### 4. 🎨 Modern Obsidian & Amber Gold Design System (Category 2)
* **Deep Void Base:** `#09090b` canvas with frosted glass cards (`rgba(24, 24, 27, 0.75)` with 1px border `rgba(255, 255, 255, 0.08)`).
* **Warm Amber Accents:** Primary glow `#f59e0b` and `#fbbf24` with emerald status badges (`#10b981`).
* **Editorial Typography:** Headers set in serif `Playfair Display`, body copy in `Plus Jakarta Sans`, and code blocks in `JetBrains Mono`.

### 5. 🦜️🔗 LangChain RAG & Contextual Pipeline
<p align="center">
  <img src="https://repository-images.githubusercontent.com/552661142/1655d21d-7b6c-4ee2-a08b-cd6d4bb756ec" alt="LangChain RAG Architecture" width="680" style="border-radius: 12px; margin: 14px 0; max-width: 100%;" />
</p>

* **History-Aware Question Re-Formulation:** `create_history_aware_retriever` re-formulates conversational follow-up questions into standalone search queries based on chat context.
* **Grounded Passage Injection:** Document prompt template `[Source: Page {page}]:\n{page_content}` injects verified page indices directly into the LLM context for real-time citations.
* **BookAwareRetriever:** Intelligently fetches and integrates front-matter chunks (0–5) when users ask about table of contents, outlines, or chapter breakdowns.
* **Asynchronous Execution:** Non-blocking `RunnableLambda(..., afunc=ainject_no_context_marker)` ensures server threads never freeze during SSE token streaming.

### 6. 🛡️ Enterprise Security & Resilience
* **Dual-Token Revocation:** Access & refresh JWT tokens with dynamic TTL blacklisting in Redis upon logout.
* **Strict RBAC & Self-Demotion Guards:** Granular `admin` vs `user` permissions with self-demotion safeguards.
* **Re-Entrant LLM Singleton:** Thread-safe lazy loading (`threading.RLock`) preventing deadlock freezes during multi-provider model routing (Groq / Ollama / OpenRouter).

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User([👤 User / Browser])

    subgraph Frontend ["🖥️ React 19 + Tailwind v4 + GSAP"]
        UI["Bento Dashboard & Book Explorer"]
        ChatUI["Interactive Chat with Citation Badges"]
        Modal["Real-Time SSE Ingestion Modal"]
    end

    subgraph Backend ["⚡ FastAPI Async Core"]
        AuthRouter["Auth Router (JWT + Redis Blacklist)"]
        BookRouter["Books Router (Upload, View, Search)"]
        ChatRouter["RAG Router (SSE Streaming & History)"]
        AdminRouter["Admin Dashboard & Role Management"]
    end

    subgraph Processing ["⚙️ Celery & Distributed Tasks"]
        Worker["Celery Worker (Ingestion & Embedding)"]
        Tracker["IndexingTracker (Redis Live Snapshot)"]
    end

    subgraph Storage ["💾 Persistence & Vector Storage"]
        Postgres[(PostgreSQL 16\nSQLAlchemy Async + Alembic)]
        Redis[(Redis 7\nBroker, Cache, SSE & Blacklist)]
        Qdrant[(Qdrant Vector DB\nSemantic Embeddings)]
        Appwrite[(Appwrite Storage\nEncrypted Book Files)]
    end

    subgraph AI ["🧠 LLM & Embedding Engine"]
        Embedder["HuggingFace Granite / Gemma Embeddings"]
        LLM["Groq Llama-3.3-70B / Llama-3.1-8B"]
    end

    User <--> Frontend
    Frontend <--> Backend

    Backend --> Postgres
    Backend --> Redis
    Backend --> Appwrite

    BookRouter -- Enqueue Task --> Redis
    Redis --> Worker
    Worker --> Appwrite
    Worker --> Embedder
    Worker --> Qdrant
    Worker --> Tracker
    Tracker --> Redis
    ChatRouter <--> Redis

    ChatRouter --> ChatRouter
    ChatRouter <--> Qdrant
    ChatRouter <--> LLM
```

---

## 🛠️ Tech Stack Matrix

| Domain | Technology | Purpose |
|---|---|---|
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (0.136+) | High-performance asynchronous REST API & SSE streaming |
| **Database ORM** | [SQLAlchemy](https://www.sqlalchemy.org/) 2.0 (Async) + [asyncpg](https://github.com/MagicStack/asyncpg) | Non-blocking PostgreSQL transactions and connection pooling |
| **Migrations** | [Alembic](https://alembic.sqlalchemy.org/) | Database schema migrations and versioning |
| **Task Queue** | [Celery](https://docs.celeryq.dev/) 5.6+ | Asynchronous distributed worker for document extraction & chunking |
| **Cache & Broker** | [Redis](https://redis.io/) 7+ | Celery broker, token revocation storage, and real-time SSE progress |
| **Vector Engine** | [Qdrant](https://qdrant.tech/) | Vector database for similarity search & MMR retrieval |
| **AI / RAG** | [LangChain](https://www.langchain.com/), [Groq](https://groq.com/), [HuggingFace](https://huggingface.co/) | Prompt chaining, embedding singleton, and LLM inference |
| **File Storage** | [Appwrite](https://appwrite.io/) Cloud Storage | Secure object storage for multi-format book files |
| **Frontend** | [React](https://react.dev/) 19 + [Vite](https://vite.dev/) 8 | Fast SPA rendering and build toolchain |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 | Utility-first CSS using CSS `@theme` design tokens |
| **Animation** | [GSAP](https://gsap.com/) + Framer Motion | Smooth transitions and ambient micro-interactions |
| **State & Transport** | [Zustand](https://github.com/pmndrs/zustand) + [Axios](https://axios-http.com/) | Client state management and HTTP communication |

---

## 📂 Project Structure

```
FastAPI-Beyond Curd/
├── app/
│   ├── admin_dashboard/         # Admin metrics, user roles, management
│   ├── auth/                    # JWT auth, password reset, token blacklist
│   ├── books/                   # Book CRUD, file streaming, upload handling
│   ├── rag/                     # RAG core engine
│   │   ├── chains.py            # LangChain document & retrieval chains
│   │   ├── embeddings.py        # Singleton HuggingFace embedding manager
│   │   ├── indexing_tracker.py  # Live Redis progress tracker
│   │   ├── ingestion.py         # Multi-format document parser & splitter
│   │   ├── llm.py               # Thread-safe LLM singleton & fallbacks
│   │   ├── prompts.py           # Contextual and citation-enforced prompts
│   │   ├── rag_routes.py        # Chat ask, history, SSE streaming routes
│   │   └── vector_store.py      # Qdrant client & BookAwareRetriever
│   ├── reviews/                 # Book ratings, reviews & cascade deletion
│   ├── celery_client.py         # Celery task definitions
│   ├── config.py                # Pydantic environment settings
│   ├── db.py                    # Async engine & session lifecycle
│   ├── middleware.py            # CORS, host verification & access logging
│   ├── models.py                # SQLAlchemy database entities
│   ├── routes.py                # Core root router integration
│   └── schemas.py               # Pydantic schemas and validation contracts
├── Frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI, modals, cards
│   │   │   ├── chat/            # ChatBubble, CitationBadge, ConversationSidebar
│   │   │   └── ui/              # UploadProgress, Toast, Button, Input
│   │   ├── pages/               # Dashboard, Chat, BookDetail, Login, Admin
│   │   ├── store/               # Zustand authStore & app state
│   │   ├── lib/                 # Axios API client & base configuration
│   │   ├── index.css            # Obsidian & Amber design system tokens
│   │   └── App.jsx              # Routes & authenticated layouts
│   └── package.json             # Frontend dependencies & scripts
├── docs/                        # Architecture guides, roadmaps & audit logs
├── docker-compose.yml           # Redis & Qdrant infrastructure
├── pyproject.toml               # Poetry dependencies & Python configuration
└── README.md                    # Project documentation
```

---

## ⚡ Quickstart & Setup Guide

### 1. Prerequisites
* **Python:** 3.12 or newer
* **Node.js:** 20.x or newer & npm
* **Docker & Docker Compose** (for Redis & Qdrant)
* **Poetry:** `pip install poetry`

---

### 2. Infrastructure Setup (Docker)

Start Redis and Qdrant in the background:
```bash
docker compose up -d
```
* Redis: `localhost:6379`
* Qdrant: `http://localhost:6333` (Dashboard: `http://localhost:6333/dashboard`)

---

### 3. Backend Setup

1. **Install Python dependencies:**
   ```bash
   poetry install
   ```

2. **Configure Environment Variables:**
   Create `.env` in the root directory:
   ```env
   # Database (PostgreSQL)
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/pustakalaya
   LOCAL_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/pustakalaya
   ALEMBIC_DATABASE_URL=postgresql://postgres:password@localhost:5432/pustakalaya

   # JWT Security
   JWT_SECRET_KEY=your_super_secret_jwt_key_here
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # Redis & Celery
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_URL=redis://localhost:6379/0
   LOCAL_REDIS_URL=redis://localhost:6379/0

   # Qdrant Vector Store
   QDRANT_HOST=localhost
   QDRANT_PORT=6333
   QDRANT_COLLECTION=pustakalaya_book

   # LLM & Embedding Models
   GROQ_API_KEY=your_groq_api_key_here
   HUGGINGFACEHUB_ACCESS_TOKEN=your_hf_token_here
   LOCAL_EMBEDDING_MODEL=ibm-granite/granite-embedding-97m-multilingual-r2
   LOCAL_TEXT_MODEL=llama-3.3-70b-versatile

   # Appwrite Cloud Storage
   PROJECT_ID=your_appwrite_project_id
   APPWRITE_API_KEY=your_appwrite_api_key
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_BUCKET_ID=your_appwrite_bucket_id

   # Mail (Resend or SMTP)
   RESEND_API_KEY=your_resend_api_key
   VERIFICATION_URL=http://localhost:5173/verify-email
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   MAIL_FROM=no-reply@pustakalaya.local
   MAIL_PORT=587
   MAIL_SERVER=smtp.gmail.com
   MAIL_FROM_NAME="Pustakalaya Library"
   ```

3. **Run Database Migrations:**
   ```bash
   poetry run alembic upgrade head
   ```

4. **Start the FastAPI Server:**
   ```bash
   poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   API Docs available at: `http://localhost:8000/docs`

5. **Start the Celery Distributed Worker:**
   *Windows (Solo pool):*
   ```bash
   poetry run celery -A app.celery_client worker --loglevel=info --pool=solo
   ```
   *Linux / macOS:*
   ```bash
   poetry run celery -A app.celery_client worker --loglevel=info -c 4
   ```

---

### 4. Frontend Setup

1. **Install dependencies:**
   ```bash
   cd Frontend
   npm install
   ```

2. **Configure Frontend Environment:**
   Create `Frontend/.env`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

3. **Run the Vite Dev Server:**
   ```bash
   npm run dev
   ```
   Access the web app at: `http://localhost:5173`

4. **Production Build:**
   ```bash
   npm run build
   ```

---

## 📡 API Reference Overview

### Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/auth/signup` | Register a new user account | ❌ |
| `POST` | `/auth/login` | Authenticate and obtain JWT access & refresh tokens | ❌ |
| `POST` | `/auth/refresh` | Rotate access token using valid refresh token | ❌ |
| `POST` | `/auth/logout` | Revoke tokens with dynamic TTL blacklist in Redis | ✅ |
| `POST` | `/auth/forgot-password`| Send signed password reset link via email | ❌ |
| `POST` | `/auth/reset-password` | Set new password with verified token | ❌ |

### Books & Documents (`/books`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/books/` | Upload book file (triggers async Celery ingestion) | ✅ |
| `GET` | `/books/` | Retrieve paginated books with search query | ❌ |
| `GET` | `/books/{book_id}` | Get book details & review metadata | ❌ |
| `GET` | `/books/{book_id}/view` | Stream book PDF bytes for inline viewing | ✅ |
| `GET` | `/books/{book_id}/progress` | Get latest indexing progress snapshot | ✅ |
| `DELETE`| `/books/{book_id}` | Delete book from DB, Qdrant & Appwrite | ✅ (Owner/Admin) |

### AI & Chat RAG (`/chat`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/chat/book/{book_id}` | Start a new conversation for a book | ✅ |
| `GET` | `/chat/conversation/{convo_id}`| Get conversation metadata and book information | ✅ |
| `GET` | `/chat/history/{convo_id}` | Fetch sorted message history for a conversation | ✅ |
| `POST` | `/chat/ask/stream/{convo_id}` | Ask question with Server-Sent Events (SSE) streaming | ✅ |

### Admin Dashboard (`/admin/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/admin/dashboard/stats` | Fetch aggregate counts (users, books, reviews) | ✅ (Admin) |
| `GET` | `/admin/dashboard/users` | List registered users with roles & timestamps | ✅ (Admin) |
| `PATCH`| `/admin/dashboard/users/{id}/role`| Promote / demote user role (self-demotion guarded) | ✅ (Admin) |

---

## 🎨 Design Tokens & UI Guidelines

The UI follows the **Modern Obsidian & Amber Gold** visual identity:

```css
:root {
  /* Surfaces */
  --color-void:        #09090b;                /* Deep Void Obsidian */
  --color-base:        #0f0f13;                /* Main Background Canvas */
  --color-card:        rgba(24, 24, 27, 0.75); /* Frosted Glass Surface */
  --color-elevated:    #222228;                /* Modals & Dropdowns */

  /* Accents */
  --color-amber:        #f59e0b;               /* Warm Amber Gold */
  --color-amber-bright: #fbbf24;               /* Highlight & Hover State */
  --color-emerald:      #10b981;               /* Verified & Complete Badges */

  /* Typography */
  --font-display:      'Playfair Display', serif;
  --font-sans:         'Plus Jakarta Sans', sans-serif;
  --font-mono:         'JetBrains Mono', monospace;
}
```

---

## 🤝 Contributing

Contributions, feedback, and pull requests are warmly welcomed!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: Add amazing feature"`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Crafted with care for lifelong readers and researchers. 📖✨
</p>
