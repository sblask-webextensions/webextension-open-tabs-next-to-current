var openNextToCurrent = true;

function disable() {
    openNextToCurrent = false;
}

function enable() {
    openNextToCurrent = true;
}

function isEnabled() {
    return openNextToCurrent;
}

exports.disable = disable;
exports.enable = enable;
exports.isEnabled = isEnabled;
