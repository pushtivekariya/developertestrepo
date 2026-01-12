# O'Donohoe Data Migrations

This folder contains SQL migration scripts specifically for populating O'Donohoe Agency data into the enhanced schema.

> ⚠️ **These migrations are NOT part of the template.** They are applied separately after the template schema migrations are complete.

## Purpose

The template repository contains schema migrations (in `supabase/migrations/`) that add new columns and structure. This folder contains **data population** scripts for O'Donohoe's production site.

## Migration Files (To Be Created)

| File | Purpose | Phase |
|------|---------|-------|
| `001_odonohoe_location_data.sql` | Populate latitude, longitude, phone, email, SMS | Phase 1 |
| `002_odonohoe_business_hours.sql` | Populate business_hours JSONB | Phase 1 |
| `003_odonohoe_social_links.sql` | Populate social_links JSONB | Phase 1 |
| `004_odonohoe_service_areas.sql` | Populate service_areas JSONB | Phase 1 |
| `005_odonohoe_analytics_ids.sql` | Populate GTM, GA, Google Ads, CallRail IDs | Phase 2 |
| `006_odonohoe_features.sql` | Populate features JSONB flags | Phase 2 |
| `007_odonohoe_faqs.sql` | Populate FAQs JSONB | Phase 2 |
| `008_odonohoe_badges.sql` | Populate badges JSONB | Phase 2 |
| `009_odonohoe_tagline.sql` | Populate tagline | Phase 2 |

## Data to Migrate

### From Hardcoded Values in Codebase

```
GTM ID:              GTM-53H4RV29
GA ID:               G-S7459R6TPN
Google Ads ID:       AW-17017942150
CallRail Company ID: 236834426
Latitude:            29.2733
Longitude:           -94.7977
SMS Phone:           4093650065
```

### Social Links

```
Facebook:  https://www.facebook.com/theodonohoeagency
Instagram: https://www.instagram.com/odonohoeagency/
LinkedIn:  https://www.linkedin.com/company/the-odonohoe-agency
YouTube:   https://youtube.com/@theodonohoeagencygalveston?si=5kHTLQ9ao-p-aVc7
```

### Tagline

```
Your local insurance partner providing peace of mind on island time since 1967.
```

### Service Areas

```
Galveston, Texas City, League City, Dickinson, La Marque, Santa Fe, Friendswood, Clear Lake
```

### Badges

```json
[
  { "name": "Trusted Choice", "icon_class": "trusted-choice" },
  { "name": "Independent Agent", "icon_class": "independent-agent" },
  { "name": "TWIA Partner", "icon_class": "twia-partner" }
]
```

### Business Hours

```
Monday-Friday: 8:00 AM - 5:00 PM
Saturday-Sunday: Closed
```

## Execution Order

1. Run template schema migrations first (`supabase/migrations/`)
2. Verify schema changes applied successfully
3. Run O'Donohoe data migrations in order
4. Verify data populated correctly
5. Test production site functionality

## O'Donohoe Identifiers

```
Client ID:   54479ee2-bc32-423e-865b-210572e8a0b0
Website ID:  450504ff-ca72-48c1-a181-0b1e0c6c37b6
Location ID: 27941345-981b-4325-b239-a3204c76dd86
```
