import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AttendanceProvider } from './src/context/AttendanceContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LoadingState from './src/components/LoadingState';
import BottomTabBar from './src/components/BottomTabBar';

function AuthenticatedApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const { colors, isDark } = useTheme();

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
      <View style={[styles.appFrame, { backgroundColor: colors.background }]}>
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
  const { colors, isDark } = useTheme();

  if (isRestoringSession) {
    return <LoadingState message="Starting Promise Attendance..." />;
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
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
      <ThemeProvider>
        <AuthProvider>
          <MainNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
  },
  screenContainer: {
    flex: 1,
  },
});
