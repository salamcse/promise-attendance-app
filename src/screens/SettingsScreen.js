import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { testApiEndpoint, PROD_BASE_URL, DEV_BASE_URL } from '../services/apiService';
import { Settings, Server, User, ShieldAlert, CheckCircle2, Zap, HelpCircle, Lock, Globe } from 'lucide-react-native';

export default function SettingsScreen() {
  const { apiConfig, updateApiConfig, isAdmin, authUser } = useAttendance();

  const [mode, setMode] = useState(apiConfig?.mode || 'custom');
  const [baseUrl, setBaseUrl] = useState(apiConfig?.baseUrl || PROD_BASE_URL);
  const [authToken, setAuthToken] = useState(apiConfig?.authToken || '');
  const [employeeId, setEmployeeId] = useState(apiConfig?.employeeId || 'EMP-9824');
  const [employeeName, setEmployeeName] = useState(authUser?.name || apiConfig?.employeeName || 'Md Abdus Salam');
  const [department, setDepartment] = useState(apiConfig?.department || 'Engineering');

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (apiConfig) {
      setMode(apiConfig.mode || 'custom');
      setBaseUrl(apiConfig.baseUrl || PROD_BASE_URL);
      setAuthToken(apiConfig.authToken || '');
      setEmployeeId(apiConfig.employeeId || 'EMP-9824');
      setEmployeeName(authUser?.name || apiConfig.employeeName || 'Md Abdus Salam');
      setDepartment(apiConfig.department || 'Engineering');
    }
  }, [apiConfig, authUser]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateApiConfig({
        mode,
        baseUrl,
        authToken,
        employeeId,
        employeeName,
        department,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!baseUrl) {
      setTestResult({ ok: false, message: 'Please enter a Base API URL first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testApiEndpoint(baseUrl, authToken);
    setTestResult(res);
    setIsTesting(false);
  };

  // Restricted view for non-admin users
  if (!isAdmin) {
    return (
      <View style={styles.restrictedContainer}>
        <View style={styles.restrictedCard}>
          <View style={styles.lockCircle}>
            <Lock size={32} color="#F59E0B" />
          </View>
          <Text style={styles.restrictedTitle}>Admin Access Required</Text>
          <Text style={styles.restrictedSub}>
            Only System Administrators can configure API endpoints ({baseUrl}).
          </Text>
          <View style={styles.userBadge}>
            <User size={14} color="#94A3B8" style={{ marginRight: 6 }} />
            <Text style={styles.userBadgeText}>
              Logged in as: {authUser?.name || 'Staff User'} ({authUser?.phone || 'Standard User'})
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Title */}
      <View style={styles.titleCard}>
        <Settings size={22} color="#6366F1" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.mainTitle}>Admin API Configuration</Text>
          <Text style={styles.mainSub} numberOfLines={1} ellipsizeMode="tail">
            Active Endpoint: {baseUrl}
          </Text>
        </View>
      </View>

      {/* Admin Authorization Badge */}
      <View style={styles.adminBanner}>
        <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 8 }} />
        <Text style={styles.adminBannerText}>
          Admin Privileges Verified — Full API Settings Control Enabled
        </Text>
      </View>

      {/* Mode Switch Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Server size={18} color="#38BDF8" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Backend API Mode Selection</Text>
        </View>

        <View style={styles.modeToggleBox}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'custom' && styles.modeBtnActiveCustom]}
            onPress={() => setMode('custom')}
            activeOpacity={0.8}
          >
            <Server size={16} color={mode === 'custom' ? '#10B981' : '#94A3B8'} style={{ marginRight: 6 }} />
            <Text style={[styles.modeBtnText, mode === 'custom' && styles.modeBtnTextActive]}>
              Enterprise API ({baseUrl.includes('spider.promiseassets.com') ? 'Production' : 'Custom'})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mode === 'mock' && styles.modeBtnActiveMock]}
            onPress={() => setMode('mock')}
            activeOpacity={0.8}
          >
            <Zap size={16} color={mode === 'mock' ? '#38BDF8' : '#94A3B8'} style={{ marginRight: 6 }} />
            <Text style={[styles.modeBtnText, mode === 'mock' && styles.modeBtnTextActive]}>
              Mock Mode (Local Offline)
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'mock' ? (
          <View style={styles.infoBanner}>
            <CheckCircle2 size={16} color="#38BDF8" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Currently running in <Text style={{ fontWeight: '700', color: '#F8FAFC' }}>Mock Mode</Text>. Attendance logs are securely tracked and saved locally in AsyncStorage.
            </Text>
          </View>
        ) : (
          <View style={styles.customApiBox}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.fieldLabel}>Real Backend API Base URL</Text>
            </View>

            {/* Environment Quick Presets */}
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={[styles.presetBtn, baseUrl === PROD_BASE_URL && styles.presetBtnActive]}
                onPress={() => setBaseUrl(PROD_BASE_URL)}
                activeOpacity={0.7}
              >
                <Globe size={13} color={baseUrl === PROD_BASE_URL ? '#818CF8' : '#94A3B8'} style={{ marginRight: 5 }} />
                <Text style={[styles.presetBtnText, baseUrl === PROD_BASE_URL && styles.presetBtnTextActive]}>
                  Production (spider.promiseassets.com)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetBtn, baseUrl === DEV_BASE_URL && styles.presetBtnActive]}
                onPress={() => setBaseUrl(DEV_BASE_URL)}
                activeOpacity={0.7}
              >
                <Server size={13} color={baseUrl === DEV_BASE_URL ? '#818CF8' : '#94A3B8'} style={{ marginRight: 5 }} />
                <Text style={[styles.presetBtnText, baseUrl === DEV_BASE_URL && styles.presetBtnTextActive]}>
                  Local Dev (127.0.0.1:8000)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              value={baseUrl}
              onChangeText={setBaseUrl}
              placeholder={PROD_BASE_URL}
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>Authorization Bearer Token (Optional Override)</Text>
            <TextInput
              style={styles.input}
              value={authToken}
              onChangeText={setAuthToken}
              placeholder="eyJhbGciOiJIUzI1Ni..."
              placeholderTextColor="#64748B"
              secureTextEntry={true}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.testBtnText}>Test API Connection</Text>
              )}
            </TouchableOpacity>

            {testResult && (
              <View
                style={[
                  styles.testResultBox,
                  testResult.ok ? styles.resultSuccess : styles.resultError,
                ]}
              >
                {testResult.ok ? (
                  <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 6 }} />
                ) : (
                  <ShieldAlert size={16} color="#EF4444" style={{ marginRight: 6 }} />
                )}
                <Text
                  style={[
                    styles.resultText,
                    { color: testResult.ok ? '#34D399' : '#F87171' },
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Employee Profile Card */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <User size={18} color="#A855F7" style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Employee Metadata</Text>
        </View>

        <Text style={styles.fieldLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={employeeName}
          onChangeText={setEmployeeName}
          placeholder="Md Abdus Salam"
          placeholderTextColor="#64748B"
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Employee ID</Text>
            <TextInput
              style={styles.input}
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="EMP-9824"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Department</Text>
            <TextInput
              style={styles.input}
              value={department}
              onChangeText={setDepartment}
              placeholder="Engineering"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={isSaving}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveBtnText}>
            {saveSuccess ? 'API Settings Saved!' : 'Save Admin Configuration'}
          </Text>
        )}
      </TouchableOpacity>

      {/* API Contract Guidance */}
      <View style={styles.guideCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <HelpCircle size={16} color="#818CF8" style={{ marginRight: 6 }} />
          <Text style={styles.guideTitle}>Promise Enterprise API Specifications</Text>
        </View>
        <Text style={styles.guideText}>
          Connected Endpoints on <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>{baseUrl}</Text>:
          {"\n"}• <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>POST /clock-in</Text>
          {"\n"}• <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>POST /clock-out</Text>
          {"\n"}• <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>GET /status</Text>
        </Text>
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
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  restrictedCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  restrictedSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userBadgeText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  mainSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  adminBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modeToggleBox: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeBtnActiveMock: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  modeBtnActiveCustom: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  infoText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 16,
  },
  customApiBox: {
    gap: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: '#6366F1',
  },
  presetBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  presetBtnTextActive: {
    color: '#A5B4FC',
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  testBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  testResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  resultSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  guideCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#818CF8',
  },
  guideText: {
    fontSize: 12,
    color: '#C7D2FE',
    lineHeight: 18,
  },
});
