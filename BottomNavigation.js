import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const BottomNavigation = () => {
  const navigation = useNavigation();

  // Get current active route name
  const currentRouteName = useNavigationState((state) => {
    if (!state || !state.routes || state.routes.length === 0) return 'Home';
    return state.routes[state.index]?.name || 'Home';
  });

  const navItems = [
    {
      name: 'Home',
      label: 'Home',
      type: 'ionicons',
      activeIcon: 'home',
      inactiveIcon: 'home',
    },
    {
      name: 'Komik',
      label: 'Komik',
      type: 'ionicons',
      activeIcon: 'book',
      inactiveIcon: 'book',
    },
    {
      name: 'Search',
      label: 'Search',
      type: 'ionicons',
      activeIcon: 'search',
      inactiveIcon: 'search-outline',
    },
    {
      name: 'Akun',
      label: 'Akun',
      type: 'ionicons',
      activeIcon: 'person',
      inactiveIcon: 'person',
    },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive =
          currentRouteName === item.name ||
          (item.name === 'Komik' && currentRouteName === 'Genre');

        const iconColor = isActive ? '#56B8A5' : '#D2D7E5';
        const iconName = isActive ? item.activeIcon : item.inactiveIcon;

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.name)}
            activeOpacity={0.7}
          >
            {/* Mint teal active top indicator bar matching screenshot */}
            <View style={[styles.indicator, isActive && styles.activeIndicator]} />

            {/* Vector Icon */}
            <Ionicons name={iconName} size={24} color={iconColor} style={styles.icon} />

            {/* Label Text */}
            <Text style={[styles.navLabel, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 0,
  },
  indicator: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  activeIndicator: {
    backgroundColor: '#56B8A5',
  },
  icon: {
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9EA5BA',
  },
  activeLabel: {
    color: '#56B8A5',
    fontWeight: '700',
  },
});

export default BottomNavigation;
