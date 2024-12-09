import { factories, UID } from '@strapi/strapi';
import { get } from 'lodash';
import { getPluginService } from '../util/getPluginService';

/**
 * URL alias service
 */

const contentTypeSlug = 'plugin::webtools.url-alias';

/**
 * Finds a path from the original path that is unique
 */
const duplicateCheck = async (
  originalPath: string,
  ignoreId?: number,
  ext: number = -1,
): Promise<string> => {
  const extension = ext >= 0 ? `-${ext}` : '';
  const newPath = originalPath + extension;
  const pathAlreadyExists = await getPluginService('urlAliasService').findByPath(newPath, ignoreId);

  if (pathAlreadyExists) {
    return duplicateCheck(originalPath, ignoreId, ext + 1);
  }

  return newPath;
};

export default factories.createCoreService(contentTypeSlug, ({ strapi }) => ({
  findRelatedEntity: async (path: string, query: EntityService.Params.Pick<any, 'fields' | 'populate' | 'pagination' | 'sort' | 'filters' | '_q' | 'publicationState' | 'plugin'> = {}) => {
    let excludeDrafts = false;

    const urlAliasEntity = await getPluginService('urlAliasService').findByPath(path);
    if (!urlAliasEntity) {
      return {};
    }

    const contentTypeUid = urlAliasEntity.contenttype as Common.UID.ContentType;

    // Check drafAndPublish setting.
    const contentType = strapi.contentTypes[contentTypeUid];
    if (get(contentType, ['options', 'draftAndPublish'], false)) {
      excludeDrafts = true;
    }

    const entities = await strapi.entityService.findMany(contentTypeUid, {
      ...query,
      filters: {
        ...query?.filters,
        // @ts-ignore
        url_alias: urlAliasEntity.id,
        published_at: excludeDrafts ? {
          $notNull: true,
        } : {},
      },
      locale: 'all',
      limit: 1,
    });

    /**
     * If we're querying a single type, which does not have localizations enabled,
     * Strapi will return a single entity instead of an array. Which is slightly weird,
     * because the API we're querying is called `findMany`. That's why we need to check
     * if the result is an array or not and handle it accordingly.
     */
    const entity = Array.isArray(entities) ? entities[0] : entities;

    if (!entity) {
      return {};
    }

    return {
      entity,
      contentType: urlAliasEntity.contenttype as UID.ContentType,
    };
  },

  /**
   * findByPath.
   *
   * @param {string} path the path.
   * @param {number} id the id to ignore.
   */
  findByPath: async (path: string, id: Entity.ID = 0) => {
    const pathEntity = await strapi.entityService.findMany('plugin::webtools.url-alias', {
      filters: {
        url_path: path,
        id: {
          $not: id,
        },
      },
      limit: 1,
    });

    return pathEntity[0];
  },
}));
