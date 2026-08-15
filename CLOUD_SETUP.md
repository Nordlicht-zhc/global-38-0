# Cloud save setup

The browser game remains offline-first. Cloud accounts are optional and are
enabled only after configuring Supabase.

1. Create a Supabase project on the Free plan.
2. Open **SQL Editor** and run [`supabase-schema.sql`](supabase-schema.sql).
3. In **Project Settings → Data API**, copy the project URL and publishable key.
4. Put those public values in [`cloud-config.js`](cloud-config.js):

   ```js
   url: "https://your-project.supabase.co",
   publishableKey: "your-publishable-key"
   ```

5. In **Authentication → URL Configuration**, add the deployed site URL and
   its `/global%2038-0.html` page to the allowed redirect URLs.
6. Push the files and open the **Cloud Save** button in the game.

The service-role key and database password must never be placed in this
repository or in browser code. Existing IndexedDB saves stay available. After
login, the newest local or cloud snapshot is selected and subsequent saves are
uploaded automatically. If the project is not configured, the game behaves
exactly as it did before.
