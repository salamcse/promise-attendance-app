import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';

export default function StatusCard() {
  const {
    isClockedIn,
    liveDuration,
    isActionLoading,
    handleClockIn,
    handleClockOut,
  } = useAttendance();

  const [errorMsg, setErrorMsg] = useState(null);

  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleAction = async () => {
    setErrorMsg(null);
    try {
      if (isClockedIn) {
        await handleClockOut();
      } else {
        await handleClockIn();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Please try again.');
    }
  };

  return (
    <View style={[styles.card, isClockedIn ? styles.cardClockedIn : styles.cardClockedOut]}>
      {/* State Badge */}
      <View style={[styles.badge, isClockedIn ? styles.badgeClockedIn : styles.badgeClockedOut]}>
        <View style={[styles.dot, isClockedIn ? styles.dotGreen : styles.dotGray]} />
        <Text style={[styles.badgeText, isClockedIn ? styles.textGreen : styles.textGray]}>
          {isClockedIn ? 'WORKING' : 'NOT CLOCKED IN'}
        </Text>
      </View>

      {/* Timer */}
      <Text style={styles.timerText}>{formatTime(liveDuration)}</Text>

      {/* Error Message */}
      {errorMsg && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          isClockedIn ? styles.btnClockOut : styles.btnClockIn,
          isActionLoading && styles.btnDisabled,
        ]}
        onPress={handleAction}
        disabled={isActionLoading}
        activeOpacity={0.8}
      >
        {isActionLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.actionBtnText}>
            {isClockedIn ? 'CHECK OUT' : 'CHECK IN'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardClockedIn: {
    borderColor: '#059669',
    backgroundColor: '#0F291E',
  },
  cardClockedOut: {
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeClockedIn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeClockedOut: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotGray: {
    backgroundColor: '#94A3B8',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textGreen: {
    color: '#34D399',
  },
  textGray: {
    color: '#94A3B8',
  },
  timerText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    width: '100%',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnClockIn: {
    backgroundColor: '#6366F1',
  },
  btnClockOut: {
    backgroundColor: '#EF4444',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
