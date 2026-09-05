import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import StatusCard from '../components/StatusCard';
import LocationCard from '../components/LocationCard';
import IpCard from '../components/IpCard';
import { UserCheck, ShieldCheck, History, ArrowRight, Layers, LogOut } from 'lucide-react-native';

export default function DashboardScreen({ onNavigateHistory, onNavigateSettings }) {
  const { authUser, isAdmin, attendanceLogs, logout } = useAttendance();
  const recentLogs = attendanceLogs.slice(0, 2);

  const displayName = authUser?.name || 'Employee';
  const displayPhone = authUser?.phone || '';
  const avatarLetters = displayName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'EM';
  const roleLabel = isAdmin ? 'Administrator' : 'Employee';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View style={[styles.avatarCircle, isAdmin && styles.avatarCircleAdmin]}>
          <Text style={styles.avatarText}>{avatarLetters}</Text>
        </View>
        <View style={styles.welcomeInfo}>
          <Text style={styles.welcomeTitle}>Welcome, {displayName}</Text>
          <View style={styles.roleTagRow}>
            <View style={[styles.rolePill, isAdmin ? styles.rolePillAdmin : styles.rolePillEmployee]}>
              <Text style={[styles.rolePillText, isAdmin ? styles.rolePillTextAdmin : styles.rolePillTextEmployee]}>
                {roleLabel}
              </Text>
            </View>
            {displayPhone ? (
              <Text style={styles.phoneText}>{displayPhone}</Text>
            ) : null}
          </View>
        </View>

        {/* Quick Profile Logout Action */}
        <TouchableOpacity
          style={styles.bannerLogoutBtn}
          onPress={logout}
          activeOpacity={0.7}
          accessibilityLabel="Logout"
        >
          <LogOut size={15} color="#EF4444" style={{ marginRight: 4 }} />
          <Text style={styles.bannerLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Clock In / Clock Out Card */}
      <StatusCard />

      {/* Real-time Location & IP Metrics Cards */}
      <Text style={styles.sectionHeader}>LIVE VERIFICATION METRICS</Text>
      <LocationCard />
      <IpCard />

      {/* Recent Activity Section */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <History size={16} color="#6366F1" style={{ marginRight: 6 }} />
            <Text style={styles.recentTitle}>Recent Attendance Activity</Text>
          </View>

          <TouchableOpacity onPress={onNavigateHistory} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.viewAllText}>View All</Text>
            <ArrowRight size={14} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {recentLogs.length > 0 ? (
          recentLogs.map((log) => {
            const dateStr = new Date(log.clockInTime).toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const inTimeStr = new Date(log.clockInTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const outTimeStr = log.clockOutTime
              ? new Date(log.clockOutTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'In Progress';

            const hrs = Math.floor((log.durationSeconds || 0) / 3600);
            const mins = Math.floor(((log.durationSeconds || 0) % 3600) / 60);

            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logLeft}>
                  <View style={styles.logDot} />
                  <View>
                    <Text style={styles.logDate}>{dateStr}</Text>
                    <Text style={styles.logTimes}>
                      {inTimeStr} → {outTimeStr}
                    </Text>
                    <Text style={styles.logMeta} numberOfLines={1}>
                      IP: {log.clockInIp?.ip || 'N/A'} • {log.clockInLocation?.address || `${log.clockInLocation?.latitude}°, ${log.clockInLocation?.longitude}°`}
                    </Text>
                  </View>
                </View>

                <View style={styles.logRight}>
                  <Text style={styles.durationVal}>
                    {log.durationSeconds ? `${hrs}h ${mins}m` : 'Active'}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.emptyText}>No past sessions recorded yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#818CF8',
  },
  avatarCircleAdmin: {
    backgroundColor: '#F59E0B',
    borderColor: '#FCD34D',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 5,
  },
  roleTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  rolePillAdmin: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.4)',
  },
  rolePillEmployee: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.4)',
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rolePillTextAdmin: {
    color: '#FCD34D',
  },
  rolePillTextEmployee: {
    color: '#818CF8',
  },
  phoneText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bannerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginLeft: 8,
    flexShrink: 0,
  },
  bannerLogoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  recentSection: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    marginRight: 4,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  logDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  logTimes: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  logMeta: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  logRight: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
