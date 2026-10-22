<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Contact inquiries use a shared validation schema and a public POST server function with insert-only anonymous database access; inquiries are reviewed in Lovable Cloud, never exposed to visitors.
- The contact INSERT policy must validate field lengths and email format consistently with existing constraints rather than use an unconditional predicate, preserving public inquiries without unrestricted writes.
- Admin user management lives at /admin under the _authenticated gate; every admin server function re-checks the admin role server-side via public.has_role and runs as the signed-in admin (RLS + admin-only SECURITY DEFINER SQL functions), never the service-role key, so it works on external hosts; and roles stay in public.user_roles (never on profiles) so users cannot escalate their own privileges.
- Admins never manage their own account (role removal, deactivation) — enforced in src/lib/admin-rules.ts canManageTarget and covered by src/test/admin-rules.test.ts.
