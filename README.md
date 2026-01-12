# Insurance Agency Multi-Client Template

A fully dynamic, multi-client Next.js template for insurance agency websites. This template is designed to serve multiple clients from a single codebase, with all content, theming, and configuration driven by Supabase.

## Overview

This repository is a **white-label insurance agency template** that can be deployed for any insurance client by simply changing environment variables and database entries. All content, colors, typography, and branding are fully dynamic.

### Key Capabilities

- **Multi-Client Architecture**: One codebase serves unlimited clients
- **Dynamic Theming**: Colors, fonts, and styles controlled via database
- **Multi-Location Support**: Clients can have multiple office locations
- **Content Management**: All content stored in Supabase (blogs, policies, FAQs, team, etc.)
- **SEO Optimization**: Dynamic metadata, structured data, and canonical URLs
- **Server-Side Rendering**: Next.js App Router with SSR/SSG
- **Responsive Design**: Mobile-first with Tailwind CSS

---

## Implementation Phases

### Phase 1-3: Core Infrastructure
- Next.js App Router migration from React+Vite
- Supabase integration for all data fetching
- Multi-location data model (`clients` → `client_websites` → `client_locations`)

### Phase 4: Content Management
- Dynamic policy pages with category routing
- Blog system with topics and posts
- Team member profiles
- FAQ categories and items
- Insurance glossary

### Phase 5: SEO & Structured Data
- Dynamic `<head>` metadata per page
- JSON-LD structured data (LocalBusiness, FAQ, Article, etc.)
- Canonical URLs and OpenGraph tags
- Google Tag Manager integration

### Phase 6: Forms & Functionality
- Contact form with Supabase storage
- Job application form
- Search functionality across all content
- Toast notifications

### Phase 7: Dynamic Theming ✅
- **Theme settings stored in `client_theme_settings` table**
- **CSS variables injected via `ThemeProvider`**
- **All colors use theme-aware Tailwind classes**
- **Typography variables for fonts and weights**

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
# Required: Client identifier
NEXT_PUBLIC_CLIENT_ID=your-client-uuid

# Required: Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout with ThemeProvider
│   ├── page.tsx              # Homepage
│   ├── about/
│   ├── blog/[topic]/[slug]/
│   ├── contact/
│   ├── faq/
│   ├── glossary/[slug]/
│   ├── locations/[slug]/     # Multi-location pages
│   ├── our-team/[slug]/
│   ├── policies/[category]/
│   └── ...
├── components/
│   ├── layout/               # Header, Footer
│   ├── landing-page/         # Homepage sections
│   ├── policies/             # Policy templates
│   ├── blog/                 # Blog components
│   ├── ui/                   # Divider, buttons, etc.
│   └── ...
├── lib/
│   ├── supabase/             # Supabase client
│   ├── theme/                # Theme fetching & provider
│   │   ├── index.ts          # getThemeSettings()
│   │   ├── ThemeProvider.tsx # CSS variable injection
│   │   └── defaults.ts       # Fallback values
│   ├── types/                # TypeScript types
│   └── [data fetchers]       # client.ts, website.ts, blog.ts, etc.
├── styles/
│   └── globals.css           # CSS variables & base styles
├── supabase/
│   └── migrations/           # SQL migration files
└── docs/                     # Implementation documentation
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `clients` | Parent agency record (agency_name, contact info) |
| `client_websites` | Website config per client (canonical_url, meta, features) |
| `client_locations` | Physical office locations (address, hours, geo) |
| `client_theme_settings` | Dynamic theme colors and typography |
| `client_home_page` | Homepage section content (hero, intro, services, etc.) |
| `client_page_metadata` | Per-page SEO metadata |
| `client_blogs_content` | Blog posts |
| `client_blogs_topics` | Blog categories |
| `client_policy_pages` | Insurance policy content |
| `client_policy_categories` | Policy groupings |
| `client_team_members` | Staff profiles |
| `client_faqs` | FAQ items by category |
| `client_insurance_glossary` | Insurance term definitions |

### Theme Settings Table

```sql
CREATE TABLE client_theme_settings (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  
  -- Colors
  color_primary VARCHAR(7),      -- e.g., '#004080'
  color_secondary VARCHAR(7),    -- e.g., '#A7D8DE'
  color_accent VARCHAR(7),       -- e.g., '#F76C5E'
  color_background VARCHAR(7),   -- e.g., '#FAF3E0'
  color_text_body VARCHAR(7),    -- e.g., '#5C4B51'
  
  -- Typography
  font_heading VARCHAR(100),     -- e.g., 'Playfair Display'
  font_body VARCHAR(100),        -- e.g., 'Inter'
  
  -- Divider
  divider_color VARCHAR(7),
  divider_thickness INTEGER,
  divider_style VARCHAR(20)
);
```

