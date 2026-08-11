import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const appLogo = require('../../assets/app_logo.png');

const STATIONS = [
  { id: 'stitching', name: 'Stitching Dept', icon: 'git-network-outline', badgeColor: colors.stitching },
  { id: 'packing', name: 'Packing Dept', icon: 'cube-outline', badgeColor: colors.packing },
  { id: 'cutting', name: 'Cutting Dept', icon: 'cut-outline', badgeColor: colors.cutting },
  { id: 'supervisor', name: 'Supervisor', icon: 'shield-checkmark-outline', badgeColor: colors.accentGold },
];

export default function LoginScreen({ navigation }) {
  const [operatorId, setOperatorId] = useState('ST-708');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStation, setSelectedStation] = useState('stitching');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeLogin = (stationId, opId, pass) => {
    setErrorMessage('');
    if (!opId.trim()) {
      setErrorMessage('Please enter your Operator ID or Username');
      return;
    }
    if (!pass.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigation.replace('LotList', {
        department: 'Stitching',
        departmentId: 'stitching',
      });
    }, 500);
  };


  const handleLogin = () => {
    executeLogin(selectedStation, operatorId, password);
  };

  const handleDemoFillAndLogin = (stationId) => {
    const defaultOpId = stationId === 'stitching' ? 'ST-708' : 'PK-302';
    setSelectedStation(stationId);
    setOperatorId(defaultOpId);
    setPassword('demo1234');
    executeLogin(stationId, defaultOpId, 'demo1234');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0F172A', '#1E3A8A', '#0F172A']}
        style={styles.gradientContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Elegant Header with Generated Logo Icon */}
            <View style={styles.header}>
              <View style={styles.logoCircleWrapper}>
                <Image source={appLogo} style={styles.logoImage} resizeMode="contain" />
              </View>

              <View style={styles.securityBadge}>
                <Ionicons name="lock-closed" size={12} color="#38BDF8" />
                <Text style={styles.securityBadgeText}>SECURE ENTERPRISE PORTAL</Text>
              </View>

              <Text style={styles.headerTitle}>GARMENT LOT ISSUE PORTAL</Text>
              <Text style={styles.headerSubtitle}>
                Department Dispatch & Production Management System
              </Text>
            </View>

            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Glassmorphism Lock Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderStrip}>
                <Ionicons name="key-outline" size={16} color={colors.primary} />
                <Text style={styles.cardHeaderTitle}>OPERATOR AUTHENTICATION</Text>
              </View>

              {/* Operator ID Field */}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Operator / Supervisor ID</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. ST-708 or PK-302"
                    placeholderTextColor={colors.textMuted}
                    value={operatorId}
                    onChangeText={setOperatorId}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Options Row */}
              <View style={styles.optionsRow}>
                <View style={styles.rememberRow}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: '#CBD5E1', true: colors.primary }}
                    thumbColor={colors.white}
                  />
                  <Text style={styles.rememberText}>Remember Credentials</Text>
                </View>
              </View>

              {/* Quick Demo Shortcuts */}
              <View style={styles.demoShortcutsContainer}>
                <TouchableOpacity
                  onPress={() => handleDemoFillAndLogin('stitching')}
                  style={[styles.demoPill, { borderColor: colors.stitching }]}
                >
                  <Ionicons name="git-network-outline" size={14} color={colors.stitching} />
                  <Text style={[styles.demoPillText, { color: colors.stitching }]}>Open Stitching Lots</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDemoFillAndLogin('packing')}
                  style={[styles.demoPill, { borderColor: colors.packing }]}
                >
                  <Ionicons name="cube-outline" size={14} color={colors.packing} />
                  <Text style={[styles.demoPillText, { color: colors.packing }]}>Open Packing Lots</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Login Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
                style={styles.loginBtnWrapper}
              >
                <LinearGradient
                  colors={colors.blueGradient}
                  style={styles.loginBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.loginBtnText}>
                        SIGN IN TO LOT ISSUE SYSTEM
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            </View>

            {/* Lock Screen Encryption Footer */}
            <View style={styles.footerEncryptionBox}>
              <Ionicons name="shield-checkmark" size={16} color="#38BDF8" />
              <Text style={styles.footerEncryptionText}>
                256-BIT ENCRYPTED GOOGLE SHEETS API SYNC • PRODUCTION v1.0
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradientContainer: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircleWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Platform.select({
      web: { boxShadow: '0px 8px 24px rgba(56, 189, 248, 0.3)' },
      default: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 10,
  },
  securityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorBg,
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 18,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 22,
    ...Platform.select({
      web: { boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.18)' },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 18,
        elevation: 8,
      },
    }),
  },
  cardHeaderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stationsScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  stationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  stationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stationTextActive: {
    color: colors.white,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  demoShortcutsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: colors.inputBg,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  loginBtnWrapper: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 4px 16px rgba(30, 64, 175, 0.35)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  loginBtn: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  footerEncryptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  footerEncryptionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
