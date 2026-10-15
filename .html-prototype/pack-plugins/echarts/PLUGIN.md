# ECharts pack plugin

This directory is the source for chart components shared by host UI packs. It is not a UI pack: it has no install id, and `resolve-pack --list` does not show it.

Edit files under `files/` (class and token prefix is the placeholder `{{prefix}}`; bridge theme list is `{{themeVars}}`). Host profiles live in `hosts.json`. `fragment.json` is the manifest slice merged into each host.

```bash
node skills/ui-pack-maintain/scripts/stamp-chart-plugin.mjs
```

- `admin-desktop` keeps `optional: [data.card]` and the wide chart atoms.
- `mobile-vant` does not reference `data.card`. Chart atoms are phone width. Theme variables follow the mobile foundation (`--mv-danger`, `--mv-font-family`, `--mv-border-color`), not the desktop token names.
