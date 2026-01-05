import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Wallet API',
      description: 'Cryptocurrency payment processing API documentation',
      logo: {
        src: './src/assets/logo.svg',
      },
      customCss: ['./src/styles/custom.css'],
      social: {
        github: 'https://github.com/your-org/wallet-api',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'English',
          lang: 'en',
        },
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', slug: '' },
            { label: 'Authentication', slug: 'authentication' },
            { label: 'Supported Chains', slug: 'chains' },
          ],
        },
        {
          label: 'Wallets',
          items: [
            { label: 'Overview', slug: 'wallets' },
            { label: 'Create Wallet', slug: 'wallets/create' },
            { label: 'List Wallets', slug: 'wallets/list' },
            { label: 'Get Wallet', slug: 'wallets/get' },
          ],
        },
        {
          label: 'Addresses',
          items: [
            { label: 'Overview', slug: 'addresses' },
            { label: 'Create Address', slug: 'addresses/create' },
            { label: 'Get Address', slug: 'addresses/get' },
            { label: 'List Addresses', slug: 'addresses/list' },
          ],
        },
        {
          label: 'Payments',
          items: [
            { label: 'Overview', slug: 'payments' },
            { label: 'List Payments', slug: 'payments/list' },
            { label: 'Get Payment', slug: 'payments/get' },
          ],
        },
        {
          label: 'Webhooks',
          items: [
            { label: 'Setup', slug: 'webhooks' },
            { label: 'Events', slug: 'webhooks/events' },
            { label: 'Verification', slug: 'webhooks/verification' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Security', slug: 'security' },
            { label: 'Error Codes', slug: 'errors' },
            { label: 'Rate Limits', slug: 'rate-limits' },
            { label: 'SDKs', slug: 'sdks' },
          ],
        },
      ],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'robots',
            content: 'noindex, nofollow',
          },
        },
      ],
      components: {},
      editLink: {
        baseUrl: 'https://github.com/your-org/wallet-api-docs/edit/main/',
      },
    }),
  ],
});
