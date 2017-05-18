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

            let isUndoCloseOrRelatedTab = newTab.index < currentWindow.tabs.length - 1;
            if (!isUndoCloseOrRelatedTab) {
                browser.tabs.move(newTab.id, {index: getNewIndex(currentWindow, currentTab)});
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
