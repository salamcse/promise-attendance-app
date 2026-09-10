import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';

export default function HistoryScreen({ onBack }) {
  const { attendanceLogs, refreshAttendance } = useAttendance();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAttendance();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (totalSec) => {
    if (!totalSec) return '0h 00m';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hrs}h ${String(mins).padStart(2, '0')}m`;
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Back Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#F8FAFC" />
          <Text style={styles.headerTitle}>Attendance History</Text>
        </TouchableOpacity>
      </View>

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
        <Text style={styles.sectionTitle}>Last 30 Days</Text>

        {attendanceLogs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Calendar size={40} color="#475569" />
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        ) : (
          attendanceLogs.map((item) => {
            const dateStr = formatDate(item.date || item.clockInTime);
            const inTimeStr = formatTime(item.clockInTime);
            const outTimeStr = item.clockOutTime ? formatTime(item.clockOutTime) : 'Active';
            const durationStr = formatDuration(item.durationSeconds);

            return (
              <View key={item.id || item.clockInTime} style={styles.recordCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.recordDate}>{dateStr}</Text>
                  <View style={styles.durationBadge}>
                    <Clock size={12} color="#818CF8" style={{ marginRight: 4 }} />
                    <Text style={styles.durationText}>{durationStr}</Text>
                  </View>
                </View>

                <View style={styles.timesRow}>
                  <Text style={styles.timesText}>
                    {inTimeStr} → {outTimeStr}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginLeft: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  recordCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
  },
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timesText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 12,
  },
});
