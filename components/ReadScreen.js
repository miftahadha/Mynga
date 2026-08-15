import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getChapterDetail } from '../services/komikuApi';

const { width: screenWidth } = Dimensions.get('window');

const IMAGE_HEADERS = {
  Referer: 'https://komikindo.ch/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// High-Definition Comic Page Component with expo-image
const HDComicPage = ({ uri, index }) => {
  const [height, setHeight] = useState(screenWidth * 1.45);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = (e) => {
    if (e?.source?.width && e?.source?.height) {
      const naturalWidth = e.source.width;
      const naturalHeight = e.source.height;
      if (naturalWidth > 0 && naturalHeight > 0) {
        const calculatedHeight = Math.round((screenWidth * naturalHeight) / naturalWidth);
        setHeight(calculatedHeight);
      }
    }
    setLoaded(true);
  };

  return (
    <View style={[styles.pageContainer, { width: screenWidth, minHeight: height }]}>
      <ExpoImage
        source={{
          uri,
          headers: IMAGE_HEADERS,
        }}
        style={{
          width: screenWidth,
          height,
        }}
        contentFit="contain"
        priority={index < 4 ? 'high' : 'normal'}
        cachePolicy="memory-disk"
        onLoad={handleLoad}
        onError={() => setError(true)}
      />
      {!loaded && !error && (
        <View style={styles.loadingPlaceholder}>
          <ActivityIndicator size="small" color="#56B8A5" />
          <Text style={styles.placeholderPageNum}>Halaman {index + 1}</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorPlaceholder}>
          <Text style={styles.errorText}>Halaman {index + 1} gagal dimuat</Text>
        </View>
      )}
    </View>
  );
};

const ReadScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

  const params = route.params || {};
  const [currentChapterSlug, setCurrentChapterSlug] = useState(
    params.chapterSlug || params.chapterEndpoint || params.chapterId || ''
  );
  const mangaTitle = params.mangaTitle || 'Komik';
  const initialChapterTitle = params.chapterTitle || params.chapterNumber || 'Chapter';

  const [pages, setPages] = useState([]);
  const [chapterInfo, setChapterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchPages = async (slug) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getChapterDetail(slug);
      let rawPages = [];
      if (data && Array.isArray(data.images) && data.images.length > 0) {
        rawPages = data.images;
      } else if (data && Array.isArray(data.image) && data.image.length > 0) {
        rawPages = data.image;
      }

      const filtered = rawPages.filter(url => typeof url === 'string' && url.trim().length > 0);

      if (filtered.length > 0) {
        setPages(filtered);
        setChapterInfo(data);
      } else {
        setErrorMsg('Halaman gambar untuk chapter ini tidak ditemukan.');
      }
    } catch (error) {
      console.error('Error loading chapter pages:', error);
      setErrorMsg('Gagal memuat gambar chapter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentChapterSlug) {
      fetchPages(currentChapterSlug);
    }
  }, [currentChapterSlug]);

  const displayTitle = chapterInfo?.title
    ? chapterInfo.title
    : `${initialChapterTitle} - ${mangaTitle}`;

  const goToPrevChapter = () => {
    if (chapterInfo?.prevSlug) {
      setCurrentChapterSlug(chapterInfo.prevSlug);
    }
  };

  const goToNextChapter = () => {
    if (chapterInfo?.nextSlug) {
      setCurrentChapterSlug(chapterInfo.nextSlug);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dark Navy Header matching Baca Chapter.png mockup */}
      <View style={[styles.headerBar, { paddingTop: statusBarHeight + 6 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#56B8A5" />
          <Text style={styles.loadingText}>Memuat gambar resolusi HD...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerContainer}>
          <Text style={styles.chapterErrorText}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {pages.map((imageUrl, index) => (
            <HDComicPage
              key={`${imageUrl}-${index}`}
              uri={imageUrl}
              index={index}
            />
          ))}

          {/* Chapter Navigation Buttons at Bottom */}
          <View style={styles.navigationBar}>
            {chapterInfo?.prevSlug ? (
              <TouchableOpacity
                style={styles.navButton}
                onPress={goToPrevChapter}
                activeOpacity={0.8}
              >
                <Text style={styles.navButtonText}>⬅ Chapter Sebelumnya</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.navButton, styles.disabledButton]}>
                <Text style={styles.disabledButtonText}>Chapter Pertama</Text>
              </View>
            )}

            {chapterInfo?.nextSlug ? (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={goToNextChapter}
                activeOpacity={0.8}
              >
                <Text style={styles.navButtonText}>Chapter Selanjutnya ➔</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.navButton, styles.disabledButton]}>
                <Text style={styles.disabledButtonText}>Chapter Terbaru</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerBar: {
    backgroundColor: '#1B1E31',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  pageContainer: {
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  placeholderPageNum: {
    color: '#555A70',
    fontSize: 12,
    marginTop: 8,
  },
  errorPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  errorText: {
    color: '#FF7A59',
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#8E94A4',
    marginTop: 12,
    fontSize: 14,
  },
  chapterErrorText: {
    color: '#FF7A59',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#56B8A5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#1B1E31',
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#56B8A5',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledButton: {
    backgroundColor: '#121420',
  },
  disabledButtonText: {
    color: '#555A70',
    fontSize: 13,
  },
});

export default ReadScreen;
