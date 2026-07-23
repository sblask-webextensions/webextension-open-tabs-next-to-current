const STATE_STORAGE_KEY = "open-tabs-next-to-current-state";
const TAB_SESSION_KEY = "open-tabs-next-to-current-tab-uuid";

const windowIdTabIdsMapping = new Map();

let knownTabIds = {};

let skipNextCreatedTab = false;
let statePromise = undefined;
let stateQueue = Promise.resolve();


async function getBrowserInfo() {
    if (!browser.runtime.getBrowserInfo) {
        return {};
    }
    return await browser.runtime.getBrowserInfo();
}

function setCurrentTabId(windowId, tabId) {
    if (!windowIdTabIdsMapping.has(windowId)) {
        windowIdTabIdsMapping.set(windowId, []);
    }
    windowIdTabIdsMapping.get(windowId).unshift(tabId);
}

async function initializeCurrentTabId() {
    const tabs = await browser.tabs.query({active: true});
    for (const tab of tabs) {
        setCurrentTabId(tab.windowId, tab.id);
    }
}

function handleTabActivated(activeInfo) {
    runWithState(() => setCurrentTabId(activeInfo.windowId, activeInfo.tabId));
}

browser.tabs.onActivated.addListener(handleTabActivated);

browser.tabs.onCreated.addListener(moveTab);
browser.tabs.onRemoved.addListener(forgetTab);

browser.commands.onCommand.addListener(function(command) {
    if (command == "open-new-tab-at-default-location") {
        runWithState(() => {
            skipNextCreatedTab = true;
            return browser.tabs.create({}).catch(error => {
                skipNextCreatedTab = false;
                throw error;
            });
        });
    }
});

function runWithState(givenFunction) {
    stateQueue = stateQueue
        .catch(() => undefined)
        .then(ensureState)
        .then(givenFunction)
        .then(saveState);
    stateQueue.catch(error => console.error(error));
}

function ensureState() {
    if (statePromise === undefined) {
        statePromise = restoreState().catch(error => {
            statePromise = undefined;
            throw error;
        });
    }

    return statePromise;
}

async function restoreState() {
    const result = await browser.storage.session.get(STATE_STORAGE_KEY);
    const state = result[STATE_STORAGE_KEY];
    if (state) {
        for (const [windowId, tabIds] of state.windowIdTabIdsMapping) {
            windowIdTabIdsMapping.set(windowId, tabIds);
        }
        knownTabIds = state.knownTabIds;
        skipNextCreatedTab = state.skipNextCreatedTab || false;
        return;
    }

    await initializeCurrentTabId();
    if (supportsTabSessionValues()) {
        await addSessionKeyToExistingTabs();
    }
}

function saveState() {
    return browser.storage.session.set({
        [STATE_STORAGE_KEY]: {
            windowIdTabIdsMapping: Array.from(windowIdTabIdsMapping.entries()),
            knownTabIds: knownTabIds,
            skipNextCreatedTab: skipNextCreatedTab,
        },
    });
}

function supportsTabSessionValues() {
    return Boolean(
        browser.sessions?.getTabValue &&
        browser.sessions?.setTabValue
    );
}

async function addSessionKeyToExistingTabs() {
    const allTabs = await browser.tabs.query({});
    for (const existingTab of allTabs) {
        const uuid = await browser.sessions.getTabValue(existingTab.id, TAB_SESSION_KEY);
        if (uuid) {
            if (Object.values(knownTabIds).indexOf(uuid) === -1) {
                knownTabIds[existingTab.id] = uuid;
                continue;
            }
        }
        const newUUID = uuidv4();
        knownTabIds[existingTab.id] = newUUID;
        await browser.sessions.setTabValue(existingTab.id, TAB_SESSION_KEY, newUUID);
    }
}

function moveTab(newTab) {
    runWithState(() => moveTabWithState(newTab));
}

async function moveTabWithState(newTab) {
    if (skipNextCreatedTab) {
        skipNextCreatedTab = false;
        return;
    }

    const currentWindow = await browser.windows.get(newTab.windowId, {populate: true});
    const tabIds = windowIdTabIdsMapping.get(currentWindow.id) || [];
    // handle tab being activated before being "created"
    const currentTabId = tabIds[0] == newTab.id ? tabIds[1] : tabIds[0];
    if (currentTabId === undefined) {
        return;
    }

    const currentTab = await browser.tabs.get(currentTabId);
    if (currentTab.windowId !== newTab.windowId) {
        // tab created by drag into window without focus change
        return;
    }

    if (supportsTabSessionValues()) {
        const uuid = await browser.sessions.getTabValue(newTab.id, TAB_SESSION_KEY);
        // restored and duplicated tabs have a uuid
        if (uuid) {
            // duplicated tabs' uuid will be in knownTabIds, so this is a restored tab
            if (Object.values(knownTabIds).indexOf(uuid) === -1) {
                knownTabIds[newTab.id] = uuid;
                // tab position should be correct
                return;
            }
        }
        // new or duplicated tabs need to be moved
        const newUUID = uuidv4();
        knownTabIds[newTab.id] = newUUID;
        await browser.sessions.setTabValue(newTab.id, TAB_SESSION_KEY, newUUID);
    } else {
        const isUndoCloseTab = newTab.index < currentWindow.tabs.length - 1 && !newTab.openerTabId;
        const isRecoveredTab = newTab.index > currentWindow.tabs.length - 1;
        if (isUndoCloseTab || isRecoveredTab) {
            return;
        }
    }


    // if the current tab is part of a group, the new one should be too
    if (browser.tabs.group && currentTab.groupId != -1) {
        await browser.tabs.group({groupId: currentTab.groupId, tabIds: newTab.id});
    }

    if (currentTab.pinned) {
        await browser.tabs.move(newTab.id, {index: getLastPinnedTab(currentWindow).index + 1});
    } else {
        await browser.tabs.move(newTab.id, {index: currentTab.index + 1});
    }

    // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=2023314
    const browserInfo = await getBrowserInfo();
    if (browserInfo.name == "Firefox" && browser.tabs.ungroup && currentTab.groupId == -1) {
        await browser.tabs.ungroup(newTab.id);
    }
}

function forgetTab(tabId) {
    runWithState(() => delete knownTabIds[tabId]);
}

function getLastPinnedTab(currentWindow) {
    let lastPinnedTab = undefined;
    for (const tab of currentWindow.tabs) {
        if (!tab.pinned) {
            return lastPinnedTab;
        }
        lastPinnedTab = tab;
    }
}

function uuidv4() {
    // see https://stackoverflow.com/a/2117523/520061
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
