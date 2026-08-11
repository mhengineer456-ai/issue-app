import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function LoadingOverlay({
  visible = false,
  title = 'Updating Google Sheets...',
  subTitle = 'Syncing data via Google Apps Script Web App',
  isSuccess = false,
  successMessage = 'Updated Successfully! 🎉',
}) {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Header Strip */}
          <View style={styles.topBanner}>
            <View style={styles.badgeGroup}>
              <Ionicons
                name={isSuccess ? 'checkmark-circle-outline' : 'sync-outline'}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.badgeText}>
                {isSuccess ? 'SYNC COMPLETED' : 'LIVE DATA SYNC'}
              </Text>
            </View>
          </View>

          {/* Body Content */}
          <View style={styles.body}>
            <View style={styles.iconContainer}>
              {isSuccess ? (
                <View style={styles.successCircle}>
                  <Ionicons name="checkmark-sharp" size={32} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.loadingCircle}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            </View>

            <Text style={styles.title}>
              {isSuccess ? successMessage : title}
            </Text>

            <Text style={styles.subTitle}>{subTitle}</Text>

            {/* Progress Indicator bar */}
            {!isSuccess && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>Communicating with Google Apps Script...</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorderHover,
    ...Platform.select({
      web: { boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.25)' },
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  topBanner: {
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  loadingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(16, 185, 129, 0.4)' },
      default: {
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  progressContainer: {
    width: '100%',
    marginTop: 18,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    width: '70%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});

