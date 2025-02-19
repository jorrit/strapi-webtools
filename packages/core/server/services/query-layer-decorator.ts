// import { Attribute, Common } from '@strapi/types';
// import { ID } from '@strapi/types/dist/types/core/entity';
// import { IDecoratedService, IDecoratedServiceOptions } from '../../types/strapi';
// import { isContentTypeEnabled } from '../../util/enabledContentTypes';
// import { getPluginService } from '../../util/getPluginService';

// /**
//  * Decorates the entity service with WT business logic
//  * @param {object} service - entity service
//  */
// const decorator = (service: IDecoratedService) => ({
//   async create(uid: Common.UID.ContentType, opts: IDecoratedServiceOptions<{ url_alias: number }>) {
//     const hasWT = isContentTypeEnabled(uid);
//     let urlAliasEntity: Attribute.GetValues<'plugin::webtools.url-alias', Attribute.GetNonPopulatableKeys<'plugin::webtools.url-alias'>>;

//     // If Webtools isn't enabled, do nothing.
//     if (!hasWT) {
//       return service.create.call(this, uid, opts);
//     }

//     // Fetch the URL pattern for this content type.
//     let relations: string[] = [];
//     let languages: string[] = [undefined];

//     if (strapi.plugin('i18n')) {
//       languages = [];
//       const locales = await strapi.entityService.findMany('plugin::i18n.locale', {});
//       languages = locales.map((locale) => locale.code);
//     }

//     await Promise.all(languages.map(async (lang) => {
//       const urlPattern = await getPluginService('url-pattern').findByUid(uid, lang);
//       const languageRelations = getPluginService('url-pattern').getRelationsFromPattern(urlPattern);

//       relations = [...relations, ...languageRelations];
//     }));

//     // If a URL alias was created, fetch it.
//     if (opts.data.url_alias) {
//       urlAliasEntity = await getPluginService('url-alias').findOne(opts.data.url_alias);
//     }

//     // If a URL alias was created and 'generated' is set to false, do nothing.
//     if (urlAliasEntity?.generated === false) {
//       return service.create.call(this, uid, opts);
//     }

//     // Ideally here we would create the URL alias an directly fire
//     // the `service.create.call` function with the new URL alias id.
//     // Though it is possible that the `id` field is used in the URL.
//     // In that case we have to create the entity first. Then when we know
//     // the id, can we create the URL alias entity and can we update
//     // the previously created entity.
//     const newEntity = await service.create.call(this, uid, {
//       ...opts,
//       data: opts.data,
//       populate: {
//         ...opts.populate,
//         ...relations.reduce((obj, key) => ({ ...obj, [key]: {} }), {}),
//         localizations: {
//           populate: {
//             url_alias: {
//               fields: ['id'],
//             },
//           },
//         },
//       },
//     });

//     // Fetch the URL alias localizations.
//     const urlAliasLocalizations = newEntity.localizations
//       ?.map((loc) => loc.url_alias.id)
//       ?.filter((loc) => loc) || [];

//     const newEntityWithoutLocalizations = {
//       ...newEntity,
//       localizations: undefined,
//     };

//     const combinedEntity = { ...newEntityWithoutLocalizations };
//     const urlPatterns = await getPluginService('url-pattern').findByUid(uid, combinedEntity.locale);

//     await Promise.all(urlPatterns.map(async (urlPattern) => {
//       const generatedPath = getPluginService('url-pattern').resolvePattern(uid, combinedEntity, urlPattern);

//       // If a URL alias was created and 'generated' is set to true, update the alias.
//       if (urlAliasEntity?.generated === true) {
//         urlAliasEntity = await getPluginService('url-alias').update(urlAliasEntity.id, {
//           // @ts-ignore
//           url_path: generatedPath,
//           generated: true,
//           contenttype: uid,
//           // @ts-ignore
//           locale: combinedEntity.locale,
//           localizations: urlAliasLocalizations,
//         });
//       }

//       // If no URL alias was created, create one.
//       if (!urlAliasEntity) {
//         urlAliasEntity = await getPluginService('url-alias').create({
//           url_path: generatedPath,
//           generated: true,
//           contenttype: uid,
//           // @ts-ignore
//           locale: combinedEntity.locale,
//           // @ts-ignore
//           localizations: urlAliasLocalizations,
//         });
//       }
//     }));

//     // Update all the URL alias localizations.
//     await Promise.all(urlAliasLocalizations.map(async (localization) => {
//       await strapi.db.query('plugin::webtools.url-alias').update({
//         where: {
//           id: localization,
//         },
//         data: {
//           localizations: [
//             ...(urlAliasLocalizations.filter((loc) => loc !== localization)),
//             urlAliasEntity.id,
//           ],
//         },
//       });
//     }));

//     // Eventually update the entity to include the URL alias.
//     const dataWithUrlAlias = { ...opts.data, url_alias: urlAliasEntity.id };
//     const updatedEntity = await service.update.call(this, uid, newEntity.id, {
//       ...opts, data: dataWithUrlAlias,
//     });

