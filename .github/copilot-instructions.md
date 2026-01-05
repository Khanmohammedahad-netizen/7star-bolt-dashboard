# 7 Star Bolt Dashboard - AI Coding Guidelines

## Project Overview
Event management dashboard for 7 Star International using React + TypeScript + Vite + Supabase. Handles event creation, user management, and invoicing with region-specific tax calculations.

## Architecture
- **Frontend**: React Router with protected routes, AuthContext for session management
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Styling**: Tailwind CSS with custom UI components in `src/components/ui/`
- **State**: React hooks + Supabase real-time subscriptions where needed

## Key Patterns
- **Auth Guards**: Check `user.role` for 'admin'/'manager'/'staff' access. Admin-only routes like `/users` and `/audit`
- **Data Fetching**: Direct Supabase queries in components with `useEffect` + loading states
- **Audit Logging**: Use `logAudit()` from `utils/audit.ts` for all user actions (role changes, event updates)
- **Region Handling**: UAE (5% VAT) vs SAUDI (15% VAT) in invoicing and user profiles
- **Event IDs**: Generate with `crypto.randomUUID()` for new events
- **User Invites**: `supabase.auth.admin.inviteUserByEmail()` with region data

## Data Models
- **profiles**: `id, email, full_name, role, region` (extends Supabase auth.users)
- **events**: `id, name, client, date, status` (Approved/Pending/Rejected)
- **audit_logs**: `action, description, user_id, role, region, entity_id`

## Development Workflow
- `npm run dev` for local development
- `npm run typecheck` for TypeScript validation
- `npm run lint` for ESLint checks
- Supabase local dev: `supabase start` (ports 54321 API, 54322 DB)
- Edge functions in `supabase/functions/` for server-side logic like PDF generation

## Conventions
- **File Structure**: Pages in `src/pages/`, components grouped by feature (`events/`, `users/`)
- **Imports**: Relative paths for local files, absolute for external deps
- **Error Handling**: Silent failures for non-critical ops (e.g., audit logging)
- **UI Components**: Reusable components in `ui/` folder with Tailwind classes
- **Loading States**: Always show loading indicators during async operations
- **Navigation**: `react-router-dom` NavLink with active state styling

## Supabase Integration
- Client initialized in `services/supabase.ts` with env vars `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
- Auth state managed in `AuthContext` with profile hydration from `profiles` table
- Admin operations require service role key (server-side only)</content>
<parameter name="filePath">/workspaces/7star-bolt-dashboard/.github/copilot-instructions.md