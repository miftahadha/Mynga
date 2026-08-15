import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UserHeader from './UserHeader';
import { getAllGenres, getByGenre, getLatestManga } from '../services/komikuApi';

const KomikScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const navigation = useNavigation();

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null); // null = all / 'Pilih Genre'
  const [comicList, setComicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [genreList, defaultComics] = await Promise.all([
          getAllGenres(),
          getLatestManga(1),
        ]);
        setGenres(genreList || []);
        setComicList(defaultComics || []);
      } catch (error) {
        console.error('Error loading Komik screen data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSelectGenre = async (genreItem) => {
    setModalVisible(false);
    setSelectedGenre(genreItem);
    setLoading(true);
    try {
      if (!genreItem) {
        const list = await getLatestManga(1);
        setComicList(list || []);
      } else {
        const list = await getByGenre(genreItem.endpoint || genreItem.value || genreItem.title, 1);
        setComicList(list || []);
      }
    } catch (error) {
      console.error('Error fetching by genre:', error);
    } finally {
      setLoading(false);
    }
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
    const releaseTime = item.releaseTime || (item.rating ? `Rating: ⭐ ${item.rating}` : '5 jam yang lalu');
    const chapterText = item.latestChapter || (item.type ? item.type : 'Chapter Terbaru');

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

      {/* Genre Dropdown Selector matching Mockup */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.dropdownText}>
          {selectedGenre ? selectedGenre.title || selectedGenre.name : 'Pilih Genre'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#8E94A4" />
      </TouchableOpacity>

      {/* Comic List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56B8A5" />
          <Text style={styles.loadingText}>Memuat daftar komik...</Text>
        </View>
      ) : (
        <FlatList
          data={comicList}
          renderItem={renderComicCard}
          keyExtractor={(item, index) => (item.slug || index.toString())}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada komik ditemukan untuk genre ini.</Text>
            </View>
          }
        />
      )}

      {/* Genre Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori Genre</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#8E94A4" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              {/* Option: Semua Genre */}
              <TouchableOpacity
                style={[
                  styles.genreOption,
                  !selectedGenre && styles.selectedGenreOption,
                ]}
                onPress={() => handleSelectGenre(null)}
              >
                <Text
                  style={[
                    styles.genreOptionText,
                    !selectedGenre && styles.selectedGenreOptionText,
                  ]}
                >
                  Semua Genre
                </Text>
              </TouchableOpacity>

              {genres.map((g, idx) => {
                const isSelected = selectedGenre?.endpoint === g.endpoint || selectedGenre?.value === g.value;
                return (
                  <TouchableOpacity
                    key={idx.toString()}
                    style={[styles.genreOption, isSelected && styles.selectedGenreOption]}
                    onPress={() => handleSelectGenre(g)}
                  >
                    <Text
                      style={[
                        styles.genreOptionText,
                        isSelected && styles.selectedGenreOptionText,
                      ]}
                    >
                      {g.title || g.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F5FA',
    borderRadius: 16,
    paddingHorizontal: 18,
    height: 48,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E94A4',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C202E',
  },
  modalScrollView: {
    maxHeight: 360,
  },
  genreOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFC',
  },
  selectedGenreOption: {
    backgroundColor: '#E6F6F2',
  },
  genreOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C202E',
  },
  selectedGenreOptionText: {
    color: '#56B8A5',
    fontWeight: '700',
  },
});

export default KomikScreen;
