const core = require("sdk/view/core");
const hotkeys = require("sdk/hotkeys");
const tabs = require("sdk/tabs");
const windows = require("sdk/windows").browserWindows;

const helpers = require("./lib/helpers");
const state = require("./lib/state");

let hotkey;

function __disableUntilEnabled(_event) {
    state.disableUntilEnabled();
}

function __enable(_event) {
    state.enable();
}

function registerListeners(window) {
    const lowLevelWindow = core.viewFor(window);

    lowLevelWindow.addEventListener("click", helpers.maybeDisableIfNewTabButtonClick, true);
    lowLevelWindow.addEventListener("SSWindowStateBusy", __disableUntilEnabled);
    lowLevelWindow.addEventListener("SSWindowStateReady", __enable);
}

function removeListeners(window) {
    const lowLevelWindow = core.viewFor(window);

    lowLevelWindow.removeEventListener("click", helpers.maybeDisableIfNewTabButtonClick);
    lowLevelWindow.removeEventListener("SSWindowStateBusy", __disableUntilEnabled);
    lowLevelWindow.removeEventListener("SSWindowStateReady", __enable);
}

exports.main = function(options) {
    console.log("Starting up with reason ", options.loadReason);

    hotkey = hotkeys.Hotkey({
        combo: "accel-alt-t",
        onPress: helpers.openNewTabAtDefaultPosition,
    });

    tabs.on("open", helpers.maybeMoveTab);

    for (let window of windows) {
        registerListeners(window);
    }

    windows.on("open", registerListeners);
};

exports.onUnload = function(reason) {
    console.log("Closing down with reason ", reason);

    windows.off("open", registerListeners);
    for (let window of windows) {
        removeListeners(window);
    }

    tabs.off("open", helpers.maybeMoveTab);

    if (hotkey) {
        hotkey.destroy();
    }
};
