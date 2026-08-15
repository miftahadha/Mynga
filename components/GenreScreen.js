import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllGenres } from '../services/komikuApi';

export default function GenreScreen() {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 40;
  const navigation = useNavigation();
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const list = await getAllGenres();
        setGenres(list || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const handlePress = (item) => {
    const genreSlug = typeof item === 'string' ? item.toLowerCase().replace(/\s+/g, '-') : (item.endpoint || item.title || '').toLowerCase();
    const genreTitle = typeof item === 'string' ? item : (item.title || item.endpoint || 'Genre');
    navigation.navigate('MangaList', { genre: genreSlug, genreTitle });
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <Text style={styles.headerTitle}>Pilih Genre</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e63946" />
          <Text style={styles.loadingText}>Memuat genre...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
          {genres.map((item, index) => {
            const title = typeof item === 'string' ? item : (item.title || item.endpoint);
            return (
              <TouchableOpacity
                key={index.toString()}
                style={styles.genreButton}
                onPress={() => handlePress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.genreText}>{title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  genreButton: {
    width: '48%',
    backgroundColor: '#1e1e1e',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2e2e2e',
    alignItems: 'center',
  },
  genreText: {
    fontSize: 14,
    color: '#f0f0f0',
    fontWeight: '600',
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
});
