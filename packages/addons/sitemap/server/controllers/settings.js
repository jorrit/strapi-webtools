'use strict';

import { getPluginService } from '../utils/getPluginService';

/**
 * Sitemap.js controller
 *
 * @description: A set of functions called "actions" of the `sitemap` plugin.
 */

export default {
  getSettings: async (ctx) => {
    const config = await getPluginService('settings').getConfig();

    ctx.send(config);
  },

  updateSettings: async (ctx) => {
    const config = await getPluginService('settings').getConfig();
    const newContentTypes = Object.keys(ctx.request.body.contentTypes).filter((x) => !Object.keys(config.contentTypes).includes(x));

    await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'sitemap',
      })
      .set({ key: 'settings', value: ctx.request.body });

    // Load lifecycle methods for auto generation of sitemap.
    await newContentTypes.map(async (contentType) => {
      await getPluginService('lifecycle').loadLifecycleMethod(contentType);
    });

    ctx.send({ ok: true });
  },
};
