Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

EXPORTED_SYMBOLS = ["OpenTabsNextToCurrent"];

function OpenTabsNextToCurrent() {
    this.busy = false;

    this.initialize = function(domWindow) {
        if (!domWindow ||
            !domWindow.gBrowser ||
            !domWindow.gBrowser.tabContainer) {
            return;
        }
        this.domWindow = domWindow;
        this.gBrowser = domWindow.gBrowser;
        this.tabContainer = domWindow.gBrowser.tabContainer;

        this.domWindow.addEventListener("SSWindowStateBusy", this.onBusy);
        this.domWindow.addEventListener("SSWindowStateReady", this.onReady);
        this.tabContainer.addEventListener("TabOpen", this.onTabOpen);
    };
    this.destroy = function() {
        if (!this.domWindow ||
            !this.domWindow.gBrowser ||
            !this.domWindow.gBrowser.tabContainer) {
            return;
        }
        this.domWindow.removeEventListener("SSWindowStateBusy", this.onBusy);
        this.domWindow.removeEventListener("SSWindowStateReady", this.onReady);
        this.tabContainer.removeEventListener("TabOpen", this.onTabOpen);
    };
    this.onBusy = function(anEvent) {
        this.busy = true;
    }.bind(this);
    this.onReady = function(anEvent) {
        this.busy = false;
    }.bind(this);
    this.onTabOpen = function(anEvent) {
        if (!this.busy) {
            var openingTab = anEvent.target;
            var currentTab = this.gBrowser.mCurrentTab;
            this.gBrowser.moveTabTo(openingTab, currentTab.nextSibling._tPos);
        }
    }.bind(this);
}

