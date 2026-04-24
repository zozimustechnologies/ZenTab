/**
 * app.js — entry point, bootstraps all modules in order.
 */

(async () => {
  // Settings init drives clock + search init (passes saved preferences)
  const s = await Settings.init();

  // Independent modules
  await Promise.all([
    TopSites.init({ show: s.showTopSites !== false }),
    FavTabs.init(),
    Todo.init(),
    Notes.init(),
    Weather.init(),
    Focus.init(),
  ]);
})();