//     return updatedEntity;
//   },

//   async update(
//     uid: Common.UID.ContentType,
//     entityId: number,
//     opts: IDecoratedServiceOptions<{ url_alias: number }>,
//   ) {
//     const hasWT = isContentTypeEnabled(uid);
//     let urlAliasEntity: Attribute.GetValues<'plugin::webtools.url-alias', Attribute.GetNonPopulatableKeys<'plugin::webtools.url-alias'>>;

//     // If Webtools isn't enabled, do nothing.
//     if (!hasWT) {
//       return service.update.call(this, uid, entityId, opts);
//     }

//     // Fetch the URL pattern for this content type.
//     let relations: string[] = [];
//     let languages: string[] = [undefined];

//     if (strapi.plugin('i18n')) {
//       languages = [];
//       const locales = await strapi.entityService.findMany('plugin::i18n.locale', {});
//       languages = locales.map((locale) => locale.code);
//     }

//     await Promise.all(languages.map(async (lang) => {
//       const urlPattern = await getPluginService('url-pattern').findByUid(uid, lang);
//       const languageRelations = getPluginService('url-pattern').getRelationsFromPattern(urlPattern);

//       relations = [...relations, ...languageRelations];
//     }));

//     // Manually fetch the entity that's being updated.
//     // We do this because not all it's data is present in opts.data.
//     const entity = await service.update.call(this, uid, entityId, {
//       ...opts,
//       populate: {
//         ...relations.reduce((obj, key) => ({ ...obj, [key]: {} }), {}),
//         url_alias: {
//           fields: ['id', 'generated'],
//         },
//         localizations: {
//           populate: {
//             url_alias: {
//               fields: ['id'],
//             },
//           },
//         },
//       },
//     });

//     // Fetch the URL alias localizations.
//     const urlAliasLocalizations = entity.localizations
//       ?.map((loc) => loc.url_alias?.id)
//       ?.filter((loc) => loc) || [];

//     const entityWithoutLocalizations = {
//       ...entity,
//       localizations: undefined,
//     };

//     // @ts-ignore
//     if (opts.data.url_alias?.length) {
//       urlAliasEntity = await getPluginService('url-alias').findOne(opts.data.url_alias);
//       // @ts-ignore
//       // eslint-disable-next-line max-len
//       // eslint-disable-next-line ,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-member-access
//     } else if (entity.url_alias?.length) {
//       // @ts-ignore
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//       urlAliasEntity = entity.url_alias;
//     }

//     // If a URL alias is present and 'generated' is set to false, do nothing.
//     if (urlAliasEntity?.generated === false) {
//       return service.update.call(this, uid, entityId, opts);
//     }

//     // Generate the path.
//     const urlPatterns = await getPluginService('url-pattern').findByUid(uid, entity.locale);
//     await Promise.all(urlPatterns.map(async (urlPattern) => {
//       const generatedPath = getPluginService('url-pattern').resolvePattern(uid, entityWithoutLocalizations, urlPattern);

//       // @ts-ignore
//       if (urlAliasEntity?.length) {
//         // @ts-ignore
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-call
//         await Promise.all(urlAliasEntity.map(async (alias: { generated: boolean; id: ID; }) => {
//           if (alias.generated === true) {
//             await getPluginService('url-alias').update(alias.id, {
//               // @ts-ignore
//               url_path: generatedPath,
//               generated: true,
//               contenttype: uid,
//               // @ts-ignore
//               locale: entity.locale,
//               // @ts-ignore
//               localizations: urlAliasLocalizations,
//             });
//           }
//         }));
//       }

//       // @ts-ignore
//       if (!urlAliasEntity?.length) {
//         console.log('creating new url alias because empty array', urlAliasEntity);
//         urlAliasEntity = await getPluginService('url-alias').create({
//           url_path: generatedPath,
//           generated: true,
//           contenttype: uid,
//           // @ts-ignore
//           locale: entity.locale,
//           // @ts-ignore
//           localizations: urlAliasLocalizations,
//         });
//       }
//     }));

//     // Update all the URL alias localizations.
//     await Promise.all(urlAliasLocalizations.map(async (localization) => {
//       await strapi.db.query('plugin::webtools.url-alias').update({
//         where: {
//           id: localization,
//         },
//         data: {
//           localizations: [
//             ...(urlAliasLocalizations.filter((loc) => loc !== localization)),
//             urlAliasEntity.id,
//           ],
//         },
//       });
//     }));

//     // Eventually update the entity.
//     return service.update.call(this, uid, entityId, {
//       ...opts,
//       data: {
//         ...opts.data,
//         url_alias: urlAliasEntity.id,
//       },
//     });
//   },

//   async delete(uid: Common.UID.ContentType, entityId: number) {
//     const hasWT = isContentTypeEnabled(uid);

//     // If Webtools isn't enabled, do nothing.
//     if (!hasWT) {
//       return service.delete.call(this, uid, entityId);
//     }

