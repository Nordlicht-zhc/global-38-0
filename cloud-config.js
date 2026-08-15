(() => {
  "use strict";

  // Fill these two public values after creating the Supabase project.
  // Never put a service-role key in this file or in any browser asset.
  const origin = window.location.origin;
  const redirectTo = origin && origin !== "null"
    ? `${origin}${window.location.pathname}`
    : undefined;

  window.G38CloudConfig = Object.freeze({
    url: "https://rhfjigszrmeewkbrhkdc.supabase.co",
    publishableKey: "sb_publishable_DelHF2bhedzQLUxrWI3-DQ_CriokhWu",
    redirectTo
  });
})();
