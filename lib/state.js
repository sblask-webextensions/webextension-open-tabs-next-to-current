var openNextToCurrent = true;

exports.disable = function() {
    openNextToCurrent = false;
}

exports.enable = function() {
    openNextToCurrent = true;
}

exports.isEnabled = function() {
    return openNextToCurrent;
}
