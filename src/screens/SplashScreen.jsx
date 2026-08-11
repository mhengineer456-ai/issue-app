import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const isNativeDriverSupported = Platform.OS !== 'web';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: isNativeDriverSupported,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: isNativeDriverSupported,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: isNativeDriverSupported,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: isNativeDriverSupported,
        }),
      ])
    );
    pulseLoop.start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2800);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, []);

  const handleSkip = () => {
    navigation.replace('Login');
  };

  return (
    <LinearGradient
      colors={['#EBF5EC', '#F2F9F3', '#EBF5EC']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Pulsing Outer Glow */}
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Main Logo Container */}
        <LinearGradient
          colors={colors.primaryGradient}
          style={styles.logoBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="tshirt-crew" size={54} color="#FFFFFF" />
        </LinearGradient>

        {/* App Title & Slogan */}
        <View style={styles.titleContainer}>
          <View style={styles.badgeLabel}>
            <Ionicons name="sparkles" size={12} color={colors.accentGold} />
            <Text style={styles.badgeText}>GARMENT PRODUCTION</Text>
          </View>

          <Text style={styles.appTitle}>LOT ISSUE</Text>
          <Text style={styles.appSubtitle}>
            Stitching & Packing Dispatch Manager
          </Text>
        </View>

        {/* Bottom Status / Loader */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Tap to Continue</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.versionText}>v1.0.0 Emerald Edition</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(12, 59, 46, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(12, 59, 46, 0.2)',
    top: -20,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 10px 24px rgba(12, 59, 46, 0.35)' },
      default: {
        shadowColor: '#0C3B2E',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
    marginBottom: 28,
  },
  titleContainer: {
    alignItems: 'center',
  },
  badgeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EBF5EC',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    marginTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...Platform.select({
      web: { boxShadow: '0px 3px 8px rgba(12, 59, 46, 0.08)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  skipText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
