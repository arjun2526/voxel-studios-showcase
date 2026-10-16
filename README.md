# VOXEL STUDIOS App Showcase

A responsive static site for presenting VOXEL STUDIOS apps, supported platforms, release notes, screenshots, and installer downloads. Its bold type, oversized logo, dark blue-black palette, curved controls, and motion-led transitions take broad layout inspiration from [ArtCraft](https://getartcraft.com/) while keeping VOXEL’s own branding and content. The supplied VOXEL wordmark is paired with a CSS animated `{>_<}` face that blinks in the hero, header, and studio section. App icons and screenshots load from the app metadata; no app screenshots or icons were provided, so the demo entries show clearly labeled slots until you add them. The included catalog contains **sample/demo metadata only**. No installer files or real download URLs are included.

## Run locally

The pages load `apps.json` with `fetch`, so open the folder through a local web server instead of double-clicking the HTML files.

From this folder in PowerShell, run:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Then visit [http://localhost:8000](http://localhost:8000). Stop the server with `Ctrl+C`.

## Replace the sample apps

Edit `apps.json` and replace the demo entries in the `apps` array. Keep each app's `id` unique; it becomes the query value for `app-detail.html?app=your-id`.

Each app can include:

- `name`, `tagline`, `description`, and `category`
- `featured` to order it near the front of the homepage
- `platforms`, using `windows` and optionally `macos`
- `requirements`, with a short minimum OS version for each platform
- `icon`, a relative path to the app's real icon file, such as `assets/apps/luma-icon.png`
- `screenshots`, a list of relative image paths or objects with `src` and optional `alt`, for example `[{ "src": "assets/apps/luma-main.png", "alt": "Luma Board workspace" }]`
- `releases`, ordered automatically by release date
- `demo: true` while an entry is sample content; remove it for real entries

Create an `assets/apps` folder and place the real app icon and screenshots there. Then set `icon` and `screenshots` for that app in `apps.json`. The first screenshot appears on its catalog card and detail page. Use web-friendly image files such as PNG, JPG, or WebP, and keep filenames free of spaces. Leave the fields empty until real images are available; the site will show a labeled placeholder instead of invented app art.

Each release has a `version`, `name`, ISO `date` (`YYYY-MM-DD`), `status`, `summary`, `changes`, and a `downloads` array. The detail page renders one download control for each supported platform. The control only becomes active when both `status` is `available` and `downloadUrl` is a usable URL.

## Add an installer

1. Create a `downloads` folder beside `index.html`.
2. Put the real installer there, for example `downloads/my-app-setup.exe`.
3. In the matching release's `downloads` entry, set `status` to `available`, set `downloadUrl` to `downloads/my-app-setup.exe`, and set `filename` to the installer name.
4. Add a separate `macos` download entry only when you have a real macOS build to publish.

Until a valid link is added, the page shows **Installer not uploaded**. For hosted installers, use a real HTTPS URL. Check your installer, checksum, and release notes before publishing.

## Social links

The Instagram profile, X profile, and Discord handle are stored under `studio.socials` in `apps.json`. Instagram and X open `@voxel_studio`; the Discord button copies `voxel_studio` because no invite or server URL was provided. Add a real Discord invite link if you want that button to open a server instead.

## Files

- `index.html` — homepage and searchable app catalog
- `app-detail.html` — dynamic app page, selected by the `app` query parameter
- `style.css` — responsive visual system and layouts
- `js/app.js` — catalog loading, filtering, sorting, and detail rendering
- `apps.json` — editable studio and app release metadata
- `assets/voxel-logo.png` — cleaned transparent VOXEL lockup, with the trademark removed
- `assets/voxel-wordmark.png` — VOXEL wordmark used beside the animated face
