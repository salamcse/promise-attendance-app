import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { Wifi, Globe, ShieldCheck, RefreshCw, Server } from 'lucide-react-native';

export default function IpCard() {
  const { currentIpInfo, refreshLocationAndIp } = useAttendance();
  const { loading, data, error } = currentIpInfo;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Wifi size={18} color="#A855F7" />
          </View>
          <View>
            <Text style={styles.cardTitle}>IP & Network Tracking</Text>
            <Text style={styles.cardSubtitle}>Device Internet Identity</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={refreshLocationAndIp}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#A855F7" />
          ) : (
            <RefreshCw size={16} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>

      {loading && !data ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#A855F7" />
          <Text style={styles.loadingText}>Detecting Public IP & ISP...</Text>
        </View>
      ) : data ? (
        <View style={styles.bodyContent}>
          {/* Main IP Display Box */}
          <View style={styles.ipDisplayBox}>
            <View style={styles.ipLeftGroup}>
              <Globe size={18} color="#C084FC" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.ipLabel}>Public IP Address</Text>
                <Text style={styles.ipValue}>{data.ip}</Text>
              </View>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{data.connectionType || 'Broadband'}</Text>
            </View>
          </View>

          {/* Network ISP Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Server size={14} color="#94A3B8" style={{ marginRight: 6 }} />
              <Text style={styles.infoLabel}>ISP:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {data.isp || 'Local Provider'}
              </Text>
            </View>

            <View style={styles.infoCell}>
              <ShieldCheck size={14} color="#10B981" style={{ marginRight: 6 }} />
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, { color: '#34D399' }]}>Verified</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error || 'Failed to detect IP address'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  bodyContent: {
    gap: 10,
  },
  ipDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  ipLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ipLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  ipValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  typeBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C084FC',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginRight: 4,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  errorBox: {
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
  },
});