---

## Theming System

### How It Works

1. **Server Fetch**: `getThemeSettings()` fetches theme from Supabase by `client_id`
2. **SSR Injection**: `ThemeStyleTag` injects CSS variables in `<head>` to prevent FOUC
3. **Client Hydration**: `ThemeProvider` updates CSS variables on mount
4. **Tailwind Classes**: All components use theme-aware classes like `text-primary`, `bg-accent`

### CSS Variables

```css
:root {
  --color-primary: #004080;
  --color-secondary: #A7D8DE;
  --color-accent: #F76C5E;
  --color-background: #FAF3E0;
  --color-text-body: #5C4B51;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --divider-color: #A7D8DE;
  --divider-thickness: 4px;
}
```

### Tailwind Color Mapping

| Theme Class | CSS Variable | Fallback |
|-------------|--------------|----------|
| `text-primary` | `--color-primary` | `#004080` |
| `bg-secondary` | `--color-secondary` | `#A7D8DE` |
| `text-accent` | `--color-accent` | `#F76C5E` |
| `bg-theme-bg` | `--color-background` | `#FAF3E0` |
| `text-theme-body` | `--color-text-body` | `#5C4B51` |

---

## Fallbacks

### ⚠️ Important: Default Values

If no theme is configured in the database, the system uses these **hardcoded fallbacks**:

| Element | Fallback Value | Location |
|---------|---------------|----------|
| Primary Color | `#004080` (navy) | `lib/theme/defaults.ts` |
| Secondary Color | `#A7D8DE` (ocean) | `lib/theme/defaults.ts` |
| Accent Color | `#F76C5E` (coral) | `lib/theme/defaults.ts` |
| Background Color | `#FAF3E0` (sand) | `lib/theme/defaults.ts` |
| Body Text Color | `#5C4B51` (driftwood) | `lib/theme/defaults.ts` |
| Heading Font | `Playfair Display` | `lib/theme/defaults.ts` |
| Body Font | `Inter` | `lib/theme/defaults.ts` |
| Divider Color | `#A7D8DE` | `components/ui/Divider.tsx` |
| Theme Meta Color | `#004080` | `app/layout.tsx` |

### CSS Variable Fallbacks

These appear in inline styles for components that need to work without theme context:

```tsx
// Divider.tsx
style={{ backgroundColor: 'var(--divider-color, #A7D8DE)' }}

// layout.tsx
themeColor: 'var(--color-primary, #004080)'
```

---

## Deploying for a New Client

### Step 1: Database Setup

1. Insert client record in `clients` table
2. Insert website config in `client_websites` table
3. Insert theme settings in `client_theme_settings` table
4. Populate content tables (policies, blogs, team, etc.)

### Step 2: Environment Configuration

```env
NEXT_PUBLIC_CLIENT_ID=new-client-uuid
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Deploy

```bash
npm run build
npm start
```

The site will automatically:
- Fetch client data from Supabase
- Apply the client's theme colors
- Display the client's content
- Generate proper SEO metadata

---

## Multi-Location Support

For clients with multiple offices:

1. Create multiple `client_locations` records
2. Each location gets a `client_websites` entry with a unique `slug`
3. Location pages available at `/locations/[slug]`
4. `isMultiLocation()` utility detects multi-location clients
5. Shared pages (policies, blog, about) link back to all locations

---

## Development

### Build Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npx tsc --noEmit # TypeScript check
```

### Adding New Theme Variables

1. Add column to `client_theme_settings` table
2. Update `ThemeSettings` type in `lib/types/theme.ts`
3. Add to `DEFAULT_THEME` in `lib/theme/defaults.ts`
4. Add to `themeToCssVars()` in `lib/theme/index.ts`
5. Add CSS variable to `styles/globals.css`
6. Add Tailwind color mapping in `tailwind.config.ts`

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Inter, Playfair Display, Caveat)

---

## Documentation

See `/docs` folder for detailed implementation docs:

- `phase-7-dynamic-theming.md` - Theme system design
- `phase-7-checklist.md` - Implementation checklist

---

## License

Private repository. All rights reserved.
