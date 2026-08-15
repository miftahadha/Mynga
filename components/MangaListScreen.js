import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getByGenre } from '../services/komikuApi';

export default function MangaListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const genre = route.params?.genre || 'shounen';
  const genreTitle = route.params?.genreTitle || genre;

  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: `Genre: ${genreTitle}`,
      headerStyle: { backgroundColor: '#121212' },
      headerTintColor: '#fff',
    });

    const fetchMangaByGenre = async () => {
      setLoading(true);
      try {
        const data = await getByGenre(genre, 1);
        setMangaList(data || []);
      } catch (error) {
        console.error('Failed to fetch manga by genre:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaByGenre();
  }, [genre]);

  const handleItemPress = (item) => {
    const endpoint = item.endpoint || item.param || item.id || '';
    const thumbnail = item.thumbnail || item.image || item.thumb || '';
    const title = item.title || item.name || '';
    navigation.navigate('Detail', {
      endpoint,
      mangaId: endpoint,
      mangaThumbnails: thumbnail,
      thumbnail,
      title,
    });
  };

  const renderItem = ({ item }) => {
    const thumbnail = item.thumbnail || item.image || item.thumb;
    const title = item.title || item.name || 'Untitled';
    const desc = item.desc || item.description || item.type || '';

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={styles.card}
        activeOpacity={0.8}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {desc ? (
            <Text style={styles.desc} numberOfLines={2}>{desc}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e63946" />
          <Text style={styles.loadingText}>Memuat daftar komik...</Text>
        </View>
      ) : mangaList.length > 0 ? (
        <FlatList
          data={mangaList}
          keyExtractor={(item, index) => (item.endpoint || item.id || index.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada komik ditemukan untuk genre ini.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingVertical: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  thumbnail: {
    width: 80,
    height: 115,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#777',
    fontSize: 11,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
});
