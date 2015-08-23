const core = require("sdk/view/core");
const preferences = require("sdk/preferences/service");
const simplePreferences = require('sdk/simple-prefs');
const tabs = require("sdk/tabs");
const utils = require("sdk/tabs/utils");

const state = require("./state.js");

function __isNewTabButtonClick(event) {
    return (
        event.target.id == "new-tab-button" ||
        event.target.id == "tabbrowser-tabs" ||
        event.target.id == "privateTab-toolbar-openNewPrivateTab" ||
        false
    );
}
exports.maybeDisableIfNewTabButtonClick = function(event) {
    let disableForButton = !simplePreferences.prefs.enabledForButton;
    if (__isNewTabButtonClick(event) && disableForButton) {
        state.disable();
    }
};

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

exports.maybeMoveTab = function (openingTab) {
    if (state.isEnabled()) {
        __moveTabNextToCurrent(openingTab);
    } else {
        state.enable();
    }
};

exports.openNewTabAtDefaultPosition = function() {
    state.disable();
    tabs.open(preferences.get("browser.newtab.url", "about:newtab"));
};
