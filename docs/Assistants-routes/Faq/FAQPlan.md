# FAQ Page Implementation Plan (REVISED)

## Overview

The FAQ page is a **dynamic aggregator** that renders FAQs from individual policy pages. **No separate AI generation is needed** for the FAQ page itself.

**Key Insight:** FAQs are already generated as part of each policy page by the policy page assistant. The FAQ page simply aggregates and displays these existing FAQs grouped by policy type/category.

---

## Architecture

### Why This Approach?

1. **No Duplication** - FAQs are generated once (with policy pages), not twice
2. **Always Current** - FAQ page automatically reflects the client's current policy offerings
3. **Dynamic** - When policies are added/removed/published/unpublished, FAQ page updates automatically
4. **Scalable** - Currently 42 policies, can grow indefinitely
5. **Client Control** - Clients choose which policies to show via policy selection dashboard

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     POLICY PAGE GENERATION                       │
├─────────────────────────────────────────────────────────────────┤
│ Policy Page Assistant generates content including FAQs           │
│ FAQs stored in: client_policy_pages.faqs (JSONB)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FAQ PAGE (RENDERER)                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Query client_policy_pages WHERE published = true              │
│ 2. Group results by policy_type (category)                       │
│ 3. Extract faqs from each policy page                            │
│ 4. Render categories with their associated FAQs                  │
│ 5. Build LD-JSON schema from aggregated FAQs                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Database Structure

### Source Table: `client_policy_pages`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `client_id` | uuid | FK to clients |
| `location_id` | uuid | FK to client_locations |
| `title` | text | Policy page title |
| `slug` | text | URL slug |
| `policy_type` | text | Category slug (e.g., "personal-insurance") |
| `published` | boolean | Whether page is visible |
| `faqs` | jsonb | **FAQs for this policy** |
| `meta_title` | text | SEO title |
| `meta_description` | text | SEO description |
| ... | ... | Other fields |

### FAQ Structure in `client_policy_pages.faqs`

```json
[
  {
    "question": "How much does auto insurance cost in Houston?",
    "answer": "Auto insurance costs in Houston vary based on factors like your driving record, vehicle type, and coverage levels. Contact The O'Donohoe Agency for a personalized quote."
  },
  {
    "question": "What auto insurance coverage is required in Texas?",
    "answer": "Texas requires minimum liability coverage of 30/60/25. However, we typically recommend higher limits to better protect your assets."
  }
]
```

---

## FAQ Page Data Fetching

### Query Strategy

**Important:** Both single-location and multi-location clients filter by `location_id`. The difference is the route, not the query logic.

- **Single-location** (`/faq`): Uses `primaryLocation.id`
- **Multi-location** (`/locations/[slug]/faq`): Uses location ID from slug

```typescript
// lib/faq.ts

export async function getAggregatedFAQs(clientId: string, locationId: string) {
  // locationId is ALWAYS provided (primary location for single, specific for multi)
  const { data: policyPages, error } = await supabase
    .from('client_policy_pages')
    .select('title, slug, policy_type, faqs')
    .eq('client_id', clientId)
    .eq('location_id', locationId)  // Always filter by location
    .eq('published', true)
    .not('faqs', 'is', null);

  if (error || !policyPages) return [];

  // Group by policy_type (category)
  const grouped = policyPages.reduce((acc, page) => {
    const category = page.policy_type || 'general';
    
    if (!acc[category]) {
      acc[category] = {
        id: category,
        name: formatCategoryName(category), // Convert slug to display name
        policies: [],
        faqs: []
      };
    }
    
    acc[category].policies.push({
      title: page.title,
      slug: page.slug
    });
    
    // Add FAQs from this policy to the category
    if (page.faqs && Array.isArray(page.faqs)) {
      acc[category].faqs.push(...page.faqs);
    }
    
    return acc;
  }, {} as Record<string, FAQCategory>);

  return Object.values(grouped);
}

function formatCategoryName(slug: string): string {
  // Convert "personal-insurance" to "Personal Insurance"
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

### Expected Output Structure

```typescript
interface FAQCategory {
  id: string;           // e.g., "personal-insurance"
  name: string;         // e.g., "Personal Insurance"
  policies: Array<{     // Policies in this category
    title: string;
    slug: string;
  }>;
  faqs: Array<{         // Aggregated FAQs from all policies in category
    question: string;
    answer: string;
  }>;
}
```

---

## Frontend Implementation

### Global FAQ Page (Single-Location)

```typescript
// app/(global)/faq/page.tsx

import { getAggregatedFAQs } from '@/lib/faq';
import { getClientData } from '@/lib/client';
import { getClientPrimaryLocation } from '@/lib/utils';

