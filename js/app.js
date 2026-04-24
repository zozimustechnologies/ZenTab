/**
 * app.js — entry point, bootstraps all modules in order.
 */

(async () => {
  // Settings init drives clock + search init (passes saved preferences)
  await Settings.init();

  // Independent modules
  await Promise.all([
    TopSites.init(),
    Todo.init(),
    Notes.init(),
    Weather.init(),
    Focus.init(),
  ]);
})();
