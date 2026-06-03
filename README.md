# Wear U Going?

Wear U Going? is a weather-aware outfit recommendation app built as a portfolio project. Users choose a destination, date range, wardrobe preference, and style; the app combines live weather data with AI-generated outfit advice.

## Features

- Location autocomplete using OpenStreetMap Nominatim
- Forecast lookup using Open-Meteo
- AI-generated outfit recommendations with Anthropic
- Date range selection limited to available forecast data
- Wardrobe and style controls
- Responsive Tailwind layout for mobile, tablet, and desktop
- Structured daily results with weather icons, temperatures, outfit items, and practical tips

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui and Radix UI primitives
- lucide-react icons
- Anthropic SDK
- Open-Meteo and Nominatim APIs

## How It Works

1. The user searches for a location and selects a suggestion.
2. The form sends the location, coordinates, dates, wardrobe, and style to `/api/outfit`.
3. The API route fetches weather data from Open-Meteo.
4. The forecast is sent to Anthropic with a structured JSON response prompt.
5. The API validates the AI response and returns parsed outfit advice.
6. The UI renders one recommendation card per forecast day, plus general trip tips.

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Portfolio Notes

This project focuses on practical frontend and full-stack skills:

- React state and controlled inputs
- Component composition
- Responsive CSS Grid with Tailwind breakpoints
- Next.js route handlers
- External API integration
- AI response validation
- Error and loading states

## Deployment

The app is deployed on Vercel. Add the live URL here when sharing the repository publicly.
