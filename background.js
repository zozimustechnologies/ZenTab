/**
 * background.js — MV3 service worker
 * Handles focus-mode blocking via chrome.declarativeNetRequest rules.
 */

const RULESET_ID = "focus_block";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set({ focusActive: false, focusBlockedSites: [] });

  // First install → open onboarding wizard
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("settings.html") + "?onboarding=1",
    });
  }
});

// Extension icon click → open settings page
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
});

/**
 * Rebuild blocking rules from the stored domain list.
 * Only active when focusActive === true.
 */
async function rebuildRules() {
  const { focusActive, focusBlockedSites } = await chrome.storage.local.get([
    "focusActive",
    "focusBlockedSites",
  ]);

  // Remove all existing dynamic rules first
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map((r) => r.id);

  if (!focusActive || !Array.isArray(focusBlockedSites) || focusBlockedSites.length === 0) {
    if (removeIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds });
    }
    return;
  }

  const addRules = focusBlockedSites
    .map((domain, i) => ({
      id: i + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { extensionPath: "/blocked.html" },
      },
      condition: {
        urlFilter: `*://${domain.trim()}/*`,
        resourceTypes: ["main_frame"],
      },
    }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules,
  });
}

// React to storage changes so focus mode can be toggled from the new tab page
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if ("focusActive" in changes || "focusBlockedSites" in changes) {
    rebuildRules();
  }
});
