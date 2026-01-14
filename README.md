Open Tabs Next To Current (Chrome/Brave Port)
==============================================

A Chrome/Brave extension that opens new tabs next to the current tab instead of at the end.

This is a Manifest V3 port of [sblask's Firefox extension](https://github.com/sblask-webextensions/webextension-open-tabs-next-to-current).

Installation
------------

1. Clone or download this repo
2. Go to `chrome://extensions/` (or `brave://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked" and select the folder

Usage
-----

New tabs automatically open to the right of your current tab.

Use `Ctrl-Y` (`Ctrl-Shift-Y` on Windows) to open a new tab at the default location (end of tab bar). Note: keyboard shortcuts may need to be set up manually in Chrome's extension settings.

Known Issues
------------

- Tabs are visibly moved to their final position (API limitation)
- When opening multiple tabs at once, only one may be positioned correctly

Privacy Policy
--------------

This extension does not collect or send any data. It only uses the `tabs` permission to track and reposition tabs.

Credits
-------

Original extension by [Sebastian Blask](https://github.com/sblask-webextensions/webextension-open-tabs-next-to-current).

Chrome/Brave port by [@pshrievedon](https://github.com/pshrievedon).
