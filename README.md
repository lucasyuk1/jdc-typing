
JDC - School Typing Test (Next.js 14 starter)

This project implements a school-focused typing test with local authentication (email/username + password hashed with bcrypt),
and uses Supabase as the Postgres database (no Supabase Auth required).

How to deploy (replace repo contents on GitHub):
1. Download the ZIP and extract.
2. In your local repo clone or on GitHub web: delete existing files (or replace).
3. Upload these files to your repository root (so package.json is at the root).
4. In Vercel, import the GitHub repo and set Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
5. In Supabase SQL Editor, run the SQL file `sql/create_tables.sql` to create the necessary tables.
6. Deploy on Vercel. The app will be available at your project URL.

Notes:
- This setup uses local login (bcrypt) stored in `users.password_hash`.
- Admin can be created manually in the `users` table or via Supabase Table Editor.
