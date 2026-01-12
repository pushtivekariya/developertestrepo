# Developer Test Repository - Variant Layout Development

This repository is for **external developers** building variant layouts for the Coverage Creatives insurance template system.

---

## Getting Started

### 1. Get Your Test Client ID

You will receive a **Client ID (UUID)** from Coverage Creatives. This ID links to pre-seeded test data in our database including:

- Test client record
- Website configuration
- Theme settings (colors, fonts)
- 2 office locations (Downtown + Suburban)
- 5 policy pages (Auto, Home, Life, Business, Renters)
- 2 about pages
- 4 staff members
- 5 glossary pages
- Home page content

### 2. Clone This Repository

```bash
git clone https://github.com/WorkSync-Developement/developertestrepo.git
cd developertestrepo
npm install
```

### 3. Configure Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=[provided by Coverage Creatives]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[provided by Coverage Creatives]
NEXT_PUBLIC_CLIENT_ID=[your-uuid-from-coverage-creatives]
```

> **Note**: Contact Coverage Creatives for your Supabase credentials and Client ID.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## What You're Building

You are creating **variant layouts** - alternative visual designs for insurance agency websites. The variant system allows different visual styles while maintaining the same data structure.

### Design Context

All variants are for **insurance agencies**. Keep designs professional, trustworthy, and conversion-focused. Reference these live examples for inspiration:

- **[larsongroupinsurance.com](https://larsongroupinsurance.com)** - Multi-location agency with modern, clean design
- **[odonohoeagency.com](https://odonohoeagency.com)** - Single-location agency with traditional, professional feel

Your variants should work for agencies like these - local insurance businesses serving home, auto, life, and commercial insurance needs.

### Variant Components

See `docs/TEMPLATE_VARIANT_SPECIFICATION.md` for the full component contract.

Key components to implement variants for:
- Header (navigation, logo, phone CTA)
- Footer (contact info, social links, locations)
- HeroSection (main banner with CTA)
- IntroSection (about/intro content)
- Testimonials (customer reviews)
- PolicyPageTemplate (insurance policy detail pages)
- And more...

### Variant Location

Place your variant components in:
```
components/variants/[variant-name]/
```

---

## Template Overview

This is a **white-label insurance agency template** with all content driven by Supabase.

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

## Testing Checklist

Once set up, verify these pages render correctly:

### Core Pages
- [ ] Home page (all sections)
- [ ] About page
- [ ] Contact page
- [ ] FAQ page

### Policy Pages
- [ ] Policies list page
- [ ] Individual policy page (e.g., `/policies/personal-insurance/auto-insurance-test-city-tx`)

### Multi-Location Pages
- [ ] Location landing page (`/locations/downtown`)
- [ ] Location about page (`/locations/downtown/about`)

### Staff & Glossary
- [ ] Team page
- [ ] Glossary page

### Theme System
- [ ] CSS variables are applied correctly
- [ ] Colors match theme settings
- [ ] Fonts load properly

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

- `TEMPLATE_VARIANT_SPECIFICATION.md` - **Component contracts and requirements**
- `phase-7-dynamic-theming.md` - Theme system design

---

## Support

Contact Coverage Creatives if you have questions about:
- Your test client ID
- Database access issues
- Component specifications

---

## License

Private repository. All rights reserved.
