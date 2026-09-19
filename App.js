import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AttendanceProvider } from './src/context/AttendanceContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LoadingState from './src/components/LoadingState';
import BottomTabBar from './src/components/BottomTabBar';
import { COLORS } from './src/constants/theme';

function AuthenticatedApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      if (currentScreen === 'history') {
        setCurrentScreen('dashboard');
        return true; // Handled
      }
      return false; // Exit / minimize app, do not back-navigate to login
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [currentScreen]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.appFrame}>
        <View style={styles.screenContainer}>
          {currentScreen === 'history' ? (
            <HistoryScreen onBack={() => setCurrentScreen('dashboard')} />
          ) : (
            <DashboardScreen onNavigateHistory={() => setCurrentScreen('history')} />
          )}
        </View>
        <BottomTabBar
          activeTab={currentScreen}
          onTabChange={setCurrentScreen}
        />
      </View>
    </SafeAreaView>
  );
}

function MainNavigator() {
  const { isAuthenticated, isRestoringSession } = useAuth();

  if (isRestoringSession) {
    return <LoadingState message="Starting Promise Attendance..." />;
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  // AttendanceProvider ONLY mounts when authenticated
  return (
    <AttendanceProvider>
      <AuthenticatedApp />
    </AttendanceProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.background,
  },
  screenContainer: {
    flex: 1,
  },
});
