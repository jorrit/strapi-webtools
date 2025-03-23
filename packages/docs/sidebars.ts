/**
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  webtoolsSidebar: [
    {
      type: "category",
      collapsed: false,
      label: "🚀 Getting Started",
      items: [
        "getting-started/installation",
        "getting-started/usage",
        "getting-started/url-alias",
        "getting-started/url-pattern",
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "📦 API",
      items: [
        "api/rest",
        "api/graphql",
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "🔌 Addons",
      items: [
        "addons/introduction",
        {
          type: "link",
          label: "Sitemap addon",
          href: '/addons/sitemap',
        },
      ],
    },
    {
      type: "category",
      collapsed: false,
      label: "⚙️ Configuration",
      items: [
        "configuration/introduction",
        "configuration/default-pattern",
        "configuration/website-url",
        "configuration/slugify",
      ],
    },
    // {
    //   type: "category",
    //   collapsed: false,
    //   label: "♻️ Upgrading",
    //   items: [
    //     "upgrading/generic-update",
    //   ],
    // },
  ],

  webtoolsSitemapSidebar: [
    {
      type: "link",
      label: "⬅️ Back to Webtools Core docs",
      href: "/addons",
    },
    {
      type: "category",
      collapsed: false,
      label: "🔌 Sitemap addon",
      items: [
        {
          type: "category",
          collapsed: false,
          label: "🚀 Getting Started",
          items: [
            "addons/sitemap/getting-started/introduction",
            "addons/sitemap/getting-started/installation",
            "addons/sitemap/getting-started/usage",
            "addons/sitemap/getting-started/multilingual",
            "addons/sitemap/getting-started/sitemap-index",
            "addons/sitemap/getting-started/robots-txt",
            "addons/sitemap/getting-started/cli",
          ],
        },
        {
          type: "category",
          collapsed: false,
          label: "⚙️ Settings",
          items: [
            "addons/sitemap/settings/introduction",
            "addons/sitemap/settings/hostname",
            "addons/sitemap/settings/hostname-overrides",
            "addons/sitemap/settings/exclude-drafts",
            "addons/sitemap/settings/include-homepage",
            "addons/sitemap/settings/default-language-url-type",
          ],
        },
        {
          type: "category",
          collapsed: false,
          label: "🔧 Configuration",
          items: [
            "addons/sitemap/configuration/introduction",
            "addons/sitemap/configuration/cron",
            "addons/sitemap/configuration/limit",
            "addons/sitemap/configuration/xsl",
            "addons/sitemap/configuration/auto-generate",
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
