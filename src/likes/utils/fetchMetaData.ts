import got from 'got';
import { ITwitterMeta, IYoutubeMeta } from './fetchMetaData.types';

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
