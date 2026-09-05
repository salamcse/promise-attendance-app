import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { Clock, Settings, LogOut } from 'lucide-react-native';

export default function Header({ activeTab, setActiveTab, onOpenSettings }) {
  const { isClockedIn, apiConfig, logout, authUser, isAdmin } = useAttendance();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <View style={styles.iconBadge}>
            <Clock size={22} color="#6366F1" />
          </View>
          <View>
            <Text style={styles.appTitle}>TimePulse</Text>
            <Text style={styles.appSubtitle}>Smart Location & IP Attendance</Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.apiBadgeBtn}
              onPress={onOpenSettings}
              activeOpacity={0.8}
            >
              <View style={[styles.apiDot, apiConfig?.mode === 'custom' ? styles.dotCustom : styles.dotMock]} />
              <Text style={styles.apiModeText}>
                {apiConfig?.mode === 'custom' ? 'Real API' : 'Mock API'}
              </Text>
              <Settings size={14} color="#94A3B8" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.logoutBadgeBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <LogOut size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timeRow}>
        <View>
          <Text style={styles.timeText}>{timeStr || '10:45:00 AM'}</Text>
          <Text style={styles.dateText}>{dateStr || 'Saturday, Sep 5'}</Text>
        </View>

        <View style={[styles.statusBadge, isClockedIn ? styles.statusClockedIn : styles.statusClockedOut]}>
          <View style={[styles.statusPulse, isClockedIn ? styles.pulseGreen : styles.pulseGray]} />
          <Text style={[styles.statusText, isClockedIn ? styles.textGreen : styles.textGray]}>
            {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
          </Text>
        </View>
      </View>

      {/* Navigation Tabs - API & Profile tab strictly visible to Admin only */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'history' && styles.tabItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Attendance Log
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
              API & Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0F172A',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  apiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotMock: {
    backgroundColor: '#38BDF8',
  },
  dotCustom: {
    backgroundColor: '#10B981',
  },
  apiModeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  logoutBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  statusClockedIn: {
    backgroundColor: '#064E3B',
    borderColor: '#059669',
  },
  statusClockedOut: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  statusPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pulseGreen: {
    backgroundColor: '#10B981',
  },
  pulseGray: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textGreen: {
    color: '#34D399',
  },
  textGray: {
    color: '#CBD5E1',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
