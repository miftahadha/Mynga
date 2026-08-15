import axios from 'axios';

export const BASE_URL = 'https://www.sankavollerei.web.id/comic/komikindo';

// Helper to clean slug / endpoint string
export const cleanSlug = (slug) => {
  if (!slug) return '';
  // remove leading/trailing slashes and common prefixes if passed
  return slug.replace(/^\/+|\/+$/g, '').replace(/^manga\//, '').replace(/^comic\//, '').replace(/^ch\//, '');
};

// Clean title strings from unwanted whitespace/newline
export const cleanTitle = (title) => {
  if (!title) return '';
  return title.replace(/^Komik\s*/i, '').trim();
};

// 1. Get Komik Terbaru (Latest)
export const getLatestManga = async (page = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/latest/${page}`);
    const list = response.data?.komikList || response.data?.data || [];
    return list.map(item => ({
      title: cleanTitle(item.title),
      slug: item.slug,
      endpoint: item.slug,
      thumbnail: item.image,
      image: item.image,
      type: item.type || 'Manga',
      color: item.color,
      latestChapter: item.chapters?.[0]?.title || '',
    }));
  } catch (error) {
    console.error(`Error fetching latest manga page ${page}:`, error.message);
    return [];
  }
};

// 2. Get Detail Komik
export const getComicInfo = async (slug) => {
  try {
    const cleaned = cleanSlug(slug);
    const response = await axios.get(`${BASE_URL}/detail/${cleaned}`);
    const data = response.data?.data || response.data;
    if (!data) return null;

    const chapterList = (data.chapters || []).map(ch => ({
      name: ch.title,
      title: ch.title,
      endpoint: ch.slug,
      slug: ch.slug,
      releaseTime: ch.releaseTime,
    }));

    const genres = (data.genres || []).map(g => (typeof g === 'string' ? g : g.name));

    return {
      title: cleanTitle(data.title),
      thumbnail: data.image,
      image: data.image,
      rating: data.rating || 'N/A',
      votes: data.votes,
      author: data.detail?.author || 'Unknown',
      status: data.detail?.status || 'Ongoing',
      type: data.detail?.type || 'Manga',
      theme: data.detail?.theme || '',
      synopsis: data.synopsis || data.description || '',
      description: data.synopsis || data.description || '',
      genre: genres,
      genres: genres,
      chapter_list: chapterList,
      chapters: chapterList,
    };
  } catch (error) {
    console.error(`Error fetching comic info for ${slug}:`, error.message);
    return null;
  }
};

// 3. Baca Chapter (Chapter Images)
export const getChapterDetail = async (chapterSlug) => {
  try {
    const cleaned = cleanSlug(chapterSlug);
    const response = await axios.get(`${BASE_URL}/chapter/${cleaned}`);
    const data = response.data?.data || response.data;
    if (!data) return null;

    // Normalize images to array of url strings
    let imageUrls = [];
    if (Array.isArray(data.images)) {
      imageUrls = data.images.map(img => (typeof img === 'string' ? img : (img.url || img.image)));
    } else if (Array.isArray(data.image)) {
      imageUrls = data.image;
    }

    return {
      title: cleanTitle(data.title),
      navigation: data.navigation || {},
      prevSlug: data.navigation?.prev || null,
      nextSlug: data.navigation?.next || null,
      image: imageUrls,
      images: imageUrls,
    };
  } catch (error) {
    console.error(`Error fetching chapter images for ${chapterSlug}:`, error.message);
    return null;
  }
};

// 4. Cari Komik (Search)
export const searchManga = async (query, page = 1) => {
  try {
    if (!query || !query.trim()) return [];
    const encoded = encodeURIComponent(query.trim());
    const response = await axios.get(`${BASE_URL}/search/${encoded}/${page}`);
    const list = response.data?.komikList || response.data?.data || [];
    return list.map(item => ({
      title: cleanTitle(item.title),
      slug: item.slug,
      endpoint: item.slug,
      thumbnail: item.image,
      image: item.image,
      rating: item.rating,
      type: item.type || 'Manga',
      desc: item.rating ? `Rating: ⭐ ${item.rating}` : '',
    }));
  } catch (error) {
    console.error(`Error searching manga for "${query}":`, error.message);
    return [];
  }
};

// 5. Daftar Genre (All Genres)
export const getAllGenres = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/genres`);
    const list = response.data?.genres || [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map(g => ({
        title: g.name,
        name: g.name,
        endpoint: g.value || g.slug || g.name.toLowerCase(),
        value: g.value || g.slug || g.name.toLowerCase(),
      }));
    }
  } catch (error) {
    console.error('Error fetching genres:', error.message);
  }
  return [];
};

// 6. Library / Get by Genre
export const getByGenre = async (genre, page = 1) => {
  try {
    const cleanG = cleanSlug(genre).toLowerCase();
    const response = await axios.get(`${BASE_URL}/library`, {
      params: {
        genre: cleanG,
        page,
      },
    });
    const list = response.data?.komikList || response.data?.data || [];
    return list.map(item => ({
      title: cleanTitle(item.title),
      slug: item.slug,
      endpoint: item.slug,
      thumbnail: item.image,
      image: item.image,
      rating: item.rating,
      type: item.type || 'Manga',
      desc: item.rating ? `Rating: ⭐ ${item.rating}` : '',
    }));
  } catch (error) {
    console.error(`Error fetching manga by genre "${genre}":`, error.message);
    return [];
  }
};

// Aliases for compatibility
export const getPopularManga = (page = 1) => getLatestManga(page);
export const getRecommendedManga = (page = 2) => getLatestManga(page);
export const getNewestManga = (page = 1) => getLatestManga(page);
export const getListComic = (filter = 'manga') => getLatestManga(1);
