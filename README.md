[![Build Status](https://travis-ci.org/sblask/firefox-open-tabs-next-to-current.svg?branch=master)](https://travis-ci.org/sblask/firefox-open-tabs-next-to-current)

Open Tabs Next To Current
=========================

Open tabs that would normally be opened last next to the current one. Tabs that
are being re-opened are thus not included.  You can use `Ctrl-Y`
(`Ctrl-Shift-Y` on Windows) to open a new tab at the default location.

Note for Chrome
---------------

Keyboard shortcuts are not automatically set up. You need to do that manually
on the extension page in settings.

Note for Firefox
----------------

Tabs that are opened by clicking on links are opened at the default location.
You can change the setting `browser.tabs.insertRelatedAfterCurrent` in
`about:config` if you want even those to be opened right next to the current. 

Known Issues
------------

Caused by limitations of the webextension API, see
[#26](https://github.com/sblask/firefox-open-tabs-next-to-current/issues/26):

 - tabs are visibly moved to their final position
 - the tab bar is scrolled so the opened tab becomes the first visible one on
   the left (Firefox only)

Feedback
--------

You can report bugs or make feature requests on
[Github](https://github.com/sblask/firefox-open-tabs-next-to-current).

Patches are welcome.
