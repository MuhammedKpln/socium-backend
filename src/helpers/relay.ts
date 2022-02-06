// import { Posts } from '@prisma/client';
// import { PostEntityy } from 'src/post/entities/post.entity';

// export function toRelay(data: Posts[]): PostEntityy {
//   const resultsWithCursor = data.map((result) => {
//     return { ...result, cursor: result.id };
//   });

//   const cursorr = {
//     startCursor: resultsWithCursor[0]?.cursor,
//     endCursor: resultsWithCursor[resultsWithCursor.length - 1]?.cursor,
//     hasNextPage:
//       resultsWithCursor[0]?.cursor !==
//       resultsWithCursor[resultsWithCursor.length - 1]?.cursor,
//   };

//   return {
//     posts: resultsWithCursor,
//     ...cursorr,
//   };
// }

// export function relayCursorQuery(cursor: number) {
//   return cursor ? { cursor: { id: cursor }, skip: 1 } : undefined;
// }
