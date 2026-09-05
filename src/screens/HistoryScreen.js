import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { Calendar, Clock, MapPin, Wifi, CheckCircle2, ChevronRight, X, Trash2, ShieldCheck, FileText, MessageSquare } from 'lucide-react-native';

export default function HistoryScreen() {
  const { attendanceLogs, activeSession, handleClearLogs } = useAttendance();
  const [selectedSession, setSelectedSession] = useState(null);

  const totalSecondsWorked = attendanceLogs.reduce(
    (acc, log) => acc + (log.durationSeconds || 0),
    0
  );
  const totalHours = (totalSecondsWorked / 3600).toFixed(1);

  const formatSecsToHrsMins = (totalSec) => {
    if (!totalSec) return '0h 0m';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Total Stats Summary Header */}
      <View style={styles.statsCard}>
        <View style={styles.statCell}>
          <Text style={styles.statVal}>{attendanceLogs.length}</Text>
          <Text style={styles.statLabel}>Total Shifts</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <Text style={styles.statVal}>{totalHours}h</Text>
          <Text style={styles.statLabel}>Total Work Hours</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCell}>
          <Text style={[styles.statVal, { color: '#10B981' }]}>100%</Text>
          <Text style={styles.statLabel}>Verified Logins</Text>
        </View>
      </View>

      {/* Logs List Header */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>Attendance Audit Log</Text>
        {attendanceLogs.length > 0 && (
          <TouchableOpacity onPress={handleClearLogs} style={styles.clearBtn}>
            <Trash2 size={14} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.clearText}>Clear History</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Session Warning Badge if Clocked In */}
      {activeSession && (
        <View style={styles.activeBanner}>
          <Clock size={16} color="#10B981" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activeTitle}>Active Shift In Progress</Text>
            <Text style={styles.activeSub}>
              Clocked in at {new Date(activeSession.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • IP: {activeSession.clockInIp?.ip}
              {activeSession.clockInComment ? ` • Note: "${activeSession.clockInComment}"` : ''}
            </Text>
          </View>
        </View>
      )}

      {/* History Items */}
      {attendanceLogs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={48} color="#334155" />
          <Text style={styles.emptyTitle}>No Attendance Records</Text>
          <Text style={styles.emptySub}>
            Clock in on the Dashboard to start tracking location & IP attendance history.
          </Text>
        </View>
      ) : (
        attendanceLogs.map((item) => {
          const clockInDate = new Date(item.clockInTime);
          const dateFormatted = clockInDate.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const inTime = clockInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const outTime = item.clockOutTime
            ? new Date(item.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'In Progress';

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.historyCard}
              onPress={() => setSelectedSession(item)}
              activeOpacity={0.8}
            >
              <View style={styles.historyTop}>
                <View style={styles.dateBadge}>
                  <Calendar size={13} color="#6366F1" style={{ marginRight: 6 }} />
                  <Text style={styles.dateBadgeText}>{dateFormatted}</Text>
                </View>

                <View style={styles.durationBadge}>
                  <Text style={styles.durationBadgeText}>
                    {formatSecsToHrsMins(item.durationSeconds)}
                  </Text>
                </View>
              </View>

              <View style={styles.timeBox}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeLabel}>Clock In</Text>
                  <Text style={styles.timeVal}>{inTime}</Text>
                </View>

                <View style={styles.arrowBox}>
                  <Text style={styles.arrowText}>→</Text>
                </View>

                <View style={styles.timeCol}>
                  <Text style={styles.timeLabel}>Clock Out</Text>
                  <Text style={styles.timeVal}>{outTime}</Text>
                </View>
              </View>

              {(item.clockInComment || item.clockOutComment) && (
                <View style={styles.commentBox}>
                  <MessageSquare size={12} color="#38BDF8" style={{ marginRight: 6 }} />
                  <Text style={styles.commentText} numberOfLines={1}>
                    {item.clockInComment || item.clockOutComment}
                  </Text>
                </View>
              )}

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={12} color="#38BDF8" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.clockInLocation?.address || `${item.clockInLocation?.latitude}°, ${item.clockInLocation?.longitude}°`}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Wifi size={12} color="#A855F7" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.clockInIp?.ip || 'IP Logged'}
                  </Text>
                </View>

                <ChevronRight size={16} color="#64748B" />
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* Session Details Modal */}
      <Modal
        visible={!!selectedSession}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedSession(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldCheck size={20} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Attendance Audit Detail</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedSession(null)}>
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {selectedSession && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.auditSection}>
                  <Text style={styles.auditSectionTitle}>CLOCK IN DETAILS</Text>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Time:</Text>
                    <Text style={styles.auditVal}>
                      {new Date(selectedSession.clockInTime).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Location:</Text>
                    <Text style={styles.auditVal}>{selectedSession.clockInLocation?.address || 'N/A'}</Text>
                  </View>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Coordinates:</Text>
                    <Text style={styles.auditVal}>
                      {selectedSession.clockInLocation?.latitude}, {selectedSession.clockInLocation?.longitude}
                    </Text>
                  </View>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Public IP:</Text>
                    <Text style={styles.auditVal}>{selectedSession.clockInIp?.ip || 'N/A'}</Text>
                  </View>
                  {selectedSession.clockInComment && (
                    <View style={styles.auditRow}>
                      <Text style={styles.auditLabel}>User Note:</Text>
                      <Text style={[styles.auditVal, { color: '#38BDF8', fontWeight: '700' }]}>
                        "{selectedSession.clockInComment}"
                      </Text>
                    </View>
                  )}
                </View>

                {selectedSession.clockOutTime && (
                  <View style={styles.auditSection}>
                    <Text style={styles.auditSectionTitle}>CLOCK OUT DETAILS</Text>
                    <View style={styles.auditRow}>
                      <Text style={styles.auditLabel}>Time:</Text>
                      <Text style={styles.auditVal}>
                        {new Date(selectedSession.clockOutTime).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.auditRow}>
                      <Text style={styles.auditLabel}>Location:</Text>
                      <Text style={styles.auditVal}>{selectedSession.clockOutLocation?.address || 'N/A'}</Text>
                    </View>
                    <View style={styles.auditRow}>
                      <Text style={styles.auditLabel}>Public IP:</Text>
                      <Text style={styles.auditVal}>{selectedSession.clockOutIp?.ip || 'N/A'}</Text>
                    </View>
                    {selectedSession.clockOutComment && (
                      <View style={styles.auditRow}>
                        <Text style={styles.auditLabel}>User Note:</Text>
                        <Text style={[styles.auditVal, { color: '#F43F5E', fontWeight: '700' }]}>
                          "{selectedSession.clockOutComment}"
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.payloadBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <FileText size={14} color="#6366F1" style={{ marginRight: 6 }} />
                    <Text style={styles.payloadTitle}>Promise-att API Payload Object</Text>
                  </View>
                  <Text style={styles.payloadCode}>
                    {JSON.stringify(selectedSession, null, 2)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  clearText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#059669',
  },
  activeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
  },
  activeSub: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  historyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  durationBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeCol: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  timeVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  arrowBox: {
    paddingHorizontal: 12,
  },
  arrowText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '800',
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  commentText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '600',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalBody: {
    padding: 16,
  },
  auditSection: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  auditSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  auditRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  auditLabel: {
    width: 100,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  auditVal: {
    flex: 1,
    fontSize: 11,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  payloadBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  payloadTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#818CF8',
  },
  payloadCode: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#A7F3D0',
    backgroundColor: '#020617',
    padding: 10,
    borderRadius: 8,
  },
});
