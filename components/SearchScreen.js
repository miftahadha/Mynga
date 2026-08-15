import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { searchManga } from '../services/komikuApi';

const SearchScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const navigation = useNavigation();
  const route = useRoute();

  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [searchedTerm, setSearchedTerm] = useState(route.params?.initialQuery || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const executeSearch = async (textToSearch) => {
    const term = typeof textToSearch === 'string' ? textToSearch : query;
    if (!term || !term.trim()) {
      setResults([]);
      setSearchedTerm('');
      return;
    }

    setLoading(true);
    setSearchedTerm(term.trim());
    try {
      const data = await searchManga(term.trim());
      setResults(data || []);
    } catch (error) {
      console.error('Error during search:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.initialQuery) {
      executeSearch(route.params.initialQuery);
    }
  }, [route.params?.initialQuery]);

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
    const chapterText = item.rating ? `Rating: ⭐ ${item.rating}` : 'Chapter Terbaru';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleMangaPress(item)}
        activeOpacity={0.85}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📖</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
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
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari komik / manga..."
          placeholderTextColor="#9AA0B4"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => executeSearch(query)}
          returnKeyType="search"
          autoFocus={!route.params?.initialQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearchedTerm(''); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Result Heading matching Mockup */}
      {searchedTerm.length > 0 && (
        <Text style={styles.resultHeader}>
          Hasil pencarian "{searchedTerm}"
        </Text>
      )}

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#56B8A5" />
          <Text style={styles.loadingText}>Mencari komik...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderComicCard}
          keyExtractor={(item, index) => (item.slug || index.toString())}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : searchedTerm ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ditemukan komik untuk "{searchedTerm}"</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ketik judul manga, manhwa, atau manhua yang ingin kamu baca</Text>
        </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F5FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C202E',
  },
  clearIcon: {
    fontSize: 16,
    color: '#8E94A4',
    padding: 4,
  },
  resultHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C202E',
    marginBottom: 16,
    marginTop: 6,
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
  placeholderText: {
    fontSize: 26,
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
    marginBottom: 8,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#8E94A4',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchScreen;
