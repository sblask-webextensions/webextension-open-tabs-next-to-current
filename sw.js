const windowIdTabIdsMapping = new Map();

function setCurrentTabId(windowId, tabId) {
    if (!windowIdTabIdsMapping.has(windowId)) {
        windowIdTabIdsMapping.set(windowId, []);
    }
    windowIdTabIdsMapping.get(windowId).unshift(tabId);
}

function initializeCurrentTabId() {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (tab) {
            setCurrentTabId(tab.windowId, tab.id);
        }
    });
}

function handleTabActivated(activeInfo) {
    setCurrentTabId(activeInfo.windowId, activeInfo.tabId);
}

function moveTab(newTab) {
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
        const tabIds = windowIdTabIdsMapping.get(currentWindow.id);
        if (!tabIds || tabIds.length === 0) return;

        const currentTabId = tabIds[0] === newTab.id ? tabIds[1] : tabIds[0];
        if (!currentTabId) return;

        chrome.tabs.get(currentTabId, (currentTab) => {
            if (chrome.runtime.lastError || !currentTab) return;
            if (currentTab.windowId !== newTab.windowId) return;

            const isUndoCloseTab = newTab.index < currentWindow.tabs.length - 1 && !newTab.openerTabId;
            const isRecoveredTab = newTab.index > currentWindow.tabs.length - 1;

            if (!isUndoCloseTab && !isRecoveredTab) {
                let newIndex;
                if (!currentTab.pinned) {
                    newIndex = currentTab.index + 1;
                } else {
                    let lastPinnedIndex = 0;
                    for (const tab of currentWindow.tabs) {
                        if (tab.pinned) {
                            lastPinnedIndex = tab.index;
                        } else {
                            break;
                        }
                    }
                    newIndex = lastPinnedIndex + 1;
                }
                chrome.tabs.move(newTab.id, { index: newIndex });
            }
        });
    });
}

let moveTabEnabled = true;

function onTabCreated(newTab) {
    if (moveTabEnabled) {
        moveTab(newTab);
    }
}

chrome.commands.onCommand.addListener((command) => {
    if (command === "open-new-tab-at-default-location") {
        moveTabEnabled = false;
        chrome.tabs.create({}, () => {
            moveTabEnabled = true;
        });
    }
});

initializeCurrentTabId();
chrome.tabs.onActivated.addListener(handleTabActivated);
chrome.tabs.onCreated.addListener(onTabCreated);
