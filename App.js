import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { AttendanceProvider, useAttendance } from './src/context/AttendanceContext';
import Header from './src/components/Header';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';

function MainAppContent() {
  const { isAuthenticated, isAdmin } = useAttendance();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!isAdmin && activeTab === 'settings') {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Central App Frame */}
      <View style={styles.appFrame}>
        {/* Top App Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => {
            if (isAdmin) setActiveTab('settings');
          }}
        />

        {/* Screen Body */}
        <View style={styles.screenBody}>
          {activeTab === 'dashboard' && (
            <DashboardScreen
              onNavigateHistory={() => setActiveTab('history')}
              onNavigateSettings={() => {
                if (isAdmin) setActiveTab('settings');
              }}
            />
          )}

          {activeTab === 'history' && <HistoryScreen />}

          {activeTab === 'settings' && isAdmin && <SettingsScreen />}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <MainAppContent />
    </AttendanceProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    backgroundColor: '#0F172A',
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 25,
          maxHeight: '100vh',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#1E293B',
        }
      : {}),
  },
  screenBody: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
