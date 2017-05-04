let currentTabId = undefined;

function updateCurrentTab() {
    let query = {
        active: true,
        currentWindow: true,
    };
    browser.tabs.query(query).then(
        (tabs) => {
            currentTabId = tabs[0].id;
        }
    );
}

updateCurrentTab();

browser.tabs.onActivated.addListener(updateCurrentTab);
browser.windows.onFocusChanged.addListener(updateCurrentTab);
browser.windows.onRemoved.addListener(updateCurrentTab);

browser.tabs.onCreated.addListener(moveTab);

function moveTab(newTab) {
    Promise.all([
        browser.windows.getCurrent({ populate: true }),
        browser.tabs.get(currentTabId),
    ]).then(
        (result) => {
            let [currentWindow, currentTab] = result;
            let isUndoCloseOrRelatedTab = newTab.index < currentWindow.tabs.length - 1;
            if (!isUndoCloseOrRelatedTab) {
                browser.tabs.move(newTab.id, {index: currentTab.index + 1});
            }
        }
    );
}
