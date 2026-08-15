(() => {
  "use strict";

  let client = null;
  let currentUser = null;
  let authSubscription = null;

  const config = () => window.G38CloudConfig || {};
  const hasCredentials = () => Boolean(config().url && config().publishableKey);
  const isConfigured = () => Boolean(
    hasCredentials()
    && window.supabase
    && typeof window.supabase.createClient === "function"
  );

  function loadSdk() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load the cloud account client."));
      document.head.appendChild(script);
    });
  }

  function ensureReady() {
    if (!client || !currentUser) throw new Error("Cloud account is not signed in.");
    return client;
  }

  async function initialize(onAuthStateChange) {
    if (!hasCredentials()) {
      return { configured: false, user: null, error: null };
    }
    await loadSdk();
    if (!isConfigured()) throw new Error("Cloud sync credentials are invalid.");
    if (!client) {
      client = window.supabase.createClient(config().url, config().publishableKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      const subscription = client.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        if (typeof onAuthStateChange === "function") {
          // Supabase recommends deferring follow-up requests from this callback.
          setTimeout(() => onAuthStateChange({ event, user: currentUser }), 0);
        }
      });
      authSubscription = subscription?.data?.subscription || null;
    }
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    currentUser = data?.session?.user || null;
    return { configured: true, user: currentUser, error: null };
  }

  async function signUp(email, password, displayName = "") {
    if (!isConfigured()) throw new Error("Cloud sync is not configured.");
    if (!client) await initialize();
    const supabaseClient = ensureClient();
    const { data, error } = await supabaseClient.auth.signUp({
      email: String(email || "").trim(),
      password,
      options: {
        data: displayName ? { display_name: String(displayName).trim() } : undefined,
        emailRedirectTo: config().redirectTo
      }
    });
    if (error) throw error;
    currentUser = data?.user || data?.session?.user || currentUser;
    return data;
  }

  async function signIn(email, password) {
    const supabaseClient = ensureClient();
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: String(email || "").trim(),
      password
    });
    if (error) throw error;
    currentUser = data?.user || data?.session?.user || null;
    return data;
  }

  async function signOut() {
    const supabaseClient = ensureClient();
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    currentUser = null;
  }

  async function requestPasswordReset(email) {
    const supabaseClient = ensureClient();
    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      String(email || "").trim(),
      config().redirectTo ? { redirectTo: config().redirectTo } : undefined
    );
    if (error) throw error;
  }

  function ensureClient() {
    if (!isConfigured()) throw new Error("Cloud sync is not configured.");
    if (!client) throw new Error("Cloud client is not initialized.");
    return client;
  }

  async function load(slot = "default") {
    const supabaseClient = ensureReady();
    const { data, error } = await supabaseClient
      .from("cloud_saves")
      .select("slot, payload, revision, updated_at")
      .eq("user_id", currentUser.id)
      .eq("slot", slot)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function save(payload, revision, slot = "default") {
    const supabaseClient = ensureReady();
    const nextRevision = Math.max(1, Number(revision) || 1);
    const { data, error } = await supabaseClient
      .from("cloud_saves")
      .upsert({
        user_id: currentUser.id,
        slot,
        payload,
        revision: nextRevision,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id,slot" })
      .select("slot, payload, revision, updated_at")
      .single();
    if (error) throw error;
    return data;
  }

  window.G38Cloud = Object.freeze({
    isConfigured,
    initialize,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    load,
    save,
    getUser: () => currentUser,
    dispose: () => authSubscription?.unsubscribe?.()
  });
})();
