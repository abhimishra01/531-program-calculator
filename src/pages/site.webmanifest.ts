import type { APIRoute } from 'astro';
import site from '../site.config.ts';
import { url } from '../lib/url.ts';

export const GET: APIRoute = () =>
  new Response(JSON.stringify({
    name: site.name,
    short_name: '5/3/1 Calc',
    description: 'The 4-week 5/3/1 cycle with weights rounded to your plates.',
    start_url: url(),
    scope: url(),
    display: 'standalone',
    background_color: '#f7f6f2',
    theme_color: site.brand,
    icons: [
      { src: url('icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: url('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }), { headers: { 'Content-Type': 'application/manifest+json' } });
