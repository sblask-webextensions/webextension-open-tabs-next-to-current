const core = require("sdk/view/core");
const helpers = require("./helpers.js");
const hotkeys = require("sdk/hotkeys");
const tabs = require("sdk/tabs");
const windows = require("sdk/windows").browserWindows;

hotkeys.Hotkey({
    combo: "accel-alt-t",
    onPress: helpers.openNewTabAtDefaultPosition
});

tabs.on("open", helpers.maybeMoveTab);

function registerWindowClickListener(window) {
    let lowLevelWindow = core.viewFor(window);
    lowLevelWindow.addEventListener("click", helpers.maybeDisableTabMoving);
}

for (let window of windows) {
    registerWindowClickListener(window);
}
windows.on('open', registerWindowClickListener);
