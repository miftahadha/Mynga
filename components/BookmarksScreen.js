import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const BookmarksScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const [bookmarks, setBookmarks] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchBookmarks = async () => {
    try {
      const stored = (await AsyncStorage.getItem('bookmarks')) || '[]';
      const arr = JSON.parse(stored);
      setBookmarks(arr);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchBookmarks();
    }
  }, [isFocused]);

  const navigateToDetail = (item) => {
    const slug = item.slug || item.mangaId || item.endpoint;
    navigation.navigate('Detail', {
      slug,
      endpoint: slug,
      title: item.title || item.mangaTitle,
      thumbnail: item.thumbnail || item.mangaThumbnails,
    });
  };

  const removeBookmark = async (item) => {
    try {
      const targetSlug = item.slug || item.mangaId || item.endpoint;
      const updated = bookmarks.filter(
        b => !(b.slug === targetSlug || b.mangaId === targetSlug || b.endpoint === targetSlug)
      );
      await AsyncStorage.setItem('bookmarks', JSON.stringify(updated));
      setBookmarks(updated);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const renderItem = ({ item }) => {
    const title = item.title || item.mangaTitle || 'Untitled';
    const thumbnail = item.thumbnail || item.mangaThumbnails;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigateToDetail(item)}
          activeOpacity={0.85}
        >
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>📖</Text>
            </View>
          )}

          <View style={styles.textContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Tersimpan</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeBookmark(item)}
        >
          <Text style={styles.deleteText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookmark Saya</Text>
        <View style={{ width: 36 }} />
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔖</Text>
          <Text style={styles.emptyText}>Belum ada komik yang di-bookmark.</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Cari Komik</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.slug || item.mangaId || index.toString())}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    paddingHorizontal: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: '#1C202E',
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C202E',
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#EAECEF',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C202E',
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F6F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#56B8A5',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF0ED',
    marginLeft: 8,
  },
  deleteText: {
    color: '#FF7A59',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#8E94A4',
    fontSize: 15,
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: '#56B8A5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default BookmarksScreen;
