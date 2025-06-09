# Sweeply

Sweeply is a comprehensive platform designed for cleaning professionals to efficiently manage clients, schedule jobs, track teams, and grow their business.

## Project Structure

The Sweeply project consists of several key components:

- `Sweeply-App/` - The main mobile application for cleaning professionals
- `landing/` - The landing website accessible at [sweeplypro.com](https://sweeplypro.com)
- `NewBrandApp/` - The new branded version of the application
- `supabase/` - Backend functions and database migrations

## Development

### Main Application

```bash
# Start the main app development server
npm run dev
```

### Landing Website

```bash
# Start the landing website development server
npm run dev:landing
```

## Building for Production

### Main Application

```bash
# Build the main application
npm run build
```

### Landing Website

```bash
# Build the landing website
npm run build:landing
```

## Deployment

Each component is deployed separately:

- The main application is deployed to mobile app stores
- The landing website is deployed to web hosting (Vercel, Netlify, etc.)
- Backend functions are deployed to Supabase

## License

Proprietary - All rights reserved 