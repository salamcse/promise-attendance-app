import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { AttendanceProvider, useAttendance } from './src/context/AttendanceContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';

function MainNavigator() {
  const { isAuthenticated, isAuthLoading } = useAttendance();
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.appFrame}>
        {currentScreen === 'history' ? (
          <HistoryScreen onBack={() => setCurrentScreen('dashboard')} />
        ) : (
          <DashboardScreen onNavigateHistory={() => setCurrentScreen('history')} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <MainNavigator />
    </AttendanceProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    backgroundColor: '#0F172A',
  },
});
