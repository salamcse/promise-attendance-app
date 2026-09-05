import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { MapPin, RefreshCw, Navigation, AlertCircle, Compass, CheckCircle2 } from 'lucide-react-native';

export default function LocationCard() {
  const { currentLocation, refreshLocationAndIp } = useAttendance();
  const { loading, data, error } = currentLocation;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <MapPin size={18} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.cardTitle}>Exact Geolocation Data</Text>
            <Text style={styles.cardSubtitle}>Real-time Verified GPS Address</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={refreshLocationAndIp}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#38BDF8" />
          ) : (
            <RefreshCw size={16} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>

      {loading && !data ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#38BDF8" />
          <Text style={styles.loadingText}>Fetching exact GPS position...</Text>
        </View>
      ) : data ? (
        <View style={styles.bodyContent}>
          {/* Main Exact Location Box */}
          <View style={styles.addressBox}>
            <Navigation size={18} color="#38BDF8" style={{ marginTop: 2, marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={styles.cityText}>{data.city || `${data.latitude}°, ${data.longitude}°`}</Text>
                <View style={styles.exactBadge}>
                  <CheckCircle2 size={10} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.exactBadgeText}>EXACT GPS</Text>
                </View>
              </View>
              <Text style={styles.fullAddressText}>
                {data.address}
              </Text>
            </View>
          </View>

          {/* Precise Coordinates Grid */}
          <View style={styles.gridRow}>
            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>Exact Latitude</Text>
              <Text style={styles.gridVal}>{data.latitude}°</Text>
            </View>

            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>Exact Longitude</Text>
              <Text style={styles.gridVal}>{data.longitude}°</Text>
            </View>

            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>GPS Accuracy</Text>
              <Text style={[styles.gridVal, { color: data.accuracy <= 20 ? '#34D399' : '#FBBF24' }]}>
                ±{data.accuracy}m
              </Text>
            </View>
          </View>

          {data.isFallback && (
            <View style={styles.fallbackNotice}>
              <AlertCircle size={12} color="#F59E0B" style={{ marginRight: 6 }} />
              <Text style={styles.fallbackText}>
                Demo GPS address active. Enable device location for live satellite GPS.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.errorBox}>
          <AlertCircle size={18} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Unable to fetch exact location'}</Text>
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
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
    gap: 12,
  },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cityText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  exactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  exactBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  fullAddressText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridCell: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  gridVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  fallbackNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  fallbackText: {
    fontSize: 11,
    color: '#FBBF24',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
  },
});
