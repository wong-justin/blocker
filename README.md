# Flashing GIF Blocker
Detects flashy GIFS that could trigger photosensitive epilepsy and replaces them.

Current version in progress - replaces all GIFS on page, dangerous or not.

## Demo
![browsing gifs using blocker](./demo/demo.gif)

## Usage
Download this directory, then upload it ("load unpacked" button) to chrome://extensions (needs developer mode on).
It will automatically operate in the backgroud of any newly loaded page.

This is not on the chrome extension store (yet?), so the above method is the only way to use it for now.

## Source Code
[`manifest.json`](./manifest.json) is a Chrome extension file; see [Chrome extension docs.](https://developer.chrome.com/extensions/manifest)
[`contentscript.js`](./contentscript) is executed for each tab before it loads.
[`libgif-modified.js`](./libgif-modified.js) is slightly changed from [libgif](https://github.com/buzzfeed/libgif-js) (see: lines 874-5) for parsing GIF frames but without the onscreen player.

#### Algorithm
- For every page load, continously check for gifs and replace dangerous ones.

- better method soon: the extension keeps a list of all previously analyzed dangerous gifs, and quickly replaces those, while slowly analyzing those not on the list in case there's a new one. 
    - this should have a server that periodically updates as users find new dangerous gifs, and each user's extension periodically udpates from new server list.
    - less effective alternative to a server is for the developer to manually find common dangerous GIFs on the internet and preload the extension with that list, with no dynamic updates, waiting until that happens again for a new extension version.

- detecting if a GIF is dangerous or not:
    - [this reference article](https://www.ofcom.org.uk/__data/assets/pdf_file/0023/104657/Section-2-Guidance-Notes.pdf), pg. 18/19 gives some guidelines of what constitutes harmful flashing. *Not implemented yet.*

### Options/Settings
not configurable yet

## Compatibility
Chrome-only extension; Firefox plugin might come sometime.

Developed on Chrome version 83.0; use the latest version and you should be fine.

### License
MIT License