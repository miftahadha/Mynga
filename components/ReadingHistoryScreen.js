import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const ReadingHistoryScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchReadingHistory = async () => {
    try {
      const stored = (await AsyncStorage.getItem('readingHistory')) || '[]';
      const arr = JSON.parse(stored);
      setHistory(arr);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchReadingHistory();
    }
  }, [isFocused]);

  const handleResume = (item) => {
    navigation.navigate('Read', {
      chapterSlug: item.chapterSlug || item.chapterId,
      chapterEndpoint: item.chapterSlug || item.chapterId,
      chapterTitle: item.chapterTitle || item.chapterNumber || 'Chapter',
      mangaTitle: item.mangaTitle || 'Komik',
      mangaSlug: item.slug || item.mangaId,
    });
  };

  const handleDelete = async (indexToDelete) => {
    try {
      const updated = history.filter((_, idx) => idx !== indexToDelete);
      await AsyncStorage.setItem('readingHistory', JSON.stringify(updated));
      setHistory(updated);
    } catch (error) {
      console.error('Error deleting reading history:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    const formattedDate = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Terakhir dibaca';

    const thumbnail = item.thumbnail || item.image || item.mangaThumbnails;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleResume(item)}
          activeOpacity={0.85}
        >
          {/* Comic Cover Image instead of Icon */}
          {thumbnail ? (
            <ExpoImage
              source={{ uri: thumbnail }}
              style={styles.cardImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
              <Ionicons name="book-outline" size={24} color="#9EA5BA" />
            </View>
          )}

          <View style={styles.textContainer}>
            <Text style={styles.mangaTitle} numberOfLines={1}>
              {item.mangaTitle || 'Untitled Manga'}
            </Text>
            <View style={styles.chapterBadge}>
              <Text style={styles.chapterBadgeText} numberOfLines={1}>
                {item.chapterTitle || item.chapterNumber || 'Chapter'}
              </Text>
            </View>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(index)}
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
          <Ionicons name="chevron-back" size={26} color="#1C202E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Membaca</Text>
        <View style={{ width: 36 }} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#9EA5BA" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>Belum ada riwayat membaca.</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Mulai Membaca</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
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
    alignItems: 'flex-start',
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
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#EAECEF',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  mangaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C202E',
    marginBottom: 4,
  },
  chapterBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0ED',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  chapterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7A59',
  },
  dateText: {
    fontSize: 11,
    color: '#A0A5B5',
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

export default ReadingHistoryScreen;
