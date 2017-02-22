"use strict";

function restoreOptions() {
    browser.storage.local.get(["repositionRightOnly"], result => {
        console.log("restoring options:", result);
        document.querySelector("#repositionRightOnly").checked = result.repositionRightOnly;
    });
}

function saveOptions() {
    browser.storage.local.set({
        repositionRightOnly: document.querySelector("#repositionRightOnly").checked,
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);

document.querySelector("#repositionRightOnly").addEventListener("change", saveOptions);

browser.storage.onChanged.addListener(restoreOptions);
