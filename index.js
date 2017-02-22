
function activatePlugin(initialActiveTabs) {
    const lastActiveTab = new Map(initialActiveTabs.map(t => [t.windowId, t.id]));
    const currentActiveTab = new Map(lastActiveTab);
    //console.log("tabs loaded:", currentActiveTab);

    browser.tabs.onActivated.addListener(({tabId, windowId}) => {
        lastActiveTab.set(windowId, currentActiveTab.get(windowId));
        currentActiveTab.set(windowId, tabId);
        console.log("onActivated:", {tabId, windowId, lastActiveTab: lastActiveTab.get(windowId)});
    });

    function getLastTabIndex(openedTab) {
        const lastTabId = (openedTab.active ? lastActiveTab : currentActiveTab).get(openedTab.windowId);
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
        if(enabled) {
            moveTabNextToCurrent(tab);
        }
    });

    browser.tabs.onRemoved.addListener(tabId => {
        console.log("Tab removed:", tabId);
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
        lastActiveTab.delete(windowId);
        currentActiveTab.delete(windowId);
    });

    browser.windows.onCreated.addListener(window => {
        console.log("New window:", window);
    });
}

browser.tabs.query({active: true}).then(activatePlugin);
