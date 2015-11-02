const core = require("sdk/view/core");
const preferences = require("sdk/preferences/service");
const simplePreferences = require("sdk/simple-prefs");
const tabs = require("sdk/tabs");
const utils = require("sdk/tabs/utils");

const state = require("./state");

function __isNewTabButtonClick(event) {
    return (
        event.target.id == "new-tab-button" ||
        event.target.id == "tabbrowser-tabs" ||
        event.target.id == "privateTab-toolbar-openNewPrivateTab" ||
        false
    );
}

exports.maybeDisableIfNewTabButtonClick = function(event) {
    const disableForButton = !simplePreferences.prefs.enabledForButton;
    if (__isNewTabButtonClick(event) && disableForButton) {
        state.disableOnce();
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
    const lowLevelTab = core.viewFor(openingTab);
    const lowLevelBrowser = utils.getTabBrowserForTab(lowLevelTab);
    const index = __getNextToCurrentTabIndex(openingTab.window);
    lowLevelBrowser.moveTabTo(lowLevelTab, index);
}

exports.maybeMoveTab = function(openingTab) {
    if (state.isEnabled()) {
        __moveTabNextToCurrent(openingTab);
    }
};

function getNewTabURL() {
    try {
        return require("resource:///modules/NewTabURL.jsm").NewTabURL.get();
    }
    catch (error) {
        return "about:newtab";
    }
}

exports.openNewTabAtDefaultPosition = function() {
    state.disableOnce();
    tabs.open(preferences.get("browser.newtab.url", getNewTabURL()));
};
