"use strict";

function activatePlugin(initialTabs) {
    let repositionRightOnly = false;
    function updateOptions() {
        browser.storage.local.get(["repositionRightOnly"], result => {
            repositionRightOnly = result.repositionRightOnly || false;
            console.log("loaded settings:", {repositionRightOnly});
        });
    }
    updateOptions();
    browser.storage.onChanged.addListener(updateOptions);

    const windowInfoMap = new Map();
    function getWindowInfo(windowId) {
        let windowInfo = windowInfoMap.get(windowId);
        if(windowInfo === undefined) {
            windowInfo = {numTabs: 0};
            windowInfoMap.set(windowId, windowInfo);
        }
        return windowInfo;
    }
    initialTabs.forEach(tab => {
        const windowInfo = getWindowInfo(tab.windowId);
        windowInfo.numTabs++;
        if(tab.active) {
            windowInfo.activeTabId = tab.id;
        }
    });
    console.log("initial tabs loaded:", {windowInfoMap, initialTabs});

    browser.tabs.onActivated.addListener(({tabId, windowId}) => {
        const windowInfo = getWindowInfo(windowId);
        windowInfo.lastActiveTabId = windowInfo.activeTabId;
        windowInfo.activeTabId = tabId;
        console.log("onActivated:", {tabId, windowId, windowInfo});
    });

    function getLastTabIndex(openedTab) {
        const windowInfo = getWindowInfo(openedTab.windowId);
        const lastTabId = openedTab.active ? windowInfo.lastActiveTabId : windowInfo.activeTabId;
        if(lastTabId === undefined) {
            // opening new window
            return Promise.reject("no active tab");
        }

        return browser.tabs.get(lastTabId).then(tab => {
            console.log("Last tab:", tab);
            return tab.index;
        });
    }

    function moveTabNextToCurrent(openedTab) {
        return getLastTabIndex(openedTab)
            .then(index => {
                // If new tab is left of last, last one has already been shifted one
                if(openedTab.index > index) {
                    index++;
                }
                console.log("New tab index: " + index);
                return browser.tabs.move(openedTab.id, {index: index});
            }).catch(e => {
                if(e !== "no active tab") {
                    throw e;
                }
            });
    }

    let enabled = true;

    browser.tabs.onCreated.addListener(tab => {
        console.log("Tab created:", tab);

        const windowInfo = getWindowInfo(tab.windowId);
        windowInfo.numTabs++;
        if(tab.active) {
            windowInfo.activeTabId = tab.id;
        }

        if(windowInfo.opening) {
            const now = new Date().getTime();
            if(now - windowInfo.lastTabCreated < 200) {
                console.log("New tab created too soon after window, probably restoring, skipping:", {tab, windowInfo});
                windowInfo.lastTabCreated = now;
                return;
            }
            windowInfo.opening = false;
        }

        if(enabled && (!repositionRightOnly || tab.index === windowInfo.numTabs - 1)) {
            moveTabNextToCurrent(tab);
        }
    });

    browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
        const windowInfo = getWindowInfo(removeInfo.windowId);
        windowInfo.numTabs--;

        console.log("Tab removed:", {tabId, removeInfo});
    });

    browser.commands.onCommand.addListener(command => {
        if(command === "open-new-default") {
            enabled = false;
            browser.tabs.create({}).then(() => {
                enabled = true;
            }).catch(e => {
                enabled = true;
                throw e;
            });
        }
    });

    browser.windows.onRemoved.addListener(windowId => {
        console.log("Window removed:", windowId);
        windowInfoMap.delete(windowId);
    });

    browser.windows.onCreated.addListener(window => {
        console.log("New window:", window);
        const windowInfo = getWindowInfo(window.id);
        windowInfo.opening = true;
        windowInfo.lastTabCreated = new Date().getTime();
    });

    browser.tabs.onAttached.addListener((tabId, attachInfo) => {
        console.log("Tab attached:", tabId, attachInfo);
        const windowInfo = getWindowInfo(attachInfo.newWindowId);
        windowInfo.numTabs++;
    });

    browser.tabs.onDetached.addListener((tabId, detachInfo) => {
        console.log("Tab detached:", tabId, detachInfo);
        const windowInfo = getWindowInfo(detachInfo.oldWindowId);
        windowInfo.numTabs--;
    });
}

browser.tabs.query({}).then(activatePlugin);
