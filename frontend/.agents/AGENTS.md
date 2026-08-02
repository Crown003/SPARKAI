# Frontend Context & Rules

This file serves as the specific context for the `frontend` module in the SPARK AI project.
As an AI agent operating in this folder, you must adhere strictly to these rules.

## 1. Tech Stack
- **Framework:** Next.js (App Router).
- **Language:** TypeScript (Strict mode enabled).
- **Styling:** Refer to the design provided by the developer. Avoid arbitrary CSS/Tailwind hacks; stick to the provided design references.
- **State Management:** React Context for localized state. If global state is necessary, use Zustand. Do not use Redux.
- **Data Fetching:** Standard `fetch()` API or Axios calling the Backend FastAPI service.

## 2. Directory Structure Conventions
- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable React components (buttons, cards, layout shells).
- `src/lib/`: Utility functions and shared business logic.
- `src/hooks/`: Custom React hooks.
- `src/services/`: API communication layers (e.g., fetching from the FastAPI backend).

## 3. Communication with Backend
- The backend is located in the sibling `/backend` directory.
- Ensure all API calls handle CORS properly and pass the JWT Token (OAuth) in the `Authorization` header.
- Always use Environment Variables (e.g., `NEXT_PUBLIC_API_URL`) to base your API requests; never hardcode `localhost:8000`.

## 4. Quality Standards
- All new files must use TypeScript and define proper Interfaces/Types for their props.
- No `any` types allowed unless explicitly necessary.
- Components should be modular, single-responsibility, and thoroughly commented.
