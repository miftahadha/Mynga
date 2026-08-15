import React, { useRef, useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './context/UserContext';
import HomeScreen from './components/HomeScreen';
import KomikScreen from './components/KomikScreen';
import SearchScreen from './components/SearchScreen';
import ProfileScreen from './components/ProfileScreen';
import DetailScreen from './components/DetailScreen';
import ReadScreen from './components/ReadScreen';
import BookmarksScreen from './components/BookmarksScreen';
import ReadingHistoryScreen from './components/ReadingHistoryScreen';
import BottomNavigation from './BottomNavigation';

const Stack = createStackNavigator();

const App = () => {
  const navigationRef = useRef(null);
  const [routeName, setRouteName] = useState('Home');

  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute();
      setRouteName(currentRoute?.name || 'Home');
    });

    return unsubscribe;
  }, []);

  const shouldShowBottomNav = ['Home', 'Komik', 'Search', 'Akun'].includes(routeName);

  return (
    <UserProvider>
      <NavigationContainer
        ref={navigationRef}
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: '#F9FAFC',
            card: '#FFFFFF',
            text: '#1C202E',
            border: '#F0F2F6',
          },
        }}
      >
        <StatusBar style={routeName === 'Read' ? 'light' : 'dark'} />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#F9FAFC' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Komik" component={KomikScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Akun" component={ProfileScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Read" component={ReadScreen} />
          <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          <Stack.Screen name="History" component={ReadingHistoryScreen} />
        </Stack.Navigator>
        {shouldShowBottomNav && <BottomNavigation />}
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
