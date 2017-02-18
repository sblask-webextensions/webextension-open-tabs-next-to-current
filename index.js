
function activatePlugin(initialActiveTabs) {
    const lastActiveTab = new Map(initialActiveTabs.map(t => [t.windowId, t.id]));
    const currentActiveTab = new Map(lastActiveTab);
    //console.log("tabs loaded:", currentActiveTab);

    browser.tabs.onActivated.addListener(({tabId, windowId}) => {
        lastActiveTab.set(windowId, currentActiveTab.get(windowId));
        currentActiveTab.set(windowId, tabId)
        //console.log("onActivated", {tabId, windowId, lastActiveTab: lastActiveTab.get(windowId)});
    });

    function getNextToCurrentTabIndex(windowId) {
        const last = lastActiveTab.get(windowId);
        if(last === undefined) {
            // opening new window
            return Promise.reject("no active tab");
        }
        
        return browser.tabs.get(last).then(tab => tab.index + 1);
    }

    function moveTabNextToCurrent(openingTab) {
        return getNextToCurrentTabIndex(openingTab.windowId)
            .then(index => {
                //console.log("New tab index: " + index);
                return browser.tabs.move(openingTab.id, {index: index})
            }).catch(e => {
                if(e !== "no active tab") {
                    throw e;
                }
            });
    }

    let enabled = true;

    browser.tabs.onCreated.addListener(tab => {
        //console.log("Tab created", tab);
        if(enabled && tab.active) {
            moveTabNextToCurrent(tab);
        }
    });

    browser.commands.onCommand.addListener(command => {
        if(command === "open-new-default") {
            enabled = false;
            browser.tabs.create({}).then(() => {
                enabled = true;
            }).catch(e => {
                enabled = true;
                throw e;
            })
        }
    });

    browser.windows.onRemoved.addListener(windowId => {
        lastActiveTab.delete(windowId);
        currentActiveTab.delete(windowId);
    });
}

browser.tabs.query({active: true}).then(activatePlugin);
