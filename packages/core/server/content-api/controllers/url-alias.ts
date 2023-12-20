
import { factories } from '@strapi/strapi';

/**
 * URL alias controller
 */

const contentTypeSlug = 'plugin::webtools.url-alias';

export default factories.createCoreController(contentTypeSlug);
