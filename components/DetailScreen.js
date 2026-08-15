import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getComicInfo } from '../services/komikuApi';

const { width: screenWidth } = Dimensions.get('window');

const DetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

  const params = route.params || {};
  const slug = params.slug || params.endpoint || params.mangaId || '';
  const initialTitle = params.title || '';
  const initialThumbnail = params.thumbnail || params.mangaThumbnails || '';

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  useEffect(() => {
    const fetchComicDetails = async () => {
      setLoading(true);
      try {
        const data = await getComicInfo(slug);
        if (data) {
          setDetails(data);
        }
      } catch (error) {
        console.error('Error fetching comic details:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkBookmark = async () => {
      try {
        const stored = (await AsyncStorage.getItem('bookmarks')) || '[]';
        const arr = JSON.parse(stored);
        const exists = arr.some(item => item.slug === slug || item.mangaId === slug);
        setIsBookmarked(exists);
      } catch (e) {
        console.error('Error checking bookmark:', e);
      }
    };

    if (slug) {
      fetchComicDetails();
      checkBookmark();
    }
  }, [slug]);

  const toggleBookmark = async () => {
    try {
      const stored = (await AsyncStorage.getItem('bookmarks')) || '[]';
      const arr = JSON.parse(stored);
      const title = details?.title || initialTitle || 'Untitled';
      const thumb = details?.thumbnail || initialThumbnail || '';

      const idx = arr.findIndex(item => item.slug === slug || item.mangaId === slug);
      if (idx === -1) {
        arr.push({
          slug,
          mangaId: slug,
          title,
          mangaTitle: title,
          thumbnail: thumb,
          mangaThumbnails: thumb,
        });
        await AsyncStorage.setItem('bookmarks', JSON.stringify(arr));
        setIsBookmarked(true);
        Alert.alert('Sukses', `${title} ditambahkan ke Bookmark!`);
      } else {
        arr.splice(idx, 1);
        await AsyncStorage.setItem('bookmarks', JSON.stringify(arr));
        setIsBookmarked(false);
        Alert.alert('Sukses', `${title} dihapus dari Bookmark.`);
      }
    } catch (e) {
      console.error('Error toggling bookmark:', e);
    }
  };

  const startReading = (chapterItem) => {
    const targetChapter = chapterItem || (details?.chapter_list && details.chapter_list[details.chapter_list.length - 1]) || details?.chapter_list?.[0];
    if (!targetChapter) {
      Alert.alert('Info', 'Belum ada chapter yang tersedia.');
      return;
    }

    const chapterSlug = targetChapter.slug || targetChapter.endpoint;
    const chapterTitle = targetChapter.title || targetChapter.name;
    const title = details?.title || initialTitle;
    const thumb = details?.thumbnail || initialThumbnail || '';

    // Save reading history
    AsyncStorage.getItem('readingHistory').then(res => {
      const hist = res ? JSON.parse(res) : [];
      const updated = hist.filter(h => !(h.slug === slug && h.chapterSlug === chapterSlug));
      updated.unshift({
        slug,
        mangaId: slug,
        mangaTitle: title,
        thumbnail: thumb,
        mangaThumbnails: thumb,
        image: thumb,
        chapterSlug,
        chapterId: chapterSlug,
        chapterTitle,
        chapterNumber: chapterTitle,
        timestamp: Date.now(),
      });
      AsyncStorage.setItem('readingHistory', JSON.stringify(updated.slice(0, 100)));
    }).catch(console.error);

    navigation.navigate('Read', {
      chapterSlug,
      chapterEndpoint: chapterSlug,
      chapterTitle,
      mangaTitle: title,
      mangaSlug: slug,
    });
  };

  const title = details?.title || initialTitle;
  const thumbnail = details?.thumbnail || initialThumbnail;
  const genres = details?.genres || details?.genre || ['Action', 'Adventure'];
  const chapters = details?.chapter_list || details?.chapters || [];
  const status = details?.status || 'ongoing';
  const totalChapters = chapters.length > 0 ? `${chapters.length} Chapter` : (details?.rating ? `Rating: ⭐ ${details.rating}` : 'Manga');
  const synopsis = details?.synopsis || details?.description || 'Tidak ada deskripsi sinopsis.';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner with Header Overlay matching Mockup */}
        <View style={styles.heroContainer}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]} />
          )}

          {/* Dark Gradient Overlay */}
          <View style={styles.heroOverlay} />

          {/* Header Bar Over Image */}
          <View style={[styles.heroHeader, { paddingTop: statusBarHeight }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.heroHeaderTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Floating Genre Badges over bottom of hero image */}
          <View style={styles.floatingGenres}>
            {genres.slice(0, 3).map((g, idx) => (
              <View key={idx.toString()} style={styles.genrePill}>
                <Text style={styles.genrePillText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#56B8A5" />
            <Text style={styles.loadingText}>Memuat detail komik...</Text>
          </View>
        ) : (
          <View style={styles.bodyContent}>
            {/* Title & Ongoing Status Row */}
            <View style={styles.titleRow}>
              <Text style={styles.comicTitle} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.statusText}>{status.toLowerCase()}</Text>
            </View>

            <Text style={styles.chapterCount}>{totalChapters}</Text>

            {/* Synopsis Section */}
            <View style={styles.synopsisContainer}>
              <Text style={styles.synopsisTitle}>Tentang komik ini</Text>
              <Text
                style={styles.synopsisText}
                numberOfLines={synopsisExpanded ? undefined : 3}
              >
                {synopsis}
              </Text>
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setSynopsisExpanded(!synopsisExpanded)}
              >
                <Text style={styles.expandChevron}>{synopsisExpanded ? '⌃' : '⌵'}</Text>
              </TouchableOpacity>
            </View>

            {/* Chapter List */}
            <View style={styles.chapterListSection}>
              {chapters.map((ch, index) => {
                const formattedNum = String(index + 1).padStart(2, '0');
                const chTitle = ch.title || ch.name || `Chapter ${index + 1}`;
                const chDate = ch.releaseTime || 'Baru';

                return (
                  <TouchableOpacity
                    key={ch.slug || index.toString()}
                    style={styles.chapterRow}
                    onPress={() => startReading(ch)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chapterNumber}>{formattedNum}</Text>
                    <View style={styles.chapterTextContent}>
                      <Text style={styles.chapterName}>{chTitle}</Text>
                      <Text style={styles.chapterDate}>{chDate}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action Bar matching Mockup */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bookmarkButton, isBookmarked && styles.bookmarkedActive]}
          onPress={toggleBookmark}
          activeOpacity={0.8}
        >
          <Text style={[styles.starIcon, isBookmarked && styles.starIconActive]}>
            {isBookmarked ? '★' : '☆'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.readButton}
          onPress={() => startReading()}
          activeOpacity={0.85}
        >
          <Text style={styles.readButtonText}>Baca Komik</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    width: screenWidth,
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    backgroundColor: '#1E202E',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 25, 0.45)',
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '300',
    marginTop: -4,
  },
  heroHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  floatingGenres: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    flexDirection: 'row',
  },
  genrePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  genrePillText: {
    color: '#1C202E',
    fontSize: 13,
    fontWeight: '600',
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  comicTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C202E',
    flex: 1,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#56B8A5',
    textTransform: 'lowercase',
  },
  chapterCount: {
    fontSize: 14,
    color: '#A0A5B5',
    marginBottom: 18,
  },
  synopsisContainer: {
    marginBottom: 20,
  },
  synopsisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C202E',
    marginBottom: 8,
  },
  synopsisText: {
    fontSize: 14,
    color: '#8E94A4',
    lineHeight: 22,
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  expandChevron: {
    fontSize: 20,
    color: '#8E94A4',
    fontWeight: 'bold',
  },
  chapterListSection: {
    marginTop: 8,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F8',
  },
  chapterNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#B5BAC9',
    width: 48,
  },
  chapterTextContent: {
    flex: 1,
  },
  chapterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C202E',
    marginBottom: 2,
  },
  chapterDate: {
    fontSize: 12,
    color: '#A0A5B5',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E94A4',
    marginTop: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bookmarkButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF0ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bookmarkedActive: {
    backgroundColor: '#FFE3DC',
  },
  starIcon: {
    fontSize: 24,
    color: '#FF7A59',
  },
  starIconActive: {
    color: '#FF7A59',
  },
  readButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#56B8A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DetailScreen;
