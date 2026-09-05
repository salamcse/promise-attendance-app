import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { LogIn, LogOut, Timer, Calendar, CheckCircle2, MessageSquare, Edit3, Flag } from 'lucide-react-native';

export default function StatusCard() {
  const {
    isClockedIn,
    activeSession,
    liveDuration,
    todayTotalDuration,
    todayCompletedSeconds,
    firstClockInToday,
    isActionLoading,
    handleClockIn,
    handleClockOut,
  } = useAttendance();

  const [comment, setComment] = useState('');

  const formatDuration = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const firstClockInFormatted = firstClockInToday
    ? new Date(firstClockInToday).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : activeSession?.firstClockInTime
    ? new Date(activeSession.firstClockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  // When CLOCKED IN: timer moves live (todayTotalDuration).
  // When CLOCKED OUT: timer STOPS moving and freezes at accumulated work duration (todayCompletedSeconds).
  const displayTimerSeconds = isClockedIn ? todayTotalDuration : todayCompletedSeconds;

  const onToggleClock = async () => {
    try {
      if (isClockedIn) {
        const res = await handleClockOut(comment);
        if (res?.isAlreadyClockedOut) {
          const msg = 'Notice: Your shift was already closed on the server.';
          if (typeof alert !== 'undefined') alert(msg);
          else Alert.alert('Shift Closed', msg);
        }
      } else {
        const res = await handleClockIn(comment);
        if (res?.isAlreadyClockedIn) {
          const msg = 'Notice: You were already clocked in on the server. Your active shift has been restored and you can now Clock Out.';
          if (typeof alert !== 'undefined') alert(msg);
          else Alert.alert('Shift Restored', msg);
        }
      }
      setComment('');
    } catch (err) {
      if (typeof alert !== 'undefined') {
        alert(err.message || 'Operation failed');
      } else {
        Alert.alert('Attendance Action Error', err.message || 'Operation failed');
      }
    }
  };

  return (
    <View style={[styles.card, isClockedIn ? styles.cardClockedIn : styles.cardClockedOut]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Timer size={20} color={isClockedIn ? '#10B981' : '#94A3B8'} />
          <Text style={styles.cardTitle}>
            {isClockedIn ? 'Active Work Session' : 'Ready to Start Work'}
          </Text>
        </View>

        {isClockedIn ? (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>TRACKING</Text>
          </View>
        ) : (
          <View style={styles.stoppedIndicator}>
            <Text style={styles.stoppedText}>PAUSED</Text>
          </View>
        )}
      </View>

      {/* Persistent Day's First Clock In Banner */}
      {firstClockInFormatted && (
        <View style={styles.firstInBanner}>
          <Flag size={14} color="#FBBF24" style={{ marginRight: 8 }} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.firstInLabel}>Today's First Login:</Text>
            <Text style={styles.firstInVal}>{firstClockInFormatted}</Text>
          </View>
        </View>
      )}

      {/* Main Timer Display - Moves when Clocked In, STOPS when Clocked Out */}
      <View style={styles.timerBox}>
        <Text style={styles.timerDigits}>
          {formatDuration(displayTimerSeconds)}
        </Text>
        <Text style={styles.timerSubtext}>
          {isClockedIn
            ? `Active Shift: ${formatDuration(liveDuration)} • Total Today: ${formatDuration(todayTotalDuration)}`
            : todayCompletedSeconds > 0
            ? `Timer Stopped (Clocked Out) • Accumulated Work: ${formatDuration(todayCompletedSeconds)}`
            : '00:00:00 - Timer Stopped (Clocked Out)'}
        </Text>
      </View>

      {/* Active Session Meta Info */}
      {isClockedIn && activeSession && (
        <View style={styles.sessionMetaBox}>
          <View style={styles.metaItem}>
            <Calendar size={14} color="#94A3B8" />
            <Text style={styles.metaLabel}>Current Shift Check-In:</Text>
            <Text style={styles.metaVal}>
              {new Date(activeSession.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <CheckCircle2 size={14} color="#10B981" />
            <Text style={styles.metaLabel}>Exact GPS Location:</Text>
            <Text style={styles.metaVal} numberOfLines={2}>
              {activeSession.clockInLocation?.address || `${activeSession.clockInLocation?.latitude}°, ${activeSession.clockInLocation?.longitude}°`}
            </Text>
          </View>

          {activeSession.clockInComment && (
            <View style={styles.metaItem}>
              <MessageSquare size={14} color="#38BDF8" />
              <Text style={styles.metaLabel}>Check-In Note:</Text>
              <Text style={[styles.metaVal, { color: '#38BDF8' }]} numberOfLines={1}>
                "{activeSession.clockInComment}"
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Optional Comment Input Box */}
      <View style={styles.commentInputBox}>
        <View style={styles.commentHeader}>
          <Edit3 size={14} color="#818CF8" style={{ marginRight: 6 }} />
          <Text style={styles.commentTitle}>Optional Attendance Note / Comment</Text>
        </View>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder={
            isClockedIn
              ? 'Add optional clock-out comment (e.g. Completed today tasks)...'
              : 'Add optional clock-in comment (e.g. Working remotely today)...'
          }
          placeholderTextColor="#64748B"
          multiline={false}
          maxLength={150}
        />
      </View>

      {/* Big Action Button */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          isClockedIn ? styles.btnClockOut : styles.btnClockIn,
          isActionLoading && styles.btnDisabled
        ]}
        onPress={onToggleClock}
        disabled={isActionLoading}
        activeOpacity={0.85}
      >
        {isActionLoading ? (
          <View style={styles.btnContent}>
            <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
            <Text style={styles.btnText}>
              {isClockedIn ? 'Capturing Location & Clocking Out...' : 'Capturing Location & Clocking In...'}
            </Text>
          </View>
        ) : (
          <View style={styles.btnContent}>
            {isClockedIn ? (
              <>
                <LogOut size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.btnText}>CLOCK OUT NOW</Text>
              </>
            ) : (
              <>
                <LogIn size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.btnText}>CLOCK IN NOW</Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        {isClockedIn
          ? 'Timer ticks live while clocked in. Clock Out stops time accumulation.'
          : 'Timer is paused while clocked out. Tap Clock In to resume work duration.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  cardClockedIn: {
    borderColor: '#059669',
    backgroundColor: '#064E3B',
  },
  cardClockedOut: {
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginLeft: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  stoppedIndicator: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  stoppedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  firstInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  firstInLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCD34D',
  },
  firstInVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  timerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timerDigits: {
    fontSize: 42,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerSubtext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  sessionMetaBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
    marginRight: 6,
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  commentInputBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
  },
  commentInput: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  btnClockIn: {
    backgroundColor: '#6366F1',
    borderWidth: 1,
    borderColor: '#818CF8',
  },
  btnClockOut: {
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#F87171',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
