const ANILIST_API_URL = "https://graphql.anilist.co";

export async function fetchFromAniList(query: string, variables: any = {}) {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    throw error;
  }
}

// GraphQL Queries
export const TRENDING_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, sort: TRENDING_DESC, status_not: NOT_YET_RELEASED) {
        id
        title {
          english
          romaji
          native
        }
        coverImage {
          large
          medium
        }
        description
        genres
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        status
        averageScore
        tags {
          name
        }
        nextAiringEpisode {
          airingAt
          episode
        }
        episodes
        season
        seasonYear
      }
    }
  }
`;

export const POPULAR_ANIME_QUERY = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(type: ANIME, sort: POPULARITY_DESC, status_not: NOT_YET_RELEASED) {
        id
        title {
          english
          romaji
          native
        }
        coverImage {
          large
          medium
        }
        description
        genres
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        status
        averageScore
        tags {
          name
        }
        nextAiringEpisode {
          airingAt
          episode
        }
        episodes
        season
        seasonYear
      }
    }
  }
`;

export const ANIME_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        large
        medium
      }
      description
      genres
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      status
      averageScore
      tags {
        name
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      episodes
      season
      seasonYear
      relations {
        edges {
          id
          relationType
          node {
            id
            title {
              english
              romaji
            }
            type
            format
            episodes
            coverImage {
              medium
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_ANIME_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search) {
        id
        title {
          english
          romaji
          native
        }
        coverImage {
          large
          medium
        }
        description
        genres
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        status
        averageScore
        tags {
          name
        }
        nextAiringEpisode {
          airingAt
          episode
        }
        episodes
        season
        seasonYear
      }
    }
  }
`;
