const TAB_SESSION_KEY = "open-tabs-next-to-current-tab-uuid";

const windowIdTabIdsMapping = new Map();

const knownTabIds = [];

function setCurrentTabId(windowId, tabId) {
    if (!windowIdTabIdsMapping.has(windowId)) {
        windowIdTabIdsMapping.set(windowId, []);
    }
    windowIdTabIdsMapping.get(windowId).unshift(tabId);
}

function initializeCurrentTabId() {
    const query = {
        active: true,
        currentWindow: true,
    };
    browser.tabs.query(query).then(
        ([tab]) => {
            if (!tab) {
                return;
            }
            setCurrentTabId(tab.windowId, tab.id);
        }
    );
}

function handleTabActivated(activeInfo) {
    setCurrentTabId(activeInfo.windowId, activeInfo.tabId);
}

initializeCurrentTabId();

browser.tabs.onActivated.addListener(handleTabActivated);

browser.tabs.onCreated.addListener(moveTab);
browser.tabs.onRemoved.addListener(forgetTab);

browser.commands.onCommand.addListener(function(command) {
    if (command == "open-new-tab-at-default-location") {
        browser.tabs.onCreated.removeListener(moveTab);
        browser.tabs.onCreated.addListener(fixListeners);
        browser.tabs.create({});
    }
});

if (browser.sessions.getTabValue && browser.sessions.setTabValue) {
    addSessionKeyToExistingTabs();
}

function addSessionKeyToExistingTabs() {
    browser.tabs.query({}).then(
        allTabs => {
            for (const existingTab of allTabs) {
                browser.sessions.getTabValue(existingTab.id, TAB_SESSION_KEY).then(
                    (uuid) => {
                        if (uuid) {
                            if (knownTabIds.indexOf(uuid) === -1) {
                                knownTabIds[existingTab.id] = uuid;
                                return;
                            }
                        }
                        const newUUID = uuidv4();
                        knownTabIds[existingTab.id] = newUUID;
                        browser.sessions.setTabValue(existingTab.id, TAB_SESSION_KEY, newUUID);
                    }
                );
            }
        }
    );
}

function fixListeners() {
    browser.tabs.onCreated.removeListener(fixListeners);
    browser.tabs.onCreated.addListener(moveTab);
}

function moveTab(newTab) {
    browser.windows.getCurrent({ populate: true })
        .then(
            (currentWindow) => {
                const tabIds = windowIdTabIdsMapping.get(currentWindow.id);
                // handle tab being activated before being "created"
                const currentTabId = tabIds[0] == newTab.id ? tabIds[1] : tabIds[0];
                return Promise.all([
                    currentWindow,
                    browser.tabs.get(currentTabId),
                ]);
            }
        )
        .then(
            ([currentWindow, currentTab]) => {
                if (currentTab.windowId !== newTab.windowId) {
                    // tab created by drag into window without focus change
                    return;
                }

                if (browser.sessions.getTabValue && browser.sessions.setTabValue) {
                    browser.sessions.getTabValue(newTab.id, TAB_SESSION_KEY).then(
                        (uuid) => {
                            // restored and duplicated tabs have a uuid
                            if (uuid) {
                                // duplicated tabs' uuid will be in knownTabIds, so this is a restored tab
                                if (knownTabIds.indexOf(uuid) === -1) {
                                    knownTabIds[newTab.id] = uuid;
                                    // tab position should be correct
                                    return;
                                }
                            }
                            // new or duplicated tabs need to be moved
                            const newUUID = uuidv4();
                            knownTabIds[newTab.id] = newUUID;
                            browser.sessions.setTabValue(newTab.id, TAB_SESSION_KEY, newUUID);
                            browser.tabs.move(newTab.id, {index: getNewIndex(currentWindow, currentTab)});
                        }
                    );
                } else {
                    const isUndoCloseTab = newTab.index < currentWindow.tabs.length - 1 && !newTab.openerTabId;
                    const isRecoveredTab = newTab.index > currentWindow.tabs.length - 1;
                    if (!isUndoCloseTab && !isRecoveredTab) {
                        browser.tabs.move(newTab.id, {index: getNewIndex(currentWindow, currentTab)});
                    }
                }
            }
        );
}

function forgetTab(tabId) {
    delete knownTabIds[tabId];
}

function getNewIndex(currentWindow, currentTab) {
    if (!currentTab.pinned) {
        return currentTab.index + 1;
    }

    let lastPinnedTab = undefined;
    for (const tab of currentWindow.tabs) {
        if (tab.pinned) {
            lastPinnedTab = tab;
        } else {
            return lastPinnedTab.index + 1;
        }
    }
}

function uuidv4() {
    // see https://stackoverflow.com/a/2117523/520061
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
