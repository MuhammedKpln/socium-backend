import got from 'got';
import {
  IInstagramMeta,
  ITwitterMeta,
  IYoutubeMeta,
} from './fetchMetaData.types';

export const fetchYoutubeMetaData = async (
  videoId: string,
): Promise<IYoutubeMeta> => {
  const response = await got
    .get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    )
    .json<IYoutubeMeta>();

  return response;
};
export const fetchTwitterMetaData = async (
  tweetUrl: string,
): Promise<ITwitterMeta> => {
  const response = await got
    .get(`https://publish.twitter.com/oembed?url=${tweetUrl}`)
    .json<ITwitterMeta>();

  return response;
};

export const fetchInstagramMetaData = async (
  instagramUrl: string,
): Promise<IInstagramMeta> => {
  const response = await got
    .get(`https://api.instagram.com/oembed/?url=${instagramUrl}`)
    .json<IInstagramMeta>();

  return response;
};
