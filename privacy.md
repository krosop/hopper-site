---
layout: page.njk
title: "Privacy Policy — Hopper"
description: "How Hopper handles your files, preferences, video pages, and direct links. Local conversion, no account, no analytics."
eyebrow: "Privacy"
canonical: "/privacy"
heading: "Your file stays yours."
lede: "Hopper converts and trims media on your own computer. This page explains exactly what it reads, what it stores, and what leaves your device — which is very little."
---

## Summary

Hopper does not collect, sell, or share personal data. There is no account, no analytics, no advertising, and no remote server operated by Hopper.

File conversion and trimming happen on your device. Auto-detect and video downloads use the local companion, which contacts the page you choose. No media is uploaded to Hopper.

## What Hopper reads

- **The page you are on.** When you open the Video tab, Hopper reads the active tab's address so it can detect a supported video. When you click **Find media on this page**, it looks at that one page for direct video and audio links and lists them for you to pick. Nothing is read on other tabs, and the result stays in the popup.
- **Your format and quality choices**, saved locally with the browser's `storage.local` API so the popup opens with the settings you used last.

## What leaves your device

- **Local file conversion:** nothing. The file is read and written on your computer.
- **The companion:** when you use auto-detect, video downloads, or a direct link, the extension talks to `http://127.0.0.1:8765`, a small service running on your own computer. That address is the loopback interface. It is not reachable from the internet.
- **The page or link you choose:** the companion requests that address exactly as if you opened it in a browser. The host of that page can see the request, just as it would if you opened the link yourself. The media is saved through your browser's download manager.

## The companion

The companion is a separate Windows desktop app, not part of the extension package. It handles auto-detect, video downloads from supported pages, direct links you paste, and a queue. The extension's local file conversion works without it.

A Microsoft Store listing for the companion is coming soon. This policy describes the extension; the companion's Store listing will link to the privacy information that applies to it.

## What Hopper never does

- No personal information, browsing history, page content, files, or links are sent to Hopper's authors.
- No analytics, telemetry, crash reporting, tracking pixels, or advertising IDs.
- No remote code. Every script in the extension ships inside the package.
- No data is sold, rented, or used to build profiles.
- No account is required, and no sign-in is offered.

## Storage and removal

Format and quality preferences are stored on your device only. Removing the extension deletes them. Converted and downloaded files are saved wherever your browser saves downloads; Hopper never keeps a copy.

## Children

Hopper is a general-purpose media tool and is not directed at children. It collects no data from anyone.

## Changes

If this policy changes, the new version will be published at this address with a new effective date, and the extension's version history will note the change.

## Contact

Questions about this policy: [hopperdev@zohomail.com](mailto:hopperdev@zohomail.com).

Effective date: 26 October 2026.
