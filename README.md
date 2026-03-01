# Document Approval & Stamping System

A role-based Full Stack document approval system where Users submit PDFs, Reviewers approve/reject them, and approved documents automatically receive an "APPROVED" visual stamp watermark directly on the PDF. 

This project is structured as a mono-repo containing both the `doc-approval-frontend` (Next.js 15) and `doc-approval-system` (Node.js/Express API).

## 🚀 Key Features

*   **Role-Based Access Control:** Distinct experiences for `USER` and `REVIEWER` roles.
*   **Secure Authentication:** JWT-based stateless authentication with password hashing.
*   **Automated PDF Manipulation:** Uses `pdf-lib` to natively stamp approved documents without requiring a third-party service.
*   **Audit Logging:** Every document action (upload, approve, reject) is tracked in the database.
*   **Sassy Dark Theme UI:** A beautiful, dark-mode-first dashboard built with Tailwind v4 and Shadcn/ui.
*   **Real-time Data Fetching:** Optimized asynchronous actions and caching using `@tanstack/react-query`.

## 🛠️ Technology Stack

**Backend (`/doc-approval-system`)**
*   Node.js & Express
*   TypeScript
*   Prisma ORM
*   PostgreSQL (Supabase)
*   JWT & Bcrypt
*   Multer (file uploading)
*   PDF-lib

**Frontend (`/doc-approval-frontend`)**
*   Next.js 15 (App Router)
*   React 19
*   TypeScript
*   Tailwind CSS v4
*   Shadcn/ui & Lucide-react
*   React Hook Form + Zod
*   TanStack React Query

---

## 💻 Local Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   A Supabase account (or any PostgreSQL database)

### 1. Database Setup (Supabase)
1.  Create a new project in [Supabase](https://supabase.com/).
2.  Navigate to your Project Settings -> Database.
3.  Copy the connection string (Connection Pooling / Transaction mode is recommended for Prisma).

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd doc-approval-system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Edit the `.env` file and insert your Supabase `DATABASE_URL` and a random `JWT_SECRET` string.*
4. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will run on `http://localhost:3000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd doc-approval-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `NEXT_PUBLIC_API_URL` points to your running backend)*
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The UI will run on `http://localhost:3001`. Open this in your browser.*

---

## 🌍 Deployment Guides

### Deploying the Database (Supabase)
Your database is already hosted! Just ensure you allow network access if migrating out of local development, and manage your Connection Pool strings via the Supabase dashboard.

### Deploying the Backend API (Render or Railway)
The backend is ready to be hosted on any standard Node.js environment. We recommend **Render.com**.
1. Create a "Web Service".
2. Link your GitHub repository.
3. Set the **Root Directory** to `doc-approval-system`.
4. Set the **Build Command** to: `npm install && npx prisma db push && npm run build`
5. Set the **Start Command** to: `npm start`
6. Add your Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`).

### Deploying the Frontend (Vercel)
The frontend is perfectly configured for **Vercel**, the creators of Next.js.
1. Create a new project in Vercel and import your GitHub repository.
2. Set the **Root Directory** to `doc-approval-frontend`.
3. Vercel will automatically detect Next.js and apply the correct build settings (`npm run dev` / `npm run build`).
4. Add your Environment Variable:
   - `NEXT_PUBLIC_API_URL` -> *(Point this to the live URL of your deployed Backend, e.g., `https://my-backend.onrender.com/api`)*
5. Click **Deploy**.

---

## 🛡️ Default Roles & Testing
To test the system, simply register two new accounts from the UI.
Upon registration, the UI allows you to optionally simulate the `REVIEWER` role.
1. **Account A:** Register as a `USER`. Upload some PDF files.
2. **Account B:** Register as a `REVIEWER`. Navigate to the Pending Dashboard, approve the files.
3. Login back as **Account A** to download your automatically stamped Approved PDFs!
