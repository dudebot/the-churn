# THE CHURN

An interactive, research-informed exploration of how selective cooperation and eroding bridges can fragment a social network—and how shared fate can counter that tendency.

**Live:** https://dudebot.github.io/the-churn/

Static HTML, CSS and JavaScript; no build dependencies, analytics, API keys, personal data, or backend. Optional Google Fonts fall back to installed fonts. A module worker computes each reproducible condition without blocking the controls.

## Run locally

```
python -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. ES modules require HTTP rather than opening the HTML as a local file.

## Check

```
npm test
npm run audit
```

See [MODEL.md](MODEL.md) for equations, source links, meanings of the metrics, projection caveats and the 20-seed sensitivity results. The published mechanisms do not empirically validate the assumed churn-to-parameter mapping. This is a mechanism explorer, not a geopolitical forecast.

## Controls

- **Churn:** changes confidence and incompatible-tie decay/rewiring.
- **Shared fate & mutual aid:** expands confidence, preserves ties and enables cross-population encounters.
- **Cooperation around:** selects dimensions relevant to an encounter. The same agent can end up with different circles in different contexts.
- **Compare stable world:** compares the current condition with churn zero, holding population and other inputs fixed.
- **New population:** moves to the next reproducible seed.
- **Export data:** downloads the full current model state as JSON.

Publishing uses GitHub Pages from the root of `main`; `.nojekyll` preserves plain static serving. The public repository contains only synthetic model materials, not the private conversation that motivated it.
