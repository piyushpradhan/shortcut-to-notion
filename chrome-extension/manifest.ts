import { readFileSync } from 'node:fs';
import type { ManifestType } from '@extension/shared';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

/**
 * Professional Shortcut to Notion Extension Manifest
 *
 * This extension seamlessly syncs Shortcut (formerly Clubhouse) stories
 * to Notion databases with a beautiful, intuitive interface.
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  name: 'Shortcut to Notion',
  short_name: 'S2N',
  browser_specific_settings: {
    gecko: {
      id: 'shortcut-to-notion@example.com',
      strict_min_version: '109.0',
    },
  },
  version: packageJson.version,
  description:
    'Sync your Shortcut stories to Notion databases seamlessly with automatic data extraction and smart duplicate detection.',
  homepage_url: 'https://github.com/piyushpradhan/shortcut-to-notion',
  host_permissions: ['<all_urls>'],
  permissions: ['storage', 'scripting', 'tabs'],
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_popup: 'popup/index.html',
    default_icon: {
      '16': 'icon-16.png',
      '32': 'icon-32.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png',
    },
    default_title: 'Shortcut to Notion - Sync your stories',
  },
  icons: {
    '16': 'icon-16.png',
    '32': 'icon-32.png',
    '48': 'icon-48.png',
    '128': 'icon-128.png',
  },
  commands: {
    'open-popup': {
      suggested_key: {
        default: 'Ctrl+Shift+M',
        mac: 'Command+Shift+S',
      },
      description: 'Upsert Shortcut stories to your Notion database',
    },
  },
  web_accessible_resources: [
    {
      resources: ['*.js', '*.css', '*.svg', 'icon-*.png'],
      matches: ['*://*/*'],
    },
  ],
} satisfies ManifestType;

export default manifest;
