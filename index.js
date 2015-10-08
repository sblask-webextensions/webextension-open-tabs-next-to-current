const core = require("sdk/view/core");
const hotkeys = require("sdk/hotkeys");
const tabs = require("sdk/tabs");
const windows = require("sdk/windows").browserWindows;

const helpers = require("./lib/helpers");
const state = require("./lib/state");

hotkeys.Hotkey({
    combo: "accel-alt-t",
    onPress: helpers.openNewTabAtDefaultPosition,
});

tabs.on("open", helpers.maybeMoveTab);

function registerListeners(window) {
    let lowLevelWindow = core.viewFor(window);
    lowLevelWindow.addEventListener("click", helpers.maybeDisableIfNewTabButtonClick);

    lowLevelWindow.addEventListener("SSWindowStateBusy", function(){ state.disableUntilEnabled(); });
    lowLevelWindow.addEventListener("SSWindowStateReady", function(){ state.enable(); });
}

for (let window of windows) {
    registerListeners(window);
}
windows.on("open", registerListeners);
