/**
 * Variant Resolver System
 * 
 * Dynamically loads the correct component variant based on the client's
 * template_variant setting in client_theme_settings.
 * 
 * Usage:
 * ```tsx
 * import { getVariantComponent } from '@/lib/variants';
 * 
 * const Header = await getVariantComponent('Header');
 * return <Header {...props} />;
 * ```
 */

import { cache } from 'react';
import { supabase } from '@/lib/supabase';

// Valid variant names - must match database constraint
export type VariantName = 'coastal' | 'modern' | 'minimal' | 'bold' | 'classic';

// Component names that have variant implementations
export type VariantComponentName = 
  | 'Header'
  | 'Footer'
  | 'HeroSection'
  | 'IntroSection'
  | 'LocationPoliciesSection'
  | 'Testimonials'
  | 'HomeCTA'
  | 'FAQPreview'
  | 'CareersSection'
  | 'PolicyPageTemplate';

// Default variant (current template style)
export const DEFAULT_VARIANT: VariantName = 'coastal';

/**
 * Get the current client's template variant from database
 * Cached per request to avoid multiple database calls
 */
export const getTemplateVariant = cache(async (): Promise<VariantName> => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  
  if (!clientId) {
    console.warn('[Variants] No NEXT_PUBLIC_CLIENT_ID set, using default variant');
    return DEFAULT_VARIANT;
  }

  try {
    const { data, error } = await supabase
      .from('client_theme_settings')
      .select('template_variant')
      .eq('client_id', clientId)
      .single();

    if (error || !data?.template_variant) {
      return DEFAULT_VARIANT;
    }

    return data.template_variant as VariantName;
  } catch (err) {
    console.error('[Variants] Error fetching template variant:', err);
    return DEFAULT_VARIANT;
  }
});

/**
 * Dynamically import a variant component
 * Falls back to 'coastal' (default) if the variant doesn't have the component
 */
export async function getVariantComponent<T = React.ComponentType<any>>(
  componentName: VariantComponentName
): Promise<T> {
  const variant = await getTemplateVariant();
  
  try {
    // Try to import the component from the active variant
    const module = await importVariantModule(variant, componentName);
    return module.default as T;
  } catch (err) {
    // Fall back to default variant if component not found
    if (variant !== DEFAULT_VARIANT) {
      console.warn(
        `[Variants] Component "${componentName}" not found in variant "${variant}", falling back to "${DEFAULT_VARIANT}"`
      );
      try {
        const fallbackModule = await importVariantModule(DEFAULT_VARIANT, componentName);
        return fallbackModule.default as T;
      } catch (fallbackErr) {
        throw new Error(
          `[Variants] Component "${componentName}" not found in variant "${variant}" or fallback "${DEFAULT_VARIANT}"`
        );
      }
    }
    throw err;
  }
}

/**
 * Import a specific component from a variant
 * Uses dynamic imports for code splitting
 */
async function importVariantModule(
  variant: VariantName,
  componentName: VariantComponentName
): Promise<{ default: React.ComponentType<any> }> {
  // Map component names to their file paths within the variant folder
  const componentPaths: Record<VariantComponentName, string> = {
    Header: 'layout/Header',
    Footer: 'layout/Footer',
    HeroSection: 'home/HeroSection',
    IntroSection: 'home/IntroSection',
    LocationPoliciesSection: 'home/LocationPoliciesSection',
    Testimonials: 'home/Testimonials',
    HomeCTA: 'home/HomeCTA',
    FAQPreview: 'home/FAQPreview',
    CareersSection: 'home/CareersSection',
    PolicyPageTemplate: 'policies/PolicyPageTemplate',
  };

  const path = componentPaths[componentName];
  
  // Dynamic import based on variant and component path
  // Note: These imports must be statically analyzable for Next.js bundling
  switch (variant) {
    case 'coastal':
      return import(`@/components/variants/coastal/${path}`);
    case 'modern':
      return import(`@/components/variants/modern/${path}`);
    case 'minimal':
      return import(`@/components/variants/minimal/${path}`);
    case 'bold':
      return import(`@/components/variants/bold/${path}`);
    case 'classic':
      return import(`@/components/variants/classic/${path}`);
    default:
      throw new Error(`Unknown variant: ${variant}`);
  }
}

/**
 * Check if a variant exists and has all required components
 * Useful for validation during development
 */
export async function validateVariant(variant: VariantName): Promise<{
  valid: boolean;
  missing: VariantComponentName[];
}> {
  const requiredComponents: VariantComponentName[] = [
    'Header',
    'Footer',
    'HeroSection',
    'IntroSection',
    'LocationPoliciesSection',
    'Testimonials',
    'HomeCTA',
    'FAQPreview',
    'CareersSection',
    'PolicyPageTemplate',
  ];

  const missing: VariantComponentName[] = [];

  for (const component of requiredComponents) {
    try {
      await importVariantModule(variant, component);
    } catch {
      missing.push(component);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
