import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { Lock, Mail, LogIn, Clock, ShieldCheck, Sparkles } from 'lucide-react-native';

export default function LoginScreen() {
  const { login, isAuthLoading } = useAttendance();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLoginSubmit = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setErrorMsg(null);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    }
  };

  const setDemoCredentials = () => {
    setEmail('admin@promiseasset.com');
    setPassword('password123');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Brand Logo Header */}
        <View style={styles.brandGroup}>
          <View style={styles.iconCircle}>
            <Clock size={32} color="#6366F1" />
          </View>
          <Text style={styles.brandTitle}>TimePulse</Text>
          <Text style={styles.brandSub}>Promise Attendance System</Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@promiseasset.com"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              secureTextEntry={true}
            />
          </View>

          {/* Quick Demo Preset Button */}
          <TouchableOpacity style={styles.demoChip} onPress={setDemoCredentials} activeOpacity={0.7}>
            <Sparkles size={14} color="#FBBF24" style={{ marginRight: 6 }} />
            <Text style={styles.demoChipText}>
              Fill Admin Demo (admin@promiseasset.com / password123)
            </Text>
          </TouchableOpacity>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Submit Action Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isAuthLoading && styles.btnDisabled]}
            onPress={handleLoginSubmit}
            disabled={isAuthLoading}
            activeOpacity={0.85}
          >
            {isAuthLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.btnContent}>
                <LogIn size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.loginBtnText}>LOGIN TO TIMEPULSE</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <ShieldCheck size={14} color="#10B981" style={{ marginRight: 6 }} />
          <Text style={styles.footerText}>
            Secured by Promise-Att Backend API (127.0.0.1:8000)
          </Text>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  brandGroup: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#3730A3',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  formGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  demoChipText: {
    fontSize: 11,
    color: '#FCD34D',
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
  },
});
