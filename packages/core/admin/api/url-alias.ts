import { useFetchClient } from '@strapi/helper-plugin';
import { UrlAliasEntity } from '../types/url-aliases';

export const useCreateUrlAlias = () => {
  const { post } = useFetchClient();

  const createUrlAlias = async (body: { id: number }, slug: string) => {
    return post('/webtools/url-alias/create', {
      data: {
        ...body,
        contenttype: slug,
      },
    });
  };

  return { createUrlAlias };
};

export const useUpdateUrlAlias = () => {
  const { put } = useFetchClient();
  const updateUrlAliases = async (aliases: UrlAliasEntity[], slug: string) => {

    return Promise.all(
      aliases.map((alias) => put(`/webtools/url-alias/update/${alias.id}`, {
        data: {
          ...alias,
          contenttype: slug,
        },
      })),
    );
  };

  return { updateUrlAliases };
};


export const useDeleteUrlAlias = () => {
  const { post } = useFetchClient();

  const deleteUrlAlias = async (body: { id: number }) => {
    return post(`/webtools/url-alias/delete/${body.id}`);
  };

  return { deleteUrlAlias };
};
