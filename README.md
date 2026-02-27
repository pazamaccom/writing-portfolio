# Writing Portfolio — Isabella Zapparoli

A bold, expressive magazine-style portfolio for poetry, opinion pieces, and essays.

## Structure

```
├── index.html          # Main entry point — magazine-style feed
├── style.css           # Core styles, colors, typography
├── app.js              # Filtering, animations, interactions
├── content/            # Writing pieces (JSON)
│   └── pieces.json     # All pieces with metadata
└── assets/             # Images, fonts, etc.
```

## Adding Content

Edit `content/pieces.json` to add writing. Each piece follows this format:

```json
{
  "id": 8,
  "title": "Your Piece Title",
  "category": "Poetry",
  "tags": ["love", "nature"],
  "date": "2026-02-26",
  "subtitle": null,
  "authorCredit": null,
  "submittedTo": null,
  "body": "Your full text here...\n\nUse \\n for line breaks.",
  "excerpt": "A short preview of the piece for the card..."
}
```

### Categories
- `Poetry`
- `Opinion`
- `Essays`

## Development

No build step required. Open `index.html` in a browser or deploy as static files.

## Deployment

Purely static HTML/CSS/JS — deploy anywhere (GitHub Pages, Netlify, Vercel, S3, etc.).
