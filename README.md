# Writing Portfolio

A bold, expressive magazine-style portfolio for poetry, opinion pieces, and essays.

## Structure

```
├── index.html          # Main entry point — magazine-style feed
├── style.css           # Core styles, colors, typography
├── app.js              # Filtering, animations, interactions
├── content/            # Your writing pieces (JSON)
│   └── pieces.json     # All pieces with metadata
└── assets/             # Images, fonts, etc.
```

## Adding Content

Edit `content/pieces.json` to add your writing. Each piece follows this format:

```json
{
  "title": "Your Piece Title",
  "category": "poetry",
  "tags": ["love", "nature"],
  "date": "2026-02-26",
  "body": "Your full text here...\n\nUse \\n for line breaks."
}
```

### Categories
- `poetry`
- `opinion`
- `essay`
- `prose`

## Development

No build step required. Open `index.html` in a browser or deploy as static files.

## Deployment

The site is purely static HTML/CSS/JS — deploy anywhere (GitHub Pages, Netlify, Vercel, S3, etc.).
