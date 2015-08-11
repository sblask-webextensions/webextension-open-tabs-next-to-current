const core = require("sdk/view/core");
const simplePreferences = require('sdk/simple-prefs');
const state = require("./state.js");
const tabs = require("sdk/tabs");
const utils = require("sdk/tabs/utils");

function maybeDisableTabMoving(event) {
    if (event.target.id == "new-tab-button" || event.target.id == "tabbrowser-tabs") {
        if (!simplePreferences.prefs.enabledForButton) {
            state.disable();
        }
    }
}

function __getNextToCurrentTabIndex(window) {
    // opening new window
    if (window.tabs.length === 0) {
        return 0;
    } else {
        return tabs.activeTab.index + 1;
    }
}

function __moveTabNextToCurrent(openingTab) {
    let lowLevelTab = core.viewFor(openingTab);
    let lowLevelBrowser = utils.getTabBrowserForTab(lowLevelTab);
    let index = __getNextToCurrentTabIndex(openingTab.window);
    lowLevelBrowser.moveTabTo(lowLevelTab, index);
}

function maybeMoveTab(openingTab) {
    if (state.isEnabled()) {
        __moveTabNextToCurrent(openingTab);
    } else {
        state.enable();
    }
}

function openNewTabAtDefaultPosition() {
    state.disable();
    tabs.open("about:newtab");
}

exports.maybeDisableTabMoving = maybeDisableTabMoving;
exports.maybeMoveTab = maybeMoveTab;
exports.openNewTabAtDefaultPosition = openNewTabAtDefaultPosition;