//     // Fetch the entity because we need the url_alias id.
//     const entity = await service.findOne.call(this, uid, entityId, {
//       populate: {
//         url_alias: {
//           fields: ['id'],
//         },
//       },
//     });

//     // If a URL alias is present, delete it.
//     // @ts-ignore
//     if (entity.url_alias.length) {
//       // @ts-ignore
//       // eslint-disable-next-line max-len
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
//       await Promise.all(entity.url_alias.map(async (url_alias: { id: string | number; }) => {
//         if (url_alias?.id) {
//           await getPluginService('url-alias').delete(url_alias.id);
//         }
//       }));
//     }

//     // Eventually delete the entity.
//     return service.delete.call(this, uid, entityId);
//   },

//   // eslint-disable-next-line max-len, consistent-return
//   async clone(uid: Common.UID.ContentType, cloneId: number, params?: IDecoratedServiceOptions<{ url_alias: number }>) {
//     const hasWT = isContentTypeEnabled(uid);

//     if (!hasWT) {
//       return service.clone.call(this, uid, cloneId, params);
//     }

//     // Fetch the URL pattern for this content type.
//     let relations: string[] = [];
//     let languages: string[] = [undefined];

//     if (strapi.plugin('i18n')) {
//       languages = [];
//       const locales = await strapi.entityService.findMany('plugin::i18n.locale', {});
//       languages = locales.map((locale) => locale.code);
//     }

//     await Promise.all(languages.map(async (lang) => {
//       const urlPattern = await getPluginService('url-pattern').findByUid(uid, lang);
//       const languageRelations = getPluginService('url-pattern').getRelationsFromPattern(urlPattern);
//       relations = [...relations, ...languageRelations];
//     }));

//     // Create the cloned entity
//     const clonedEntity = await service.clone.call(this, uid, cloneId, {
//       ...params,
//       populate: {
//         ...relations.reduce((obj, key) => ({ ...obj, [key]: {} }), {}),
//         url_alias: {
//           fields: ['id', 'generated'],
//         },
//         localizations: {
//           populate: {
//             url_alias: {
//               fields: ['id'],
//             },
//           },
//         },
//       },
//     });

//     if (!clonedEntity) {
//       throw new Error('Cloning failed, cloned entity is null or undefined');
//     }

//     // Fetch the URL alias localizations.
//     const urlAliasLocalizations = clonedEntity.localizations
//       ?.map((loc) => loc.url_alias.id)
//       ?.filter((loc) => loc) || [];

//     const clonedEntityWithoutLocalizations = {
//       ...clonedEntity,
//       localizations: undefined,
//     };

//     const combinedEntity = { ...clonedEntityWithoutLocalizations };

//     const urlPatterns = await getPluginService('url-pattern').findByUid(uid, combinedEntity.locale);
//     await Promise.all(urlPatterns.map(async (urlPattern) => {
//       const generatedPath = getPluginService('url-pattern').resolvePattern(uid, combinedEntity, urlPattern);
//       // Create a new URL alias for the cloned entity
//       const newUrlAlias = await getPluginService('url-alias').create({
//         url_path: generatedPath,
//         generated: true,
//         contenttype: uid,
//         // @ts-ignore
//         locale: combinedEntity.locale,
//         // @ts-ignore
//         localizations: urlAliasLocalizations,
//       });

//       // Update all the URL alias localizations.
//       await Promise.all(urlAliasLocalizations.map(async (localization) => {
//         await strapi.db.query('plugin::webtools.url-alias').update({
//           where: {
//             id: localization,
//           },
//           data: {
//             localizations: [
//               ...(urlAliasLocalizations.filter((loc) => loc !== localization)),
//               newUrlAlias.id,
//             ],
//           },
//         });
//       }));

//       // Update the cloned entity with the new URL alias id
//       return service.update.call(this, uid, clonedEntity.id, { data: { url_alias: newUrlAlias.id }, populate: ['url_alias'] });
//     }));
//   },

//   async deleteMany(uid: Common.UID.ContentType, params: any) {
//     const hasWT = isContentTypeEnabled(uid);
//     if (!hasWT) {
//       return service.deleteMany.call(this, uid, params);
//     }

//     // Find entities matching the criteria to delete their URL aliases
//     const entitiesToDelete = await strapi.entityService.findMany(uid, { ...params, fields: ['id'], populate: ['url_alias'] });

//     entitiesToDelete.map(async (entity) => {
//       // @ts-ignore
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//       if (entity.url_alias.length) {
//         // @ts-ignore
//         // eslint-disable-next-line max-len
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
//         await Promise.all(entity.url_alias.map(async (url_alias: { id: string | number; }) => {
//           if (url_alias?.id) {
//             await getPluginService('url-alias').delete(url_alias.id);
//           }
//         }));
//       }
//     });

//     // Delete the entities after URL aliases
//     return service.deleteMany.call(this, uid, params);
//   },

// });

export default () => ({
  // decorator,
});