export default async function FAQPage() {
  const clientData = await getClientData();
  const primaryLocation = await getClientPrimaryLocation();
  
  if (!primaryLocation?.id) {
    return <div>No location configured</div>;
  }
  
  // Fetch aggregated FAQs from policy pages for PRIMARY location
  const faqCategories = await getAggregatedFAQs(
    clientData.id,
    primaryLocation.id  // Always pass location_id
  );

  const ldJson = generateLdJsonSchema(faqCategories, clientData, primaryLocation);

  return (
    <main>
      <FAQHeroSection />
      <FAQCategoryNavigation items={faqCategories} />
      {faqCategories.map((category) => (
        <FAQCategorySection key={category.id} category={category} />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
    </main>
  );
}
```

### Location FAQ Page (Multi-Location)

```typescript
// app/(location)/locations/[slug]/faq/page.tsx

import { getAggregatedFAQs } from '@/lib/faq';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation } from '@/lib/website';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LocationFAQPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Only render for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return notFound();
  
  const websiteData = await getWebsiteBySlug(slug);
  if (!websiteData) return notFound();
  
  const clientData = await getClientData();
  const locationId = websiteData.location_id;
  
  // Fetch aggregated FAQs from policy pages for THIS location
  const faqCategories = await getAggregatedFAQs(
    clientData.id,
    locationId  // Specific location from slug
  );

  const ldJson = generateLdJsonSchema(faqCategories, clientData, websiteData.client_locations);

  return (
    <main>
      <FAQHeroSection location={websiteData.client_locations} />
      <FAQCategoryNavigation items={faqCategories} />
      {faqCategories.map((category) => (
        <FAQCategorySection key={category.id} category={category} />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
    </main>
  );
}
```

---

## LD-JSON Generation

The FAQ page generates LD-JSON schema by flattening all FAQs from all categories:

```typescript
function generateLdJsonSchema(
  faqCategories: FAQCategory[],
  clientData: any,
  locationData: any
) {
  const agencyName = clientData?.agency_name || '';
  const city = locationData?.city || '';
  const state = locationData?.state || '';

  // Build name with 60 char limit
  const fullName = `FAQ | ${agencyName}`;
  const name = fullName.length > 60 ? fullName.substring(0, 57) + '...' : fullName;

  // Build description with 155 char limit
  const fullDesc = `Answers to common insurance questions for ${city}, ${state} residents. Learn about coverage, claims, and services.`;
  const description = fullDesc.length > 155 ? fullDesc.substring(0, 152) + '...' : fullDesc;

  // Flatten all FAQs from all categories
  const allFaqs = faqCategories.flatMap(category => category.faqs);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name,
    description,
    url: '/faq',
    mainEntity: allFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}
```

---

## Policy Page Assistant - FAQ Generation

The policy page assistant already generates FAQs. Here's what it produces:

### Input to Policy Page Assistant

```typescript
{
  // ... other policy data
  faq: [  // Pre-defined FAQs from client_policy_pages_list
    {
      question: "What does auto insurance cover?",
      answer: "Auto insurance typically covers..."
    }
  ]
}
```

### Output from Policy Page Assistant

```typescript
{
  // ... other content
  faqs: [
    // Uses ALL provided FAQs exactly as written
    {
      "question": "What does auto insurance cover?",
      "answer": "Auto insurance typically covers liability, collision, comprehensive..."
    },
    // Plus 3-5 ADDITIONAL conversational FAQs generated by AI
    {
      "question": "How much does auto insurance cost in Houston?",
      "answer": "Auto insurance costs in Houston vary based on..."
    },
    {
      "question": "Do I need full coverage auto insurance in Texas?",
      "answer": "While Texas only requires minimum liability coverage..."
    }
  ]
}
```

### FAQ Optimization in Policy Page Assistant

From `policy-page-assistant-simplified.md`:

> **Use ALL Provided FAQs** from input exactly as written
>
> **Generate Additional Conversational FAQs** (3-5 more):
> - **Cost Questions**: "How much does {policy_type} cost in {location_city}?"
> - **Process Questions**: "How do I get {policy_type} in {location_city}?"
> - **Comparison Questions**: "What's the difference between {service} and another coverage?"
> - **Local Questions**: "Do I need {policy_type} in {location_state}?"
> - **Specific Scenarios**: "What if [common situation relevant to {policy_type}]?"

---

## What This Replaces

### ❌ NOT Needed (Old Approach)

- ~~`client_faq_page` table~~ (may be deprecated or used for hero section only)
- ~~`generate_faq_pages` trigger column~~
- ~~FAQ generation edge function~~
- ~~FAQ OpenAI Assistant~~
- ~~Separate FAQ content generation~~

### ✅ Already Exists (Current Approach)

- `client_policy_pages.faqs` column - FAQs stored per policy
- Policy page assistant generates FAQs
- FAQ page aggregates from existing data

---

## Multi-Location Handling

**Both use `location_id` filtering - the difference is the ROUTE, not the query.**

### Single-Location Client
- FAQ page at `/faq` (global route)
- Calls `getAggregatedFAQs(clientId, primaryLocation.id)`
- Aggregates from `client_policy_pages` WHERE `location_id` = primary location

### Multi-Location Client
- FAQ page at `/locations/[slug]/faq` (location route)
- Calls `getAggregatedFAQs(clientId, locationIdFromSlug)`
- Aggregates from `client_policy_pages` WHERE `location_id` = that specific location
- Each location shows FAQs only from policies published for that location

### Route Determination
The template uses `isMultiLocation()` check:
- If **single-location**: Global route `/faq` is active, location routes return 404
- If **multi-location**: Location routes `/locations/[slug]/faq` are active

---

## Dynamic Categories

Categories on the FAQ page are **automatically determined** by the `policy_type` values in published policy pages:

| If Client Has Published | FAQ Page Shows Category |
|------------------------|------------------------|
| Auto Insurance, Home Insurance, Life Insurance | "Personal Insurance" |
| General Liability, Workers Comp | "Business Insurance" |
| Boat Insurance, RV Insurance | "Specialty Insurance" |

**No predefined category list** - categories emerge from actual policy offerings.

---

## Implementation Checklist

### Frontend Changes Required

- [x] Create `lib/faq.ts` with `getAggregatedFAQs()` function
- [x] Update `app/(global)/faq/page.tsx` to use aggregated FAQs
- [x] Update `app/(location)/locations/[slug]/faq/page.tsx` for multi-location
- [x] FAQ components already handle the data structure (FAQSearch, FAQItems, FAQCategoryNavigation)
- [x] Category navigation already exists (FAQCategoryNavigation component)

### No Backend Changes Required

- [x] `client_policy_pages.faqs` column already exists
- [x] Policy page assistant already generates FAQs
- [x] No new tables, triggers, or edge functions needed

---

## Policy Visibility & FAQ Removal

### How It Works

The FAQ page query filters by `client_policy_pages.published = true`:

```typescript
.eq('published', true)  // Only published policies
```

**Automatic FAQ removal:**
- When a policy's `published` status is set to `false`, its FAQs automatically disappear from the FAQ page
- No manual sync required - next page load reflects current state

### Column Clarification

**Note:** There are two different columns that can be confusing:

| Table | Column | Purpose |
|-------|--------|---------|
| `client_policy_selections` | `is_generated` | Tracks if AI content has been generated (badly named) |
| `client_policy_pages` | `published` | **Controls website visibility** ← Use this |

The FAQ aggregation uses `client_policy_pages.published` which is the correct field for visibility control.

### Visibility States

| State | `published` | Policy Page | FAQ Page |
|-------|-------------|-------------|----------|
| Not generated | N/A (no row) | Not shown | Not shown |
| Generated & published | `true` | Shown | FAQs shown |
| Generated & unpublished | `false` | Hidden | FAQs hidden |

### Client Control

Clients can toggle `client_policy_pages.published` via checkbox to show/hide policies. When unpublished:
1. Policy page is hidden from website
2. FAQs from that policy automatically removed from FAQ page (via query filter)

---

## Benefits of This Approach

1. **Single Source of Truth** - FAQs live with their policy pages
2. **No Sync Issues** - FAQ page always reflects current published policies
3. **Client Control** - Publishing/unpublishing policies automatically updates FAQ page
4. **SEO Optimized** - Each policy page has relevant FAQs for that topic
5. **Scalable** - Add new policies = automatic new FAQs on FAQ page
6. **Maintainable** - No separate FAQ generation to manage
7. **Automatic Cleanup** - Unpublishing a policy removes its FAQs from FAQ page

---

## Notes

1. **Hero Section** - The FAQ page hero (heading, subheading) can be hardcoded or stored in a simple config, not generated by AI.

2. **Template Variables** - FAQs from policy pages already use template variables (`{agency_name}`, `{city}`, etc.) which are interpolated at render time.

3. **Empty State** - If no published policies exist, FAQ page should show a friendly message and CTA to contact the agency.

4. **`client_faq_page` Table** - This table may be deprecated or repurposed for storing just the hero section content if custom hero text is needed per location.
