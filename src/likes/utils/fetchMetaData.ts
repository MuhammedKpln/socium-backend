import got from 'got';
import {
  IInstagramMeta,
  ITwitterMeta,
  ITwitterPost,
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

export const fetchTwitterPost = async (twitterId: string) => {
  const twitterApi = `https://api.twitter.com/2/tweets?ids=${twitterId}&expansions=author_id,attachments.media_keys,entities.mentions.username&tweet.fields=text,attachments&user.fields=created_at,name,username,profile_image_url&media.fields=preview_image_url,url`;

  const response = await got
    .get(twitterApi, {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_KEY}`,
      },
    })
    .json<ITwitterPost>();

  return response;
};
