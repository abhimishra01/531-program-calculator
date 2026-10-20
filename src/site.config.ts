// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
const config = {
  name: '5/3/1 Program Calculator',                 // shown in header, title, footer
  domain: '531programcalculator.com',             // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: '531-program-calculator',      // Cloudflare Pages project name (used by npm run deploy)
  keyword: '5/3/1 calculator',        // main keyword (search phrase)
  h1: '5/3/1 program calculator',     // visible page heading
  title: '5/3/1 Calculator: 4-Week Weights and Plates', // home page title, under 60 chars
  tagline: 'Free and fast',
  description:
    'Enter your lifts and get the full 4-week 5/3/1 cycle: sets, reps, weights rounded to your plates, BBB, FSL, SSL, jokers, deload and a print sheet.',
  email: 'hello@531programcalculator.com',        // contact email (shown on Contact and Privacy pages)
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#0369a1',                   // brand color (hex)
  skin: 'retro',                      // visual skin: minimal, swiss, clay or retro
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: '/og.png',
  category: 'HealthApplication',   // schema.org applicationCategory
  owner: '5/3/1 Program Calculator',                // name used in legal pages (person or business)
};

// Bingemind build (SITE_MODE=bingemind): the tool lives at https://bingemind.com/<slug>/.
// Canonical URLs point there in every build, including the GitHub Pages preview.
const bingemind = typeof process !== 'undefined' && process.env.SITE_MODE === 'bingemind';
const slug = config.cloudflareProject;
export default {
  ...config,
  bingemind,
  slug,
  canonicalBase: `https://bingemind.com/${slug}`,
  host: bingemind ? `bingemind.com/${slug}/` : config.domain,
  owner: bingemind ? 'Bingemind' : config.owner,
  // No invented mailbox: Bingemind builds link to the Bingemind contact section.
  contactHref: bingemind ? 'https://bingemind.com/#contact' : `mailto:${config.email}`,
  contactLabel: bingemind ? 'bingemind.com/#contact' : config.email,
};
