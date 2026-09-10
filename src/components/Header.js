import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { LogOut } from 'lucide-react-native';

export default function Header() {
  const { authUser, logout, isActionLoading } = useAttendance();
  const displayName = authUser?.name || 'Employee';

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Text style={styles.appTitle}>Promise Attendance</Text>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logout}
          disabled={isActionLoading}
          activeOpacity={0.7}
        >
          <LogOut size={16} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>Welcome, {displayName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },
  welcomeText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

