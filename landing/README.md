# Sweeply Landing Website

This directory contains the landing website for Sweeply, accessible at [sweeplypro.com](https://sweeplypro.com).

## About

The landing website serves as the public-facing portal for Sweeply, showcasing the platform's features, benefits, and pricing for potential customers.

## Development

To start the development server:

```bash
# From the root directory
npm run dev:landing

# Or directly from this directory
npm run dev
```

## Building for Production

To build the landing website for production:

```bash
# From the root directory
npm run build:landing

# Or directly from this directory
npm run build
```

## Deployment

The landing website is deployed separately from the main Sweeply application. After building, the contents of the `dist` directory can be deployed to your hosting provider.

## Structure

- `src/pages/` - Page components including HomePage, FeaturesPage, etc.
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and shared logic
- `public/` - Static assets like images and fonts

## Design

The website uses Tailwind CSS for styling and follows the Sweeply brand guidelines for colors and typography. 