import { createIndex } from ".";
export interface StrictPostProperties {
  title: string;
  path: string;
  textContent: string;
  authorId: string;
  hashtags: Array<string>;
  vote: Array<string>;
  voteNumber: number;
  down: Array<string>;
  downNumber: number;
  bookmarks: Array<string>;
  bookmarkNumber: number;
  createdAt: string;
  updatedAt: string;
}
export const createPostIndex = () => {
  createIndex({
    index: "post",
    mappings: {
      dynamic: "strict",
      properties: {
        title: {
          type: "search_as_you_type",
        },
        path: {
          type: "keyword",
        },
        authorId: {
          type: "keyword",
        },
        hashtags: {
          type: "keyword",
        },
        vote: {
          type: "keyword",
        },
        voteNumber: {
          type: "integer",
        },
        down: {
          type: "keyword",
        },
        downNumber: {
          type: "integer",
        },
        bookmarks: {
          type: "keyword",
        },
        bookmarkNumber: {
          type: "integer",
        },
        textContent: {
          type: "search_as_you_type",
          term_vector: "with_positions_offsets",
        },
        createdAt: {
          type: "date",
        },
        updatedAt: {
          type: "date",
        },
      },
    },
  });
};
