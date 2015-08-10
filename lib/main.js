const core = require("sdk/view/core");
const tabs = require("sdk/tabs");
const utils = require("sdk/tabs/utils");

function getNextToCurrentTabIndex(openingTab) {
    // opening new window
    if (openingTab.window.tabs.length === 0) {
        return 0;
    } else {
        return tabs.activeTab.index + 1;
    }

}

function tabOpenListener(openingTab) {
    let lowLevelTab = core.viewFor(openingTab);
    let lowLevelBrowser = utils.getTabBrowserForTab(lowLevelTab);
    lowLevelBrowser.moveTabTo(lowLevelTab, getNextToCurrentTabIndex(openingTab));
}
tabs.on("open", tabOpenListener);
