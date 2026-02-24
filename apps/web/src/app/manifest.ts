import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Life Prep Academy DMV',
    short_name: 'LPA DMV',
    description: 'Leadership-first athletic training in the DMV.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/lpadmvLogo.PNG',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
