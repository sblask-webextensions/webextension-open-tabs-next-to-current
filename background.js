const TAB_SESSION_KEY = "open-tabs-next-to-current-tab-uuid";

let currentTabId = undefined;

function updateCurrentTab() {
    let query = {
        active: true,
        currentWindow: true,
    };
    browser.tabs.query(query).then(
        (tabs) => {
            if (tabs.length > 0) {
                currentTabId = tabs[0].id;
            }
        }
    );
}

updateCurrentTab();

browser.tabs.onActivated.addListener(updateCurrentTab);
browser.windows.onFocusChanged.addListener(updateCurrentTab);
browser.windows.onRemoved.addListener(updateCurrentTab);

browser.tabs.onCreated.addListener(moveTab);

browser.commands.onCommand.addListener(function(command) {
    if (command == "open-new-tab-at-default-location") {
        browser.tabs.onCreated.removeListener(moveTab);
        browser.tabs.onCreated.addListener(fixListeners);
        browser.tabs.create({});
    }
});

if (browser.sessions.getTabValue && browser.sessions.setTabValue) {
    browser.runtime.onInstalled.addListener(addSessionKeyToExistingTabs);
}

function addSessionKeyToExistingTabs(_details) {
    browser.tabs.query({}).then(
        allTabs => {
            for (let existingTab of allTabs) {
                browser.sessions.getTabValue(existingTab.id, TAB_SESSION_KEY).then(
                    (uuid) => {
                        if (uuid) {
                            return;
                        }
                        browser.sessions.setTabValue(existingTab.id, TAB_SESSION_KEY, uuidv4());
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
    if (!currentTabId) {
        return;
    }

    Promise.all([
        browser.windows.getCurrent({ populate: true }),
        browser.tabs.get(currentTabId),
    ]).then(
        (result) => {
            let [currentWindow, currentTab] = result;
            if (currentTab.windowId !== newTab.windowId) {
                // tab created by drag into window without focus change
                return;
            }

            if (newTab.url == 'about:newtab') {
                // tab created by pressing "New Tab" button
                return;
            }

            if (browser.sessions.getTabValue && browser.sessions.setTabValue) {
                browser.sessions.getTabValue(newTab.id, TAB_SESSION_KEY).then(
                    (uuid) => {
                        // restored or duplicated tab, position should be right
                        if (uuid) {
                            return;
                        }
                        browser.sessions.setTabValue(newTab.id, TAB_SESSION_KEY, uuidv4());
                        browser.tabs.move(newTab.id, {index: getNewIndex(currentWindow, currentTab)});
                    }
                );
            } else {
                let isUndoCloseOrRelatedTab = newTab.index < currentWindow.tabs.length - 1;
                let isRecoveredTab = newTab.index > currentWindow.tabs.length - 1;
                if (!isUndoCloseOrRelatedTab && !isRecoveredTab) {
                    browser.tabs.move(newTab.id, {index: getNewIndex(currentWindow, currentTab)});
                }
            }
        }
    );
}

function getNewIndex(currentWindow, currentTab) {
    if (!currentTab.pinned) {
        return currentTab.index + 1;
    }

    let lastPinnedTab = undefined;
    for (let tab of currentWindow.tabs) {
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
