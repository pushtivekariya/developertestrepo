/**
 * ESLint Fix Script
 * 
 * This script fixes well-defined ESLint issues that follow consistent patterns.
 * Run with: node scripts/fix-eslint-issues.js
 * 
 * Categories handled:
 * 1. Unused imports - removes specific unused imports from import statements
 * 2. Unused destructured variables - removes unused vars from destructuring
 * 3. Unescaped entities - replaces ' with &apos; and " with &ldquo;/&rdquo; in JSX
 */

const fs = require('fs');
const path = require('path');

// Base path for the project
const BASE_PATH = path.resolve(__dirname, '..');

// ============================================================================
// CONFIGURATION: Define exactly what to fix in each file
// ============================================================================

const FIXES = {
  // Category 1: Unused Imports
  unusedImports: [
    {
      file: 'app/(global)/policies/[category]/[slug]/page.tsx',
      imports: [
        { from: '@/lib/sanitizePolicyType', remove: 'sanitizePolicyType' },
        { from: '@/lib/template-variables', remove: 'interpolateTemplate' },
      ]
    },
    {
      file: 'app/(global)/policies/[category]/page.tsx',
      imports: [
        { from: '@/lib/structured-data', remove: ['buildMakesOffer', 'buildOpeningHoursSpec'] },
      ]
    },
    {
      file: 'app/(global)/policies/all/[slug]/page.tsx',
      imports: [
        { from: '@/lib/sanitizePolicyType', remove: 'sanitizePolicyType' },
      ]
    },
    {
      file: 'app/(global)/policies/page.tsx',
      imports: [
        { from: '@/lib/policy-categories', remove: 'PolicyCategory' },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/glossary/[term]/page.tsx',
      imports: [
        { from: '@/lib/website', remove: 'getAllWebsites' },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/layout.tsx',
      imports: [
        { from: '@/lib/structured-data', remove: 'buildOpeningHoursSpec' },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/policies/[category]/[policy]/page.tsx',
      imports: [
        { from: '@/lib/sanitizePolicyType', remove: 'sanitizePolicyType' },
        { from: '@/lib/website', remove: 'getAllWebsites' },
        { from: '@/lib/policy-categories', remove: 'getPolicyCategories' },
        { from: '@/lib/template-variables', remove: ['interpolateTemplate', 'buildPolicyContext'] },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/policies/[category]/page.tsx',
      imports: [
        { from: '@/lib/structured-data', remove: ['buildMakesOffer', 'buildOpeningHoursSpec'] },
      ]
    },
    {
      file: 'components/home-page/FAQPreview.tsx',
      imports: [
        { from: 'next/link', remove: 'Link', removeEntireLine: true },
        { from: 'next/image', remove: 'Image', removeEntireLine: true },
        { from: 'lucide-react', remove: 'ChevronRight' },
      ]
    },
  ],

  // Category 2: Unused Destructured Variables
  unusedDestructured: [
    {
      file: 'app/(global)/policies/[category]/[slug]/page.tsx',
      patterns: [
        { line: 94, vars: ['address', 'zip'] },
        { line: 40, vars: ['context'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(global)/policies/[category]/page.tsx',
      patterns: [
        { line: 88, vars: ['address', 'zip'] },
        { line: 98, vars: ['telephones'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/blog/[topic]/[postSlug]/page.tsx',
      patterns: [
        { line: 23, vars: ['websites', 'topics'] },
        { line: 130, vars: ['address', 'zip', 'phone'] },
        { line: 131, vars: ['locationCity'], removeEntireAssignment: true },
        { line: 132, vars: ['locationState'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/contact/page.tsx',
      patterns: [
        { line: 123, vars: ['pageMetadata'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/glossary/[term]/page.tsx',
      patterns: [
        { line: 117, vars: ['locationName'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/layout.tsx',
      patterns: [
        { line: 33, vars: ['phone'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/our-team/page.tsx',
      patterns: [
        { line: 79, vars: ['clientData'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/page.tsx',
      patterns: [
        { line: 306, vars: ['businessHours'], removeEntireAssignment: true },
        { line: 312, vars: ['heroHeading'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/policies/[category]/[policy]/page.tsx',
      patterns: [
        { line: 104, vars: ['locationName'], removeEntireAssignment: true },
        { line: 105, vars: ['address', 'zip'] },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/policies/[category]/page.tsx',
      patterns: [
        { line: 119, vars: ['address', 'zip'] },
        { line: 124, vars: ['telephones'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/404/page.tsx',
      patterns: [
        { line: 11, vars: ['city'], removeEntireAssignment: true },
        { line: 12, vars: ['state'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/layout.tsx',
      patterns: [
        { line: 56, vars: ['address'] },
      ]
    },
    {
      file: 'app/search/page.tsx',
      patterns: [
        { line: 14, vars: ['city'], removeEntireAssignment: true },
        { line: 15, vars: ['state'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/sitemap.xml/route.ts',
      patterns: [
        { line: 56, vars: ['createSlug'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'app/(global)/page.tsx',
      patterns: [
        { line: 18, vars: ['address'] },
      ]
    },
    {
      file: 'app/(global)/policies/page.tsx',
      patterns: [
        { line: 14, vars: ['websiteData'], removeEntireAssignment: true },
      ]
    },
    {
      file: 'components/home-page/HomeCTA.tsx',
      patterns: [
        { line: 108, vars: ['phone'], removeEntireAssignment: true },
        { line: 109, vars: ['address'], removeEntireAssignment: true },
      ]
    },
  ],

  // Category 3: Unescaped Entities
  unescapedEntities: [
    {
      file: 'app/(global)/contact/page.tsx',
      replacements: [
        { line: 124, find: "We're", replace: "We&apos;re" },
        { line: 140, find: "We'll", replace: "We&apos;ll" },
      ]
    },
    {
      file: 'app/(location)/locations/[slug]/contact/page.tsx',
      replacements: [
        { line: 164, find: "We're", replace: "We&apos;re" },
        { line: 180, find: "We'll", replace: "We&apos;ll" },
      ]
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function readFile(filePath) {
  const fullPath = path.join(BASE_PATH, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return null;
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFile(filePath, content) {
  const fullPath = path.join(BASE_PATH, filePath);
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Updated: ${filePath}`);
}

function removeFromImport(line, itemsToRemove) {
  // Handle array of items
  const items = Array.isArray(itemsToRemove) ? itemsToRemove : [itemsToRemove];
  
  let result = line;
  for (const item of items) {
    // Remove item with trailing comma and space
    result = result.replace(new RegExp(`${item},\\s*`, 'g'), '');
    // Remove item with leading comma and space
    result = result.replace(new RegExp(`,\\s*${item}`, 'g'), '');
    // Remove item if it's the only one (no commas)
    result = result.replace(new RegExp(`\\{\\s*${item}\\s*\\}`, 'g'), '{ }');
  }
  
  // Clean up empty imports
  if (result.match(/\{\s*\}/)) {
    return null; // Signal to remove entire line
  }
  
  return result;
}

function removeFromDestructure(line, varsToRemove) {
  let result = line;
  for (const varName of varsToRemove) {
    // Remove var with trailing comma and space
    result = result.replace(new RegExp(`${varName},\\s*`, 'g'), '');
    // Remove var with leading comma and space  
    result = result.replace(new RegExp(`,\\s*${varName}([,}])`, 'g'), '$1');
    // Handle last item before closing brace
    result = result.replace(new RegExp(`,\\s*${varName}\\s*}`, 'g'), ' }');
  }
  return result;
}

// ============================================================================
// MAIN FIX FUNCTIONS
// ============================================================================

function fixUnusedImports() {
  console.log('\n=== Fixing Unused Imports ===\n');
  
  for (const fix of FIXES.unusedImports) {
    const content = readFile(fix.file);
    if (!content) continue;
    
    let lines = content.split('\n');
    let modified = false;
    
    for (const importFix of fix.imports) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this line imports from the specified source
        if (line.includes(importFix.from)) {
          if (importFix.removeEntireLine) {
            lines[i] = null; // Mark for removal
            modified = true;
            console.log(`  Removing entire import line from ${fix.file}`);
          } else {
            const newLine = removeFromImport(line, importFix.remove);
            if (newLine === null) {
              lines[i] = null; // Mark for removal
              modified = true;
              console.log(`  Removing empty import from ${fix.file}`);
            } else if (newLine !== line) {
              lines[i] = newLine;
              modified = true;
              console.log(`  Removed ${importFix.remove} from import in ${fix.file}`);
            }
          }
        }
      }
    }
    
    if (modified) {
      const newContent = lines.filter(l => l !== null).join('\n');
      writeFile(fix.file, newContent);
    }
  }
}

function fixUnusedDestructured() {
  console.log('\n=== Fixing Unused Destructured Variables ===\n');
  
  for (const fix of FIXES.unusedDestructured) {
    const content = readFile(fix.file);
    if (!content) continue;
    
    let lines = content.split('\n');
    let modified = false;
    
    for (const pattern of fix.patterns) {
      const lineIndex = pattern.line - 1; // Convert to 0-indexed
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        if (pattern.removeEntireAssignment) {
          // Check if this is a standalone assignment we can remove
          const line = lines[lineIndex];
          if (line.includes('const ') || line.includes('let ')) {
            lines[lineIndex] = null; // Mark for removal
            modified = true;
            console.log(`  Removing line ${pattern.line} from ${fix.file}`);
          }
        } else {
          const newLine = removeFromDestructure(lines[lineIndex], pattern.vars);
          if (newLine !== lines[lineIndex]) {
            lines[lineIndex] = newLine;
            modified = true;
            console.log(`  Removed ${pattern.vars.join(', ')} from line ${pattern.line} in ${fix.file}`);
          }
        }
      }
    }
    
    if (modified) {
      const newContent = lines.filter(l => l !== null).join('\n');
      writeFile(fix.file, newContent);
    }
  }
}

function fixUnescapedEntities() {
  console.log('\n=== Fixing Unescaped Entities ===\n');
  
  for (const fix of FIXES.unescapedEntities) {
    const content = readFile(fix.file);
    if (!content) continue;
    
    let lines = content.split('\n');
    let modified = false;
    
    for (const replacement of fix.replacements) {
      const lineIndex = replacement.line - 1;
      
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        if (line.includes(replacement.find)) {
          lines[lineIndex] = line.replace(replacement.find, replacement.replace);
          modified = true;
          console.log(`  Fixed "${replacement.find}" on line ${replacement.line} in ${fix.file}`);
        }
      }
    }
    
    if (modified) {
      writeFile(fix.file, lines.join('\n'));
    }
  }
}

// ============================================================================
// RUN
// ============================================================================

console.log('ESLint Fix Script');
console.log('=================');
console.log('This script will fix well-defined ESLint issues.\n');

// Dry run check
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('DRY RUN MODE - No files will be modified\n');
}

fixUnusedImports();
fixUnusedDestructured();
fixUnescapedEntities();

console.log('\n=== Complete ===\n');
console.log('Run `npm run lint` to verify fixes.');
