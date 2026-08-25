(() => {
  "use strict";

  // Fill these two public values after creating the Supabase project.
  // Never put a service-role key in this file or in any browser asset.
  // Always return to the deployed browser game after email confirmation or
  // password reset. Deriving this from window.location would make a signup
  // started on localhost send a link back to a machine-local server.
  const redirectTo = "https://nordlicht-zhc.github.io/global-38-0/global%2038-0.html";

  window.G38CloudConfig = Object.freeze({
    url: "https://rhfjigszrmeewkbrhkdc.supabase.co",
    publishableKey: "sb_publishable_DelHF2bhedzQLUxrWI3-DQ_CriokhWu",
    redirectTo
  });
})();
