let disabled = false;
let disabledOnce = false;

exports.disableUntilEnabled = function() {
    disabled = true;
};

exports.disableOnce = function() {
    disabledOnce = true;
};

exports.enable = function() {
    disabled = false;
};

exports.isEnabled = function() {
    if (disabledOnce) {
        disabledOnce = false;
        return false;
    }

    return !disabled;
};
