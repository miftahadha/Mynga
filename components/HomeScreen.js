import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UserHeader from './UserHeader';
import { getLatestManga } from '../services/komikuApi';

const HomeScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const navigation = useNavigation();

  const [activeFilter, setActiveFilter] = useState('Semua'); // 'Semua' | 'Populer' | 'Baru'
  const [allManga, setAllManga] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [newManga, setNewManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [page1, page2] = await Promise.all([
        getLatestManga(1),
        getLatestManga(2),
      ]);

      const p1 = page1 || [];
      const p2 = page2 || [];

      setAllManga(p1);
      setPopularManga(p2);
      setNewManga([...p1].reverse());
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const displayedList = () => {
    if (activeFilter === 'Populer') return popularManga;
    if (activeFilter === 'Baru') return newManga;
    return allManga;
  };

  const handleMangaPress = (item) => {
    const slug = item.slug || item.endpoint || '';
    navigation.navigate('Detail', {
      slug,
      endpoint: slug,
      title: item.title,
      thumbnail: item.thumbnail || item.image,
    });
  };

  const renderComicCard = ({ item }) => {
    const thumbnail = item.thumbnail || item.image;
    const title = item.title || 'Untitled';
    const releaseTime = item.releaseTime || (item.latestChapter ? 'Baru saja diupdate' : '1 jam yang lalu');
    const chapterText = item.latestChapter || 'Chapter Terbaru';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleMangaPress(item)}
        activeOpacity={0.85}
      >
        {thumbnail ? (
          <ExpoImage
            source={{ uri: thumbnail }}
            style={styles.cardImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Ionicons name="book-outline" size={28} color="#9EA5BA" />
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.cardTime}>
            {releaseTime}
          </Text>
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterBadgeText}>
              {chapterText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* Top User Profile Header */}
      <View style={styles.headerSection}>
        <UserHeader />
      </View>

      {/* Search Input Bar matching Mockup */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.9}
      >
        <Ionicons name="search-outline" size={20} color="#9AA0B4" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari komik..."
          placeholderTextColor="#9AA0B4"
          editable={false}
          pointerEvents="none"
        />
        <Ionicons name="options-outline" size={20} color="#9AA0B4" />
      </TouchableOpacity>

      {/* Section Title & Options */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Rekomendasi Manga Terbaru</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Komik')}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8E94A4" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs matching Mockup */}
      <View style={styles.filterTabsContainer}>
        {['Semua', 'Populer', 'Baru'].map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, isActive && styles.activeFilterTab]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Manga List Cards */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56B8A5" />
          <Text style={styles.loadingText}>Memuat rekomendasi manga...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedList()}
          renderItem={renderComicCard}
          keyExtractor={(item, index) => (item.slug || index.toString())}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#56B8A5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada komik ditemukan.</Text>
            </View>
          }
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
  headerSection: {
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C202E',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C202E',
  },
  filterTabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  activeFilterTab: {
    backgroundColor: '#56B8A5',
  },
  filterTabText: {
    fontSize: 14,
    color: '#8E94A4',
    fontWeight: '600',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#EAECEF',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C202E',
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 13,
    color: '#A0A5B5',
    marginBottom: 6,
  },
  chapterBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0ED',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  chapterBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A59',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E94A4',
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E94A4',
    fontSize: 14,
  },
});

export default HomeScreen;
