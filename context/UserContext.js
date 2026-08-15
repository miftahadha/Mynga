import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = '@mynga_user_profile';

const defaultProfile = {
  name: 'Miftah Adha',
  email: 'miftahadha@example.com',
  bio: 'Manga & Comic Enthusiast',
  avatarColor: '#56B8A5',
};

export const UserContext = createContext({
  user: defaultProfile,
  updateUser: async () => {},
  resetUser: async () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultProfile));
        }
      } catch (e) {
        console.error('Error loading user profile:', e);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const updateUser = async (newUserData) => {
    try {
      const updated = { ...user, ...newUserData };
      setUser(updated);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Error updating user profile:', e);
      return false;
    }
  };

  const resetUser = async () => {
    try {
      setUser(defaultProfile);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultProfile));
      return true;
    } catch (e) {
      console.error('Error resetting user profile:', e);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser, resetUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
