const core = require("sdk/view/core");
const simplePreferences = require('sdk/simple-prefs');
const tabs = require("sdk/tabs");
const utils = require("sdk/tabs/utils");
const windows = require("sdk/windows").browserWindows;

const { Hotkey } = require("sdk/hotkeys");

var openNextToCurrent = true;

function openTabAtDefaultPosition() {
    openNextToCurrent = false;
    tabs.open("about:newtab");
}
Hotkey({
    combo: "accel-alt-t",
    onPress: openTabAtDefaultPosition
});


function getNextToCurrentTabIndex(openingTab) {
    // opening new window
    if (openingTab.window.tabs.length === 0) {
        return 0;
    } else {
        return tabs.activeTab.index + 1;
    }

}

function tabOpenListener(openingTab) {
    if (openNextToCurrent) {
        let lowLevelTab = core.viewFor(openingTab);
        let lowLevelBrowser = utils.getTabBrowserForTab(lowLevelTab);
        lowLevelBrowser.moveTabTo(lowLevelTab, getNextToCurrentTabIndex(openingTab));
    }
    openNextToCurrent = true;
}

tabs.on("open", tabOpenListener);

function windowClickListener(event) {
    if (event.target.id == "new-tab-button" || event.target.id == "tabbrowser-tabs") {
        if (!simplePreferences.prefs.enabledForButton) {
            openNextToCurrent = false;
        }
    }
}


function registerWindowClickListener(window) {
    let lowLevelWindow = core.viewFor(window);
    lowLevelWindow.addEventListener("click", windowClickListener);
}

for (let window of windows) {
    registerWindowClickListener(window);
}
windows.on('open', registerWindowClickListener);
