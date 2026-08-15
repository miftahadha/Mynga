import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const LibraryScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Perpustakaan Saya</Text>
      
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('Bookmarks')}
        activeOpacity={0.8}
      >
        <Text style={styles.optionIcon}>🔖</Text>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionText}>Bookmark Tersimpan</Text>
          <Text style={styles.optionSubText}>Daftar komik favorit kamu</Text>
        </View>
        <Text style={styles.arrow}>➔</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => navigation.navigate('History')}
        activeOpacity={0.8}
      >
        <Text style={styles.optionIcon}>🕒</Text>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionText}>Riwayat Membaca</Text>
          <Text style={styles.optionSubText}>Lanjutkan chapter terakhir</Text>
        </View>
        <Text style={styles.arrow}>➔</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#121212',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionSubText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    color: '#e63946',
    fontWeight: 'bold',
  },
});

export default LibraryScreen;
