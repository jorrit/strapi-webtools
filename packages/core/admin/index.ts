/* eslint-disable @typescript-eslint/no-unsafe-call */

import { StrapiApp } from '@strapi/admin/strapi-admin';
import * as yup from 'yup';
import pluginPkg from '../package.json';
import EditView from './components/EditView';
import pluginId from './helpers/pluginId';
import getTrad from './helpers/getTrad';
import { prefixPluginTranslations } from './helpers/prefixPluginTranslations';
import CheckboxConfirmation from './components/ContentManagerHooks/ConfirmationCheckbox';

import { PluginIcon } from './components/PluginIcon';

const { name } = pluginPkg.strapi;

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: pluginId,
      isReady: true,
      name,
      injectionZones: {
        webtoolsRouter: {
          route: [],
        },
      },
    });

    app.addMenuLink({
      to: '/plugins/webtools',
      icon: PluginIcon,
      position: 4,
      intlLabel: {
        id: `${pluginId}.settings.title`,
        defaultMessage: 'Webtools',
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "webtools-list" */ './containers/App'
        );

        return component;
      },
      permissions: [], // permissions to apply to the link
    });
  },
  bootstrap(app: StrapiApp) {
    app.getPlugin('content-manager')?.injectComponent('editView', 'right-links', {
      name: 'url-alias-edit-view',
      Component: EditView,
    });

    const ctbPlugin = app.getPlugin('content-type-builder');

    if (ctbPlugin) {
      const ctbFormsAPI = ctbPlugin.apis.forms;
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ctbFormsAPI.components.add({ id: 'webtools.checkboxConfirmation', component: CheckboxConfirmation });

      // @ts-expect-error
      ctbFormsAPI.extendContentType({
        validator: () => ({
          webtools: yup.object().shape({
            enabled: yup.bool().default(true),
          }),
        }),
        form: {
          advanced() {
            return [
              {
                name: 'pluginOptions.webtools.enabled',
                description: {
                  id: getTrad('webtools.enabled.description-content-type'),
                  defaultMessage: 'Webtools - entries of this type are considered web pages.',
                },
                type: 'webtools.checkboxConfirmation',
                intlLabel: {
                  id: getTrad('webtools.enabled.label-content-type'),
                  defaultMessage: 'Webtools',
                },
              },
            ];
          },
        },
      });
    }
  },
  async registerTrads(app: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { locales } = app;

    const importedTranslations = await Promise.all(
      (locales as string[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );

    return importedTranslations;
  },
};
