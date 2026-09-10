import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import Header from '../components/Header';
import StatusCard from '../components/StatusCard';
import SummaryStats from '../components/SummaryStats';
import { Calendar } from 'lucide-react-native';

export default function DashboardScreen({ onNavigateHistory }) {
  const { refreshAttendance } = useAttendance();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAttendance();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
      >
        {/* Status Check-in / Check-out Card */}
        <StatusCard />

        {/* 30-Day Summary Statistics */}
        <SummaryStats />

        {/* View Attendance History Navigation Button */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={onNavigateHistory}
          activeOpacity={0.8}
        >
          <Calendar size={18} color="#6366F1" style={{ marginRight: 8 }} />
          <Text style={styles.historyBtnText}>View Attendance History</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
});
