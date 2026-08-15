import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import UserHeader from './UserHeader';

const ProfileScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const navigation = useNavigation();
  const { user, updateUser, resetUser } = useUser();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Miftah Adha');
  const [emailInput, setEmailInput] = useState(user?.email || 'miftahadha@example.com');
  const [bioInput, setBioInput] = useState(user?.bio || 'Manga Enthusiast');

  const openEditModal = () => {
    setNameInput(user?.name || '');
    setEmailInput(user?.email || '');
    setBioInput(user?.bio || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Peringatan', 'Nama tidak boleh kosong.');
      return;
    }

    const success = await updateUser({
      name: nameInput.trim(),
      email: emailInput.trim(),
      bio: bioInput.trim(),
    });

    if (success) {
      setEditModalVisible(false);
      Alert.alert('Sukses', 'Informasi akun berhasil disimpan ke penyimpanan lokal (AsyncStorage)!');
    } else {
      Alert.alert('Error', 'Gagal menyimpan perubahan.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah kamu yakin ingin keluar dan mereset profil ke nama default?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await resetUser();
            Alert.alert('Info', 'Akun telah direset.');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'info',
      title: 'Informasi Akun',
      iconFamily: 'Ionicons',
      iconName: 'person',
      iconColor: '#1C202E',
      onPress: openEditModal,
    },
    {
      id: 'bookmark',
      title: 'Bookmark',
      iconFamily: 'Ionicons',
      iconName: 'bookmark',
      iconColor: '#1C202E',
      onPress: () => navigation.navigate('Bookmarks'),
    },
    {
      id: 'history',
      title: 'Riwayat Bacaan',
      iconFamily: 'MaterialCommunityIcons',
      iconName: 'book-open-page-variant',
      iconColor: '#1C202E',
      onPress: () => navigation.navigate('History'),
    },
    {
      id: 'logout',
      title: 'Keluar',
      iconFamily: 'Ionicons',
      iconName: 'log-out-outline',
      iconColor: '#E54848',
      isDestructive: true,
      onPress: handleLogout,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* User Profile Header matching Profil.png */}
      <View style={styles.headerSection}>
        <UserHeader onAvatarPress={openEditModal} />
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Akun</Text>

      {/* Menu List matching Profil.png */}
      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {item.iconFamily === 'Ionicons' ? (
                <Ionicons name={item.iconName} size={24} color={item.iconColor} />
              ) : (
                <MaterialCommunityIcons name={item.iconName} size={24} color={item.iconColor} />
              )}
            </View>
            <Text
              style={[
                styles.menuTitle,
                item.isDestructive && styles.destructiveTitle,
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Edit Username Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Informasi Akun</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#8E94A4" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nama Pengguna (Username)</Text>
              <TextInput
                style={styles.textInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Masukkan nama kamu..."
                placeholderTextColor="#9AA0B4"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="nama@email.com"
                placeholderTextColor="#9AA0B4"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Bio / Status</Text>
              <TextInput
                style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                value={bioInput}
                onChangeText={setBioInput}
                placeholder="Tuliskan sesuatu tentang kamu..."
                placeholderTextColor="#9AA0B4"
                multiline
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
                activeOpacity={0.85}
              >
                <Text style={styles.saveButtonText}>Simpan ke AsyncStorage</Text>
              </TouchableOpacity>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C202E',
    marginBottom: 16,
  },
  menuList: {
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 38,
    alignItems: 'flex-start',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C202E',
    marginLeft: 8,
  },
  destructiveTitle: {
    color: '#E54848',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C202E',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E94A4',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#F3F5FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1C202E',
    borderWidth: 1,
    borderColor: '#E6E9F0',
  },
  saveButton: {
    backgroundColor: '#56B8A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
