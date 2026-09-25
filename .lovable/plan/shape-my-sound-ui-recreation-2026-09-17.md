# Shape My Sound UI recreation

## Scope

Recreate the reference website as a front-end-only experience, closely matching its playful visual style, page structure, copy, and interactions. No account system, database, or saved submissions will be added.

## Pages

- Home page with navigation, multilingual selector, illustrated welcome area, “How it works,” impact metrics, science overview, parent preview, partner form, and footer
- Science page with the multisensory learning path, Bouba/Kiki explanation, principles, and call to action
- Parent dashboard demo with confidence ring, progress summaries, learning bars, and recent highlights
- Resources page with audience tabs and resource cards
- Practice page with points, activity tabs, badges, interactive sound/shape questions, and immediate front-end feedback
- Demo sign-in page that accepts the displayed sample credentials and enters the site without a backend

## Visual approach

- Warm off-white canvas, dark playful display type, blue and violet activity colors, yellow calls to action, soft bordered cards, and friendly shape characters
- Responsive desktop and mobile navigation and layouts
- Recreate the character artwork with lightweight CSS shapes so no reference screenshot is embedded

## Interaction details

- Language selector updates key labels where practical
- Demo sign-in and sign-out work locally for the current browser session only
- Practice buttons play simple browser-generated tones and update points/progress locally
- Resource audience tabs switch visible content
- Partner form shows a demo confirmation without sending or storing data

## Technical details

- Use TanStack routes for each page and shared front-end layout components
- Define the full visual system with semantic tokens in the global stylesheet
- Add unique page titles and social metadata to every content page
- Verify navigation and key interactions at desktop and mobile sizes
