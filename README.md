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
- `logo`, a direct image URL or relative path to the app's logo/icon. For compatibility, `icon` also works.
- `screenshots`, a list of direct image URLs or relative paths, optionally with alt text. For example: `[{ "src": "https://your-image-host.com/luma-main.webp", "alt": "Luma Board workspace" }]`
- `releases`, ordered automatically by release date
- `demo: true` while an entry is sample content; remove it for real entries

You can either paste a **direct HTTPS image URL** into `logo` and `screenshots`, or put image files in an `assets/apps` folder and use relative paths. Example:

```json
{
  "logo": "https://your-image-host.com/luma-icon.png",
  "screenshots": [
    { "src": "https://your-image-host.com/luma-main.webp", "alt": "Luma Board workspace" },
    { "src": "https://your-image-host.com/luma-export.webp", "alt": "Luma Board export screen" }
  ]
}
```

The first valid screenshot appears on the app card and detail hero. Use direct, publicly accessible PNG, JPG, or WebP image links; a link to an image-hosting page is not the image file itself. If a URL is left blank or the image cannot load, the site keeps its existing wordmark or shows the screenshot placeholder.

To replace the VOXEL wordmark site-wide, set `studio.logo` to a direct image URL or relative path. The animated `{>_<}` face and the `STUDIOS` label stay alongside it; use a VOXEL-only wordmark image to avoid repeating the studio label. Leave it blank to use the included local wordmark.

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
- `assets/voxel-favicon.svg` — the `{>_<}` browser-tab icon
