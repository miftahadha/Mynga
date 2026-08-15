import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';

export const UserAvatar = ({ size = 52 }) => {
  return (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
      {/* Fox Avatar */}
      <View style={styles.avatarInner}>
        <Text style={{ fontSize: size * 0.55 }}>🦊</Text>
      </View>
    </View>
  );
};

const UserHeader = ({ onAvatarPress }) => {
  const { user } = useUser();
  const navigation = useNavigation();

  const handlePress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      navigation.navigate('Akun');
    }
  };

  return (
    <TouchableOpacity style={styles.headerContainer} onPress={handlePress} activeOpacity={0.8}>
      <UserAvatar size={54} />
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>Selamat datang,</Text>
        <Text style={styles.userName} numberOfLines={1}>
          {user?.name || 'Miftah Adha'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarContainer: {
    backgroundColor: '#E6F6F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D0EFE8',
    overflow: 'hidden',
  },
  avatarInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 14,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#8E94A4',
    fontWeight: '400',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C202E',
    marginTop: 2,
  },
});

export default UserHeader;
