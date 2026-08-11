import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import BottomNavBar from '../components/BottomNavBar';

export default function HomeScreen({ route, navigation }) {
  const user = route.params?.user || {
    operatorId: 'ST-708',
    stationId: 'stitching',
    station: 'Stitching Dept',
  };


  const isStitching = user.stationId === 'stitching';
  const isPacking = user.stationId === 'packing';

  const getStationColor = () => {
    if (isStitching) return colors.stitching;
    if (isPacking) return colors.packing;
    return colors.primary;
  };

  const handleLogout = () => {
    navigation.replace('Login');
  };

  const handleOpenLotList = (deptName, deptId) => {
    navigation.navigate('LotList', {
      department: deptName,
      departmentId: deptId,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0F172A', '#1E40AF', '#F8FAFC']}
        style={styles.container}
      >


        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Top Header */}
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: getStationColor() }]}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.welcomeText}>Garment Operator</Text>
                <Text style={styles.operatorId}>{user.operatorId}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Active Station Card */}
          <View style={[styles.stationCard, { borderColor: getStationColor() }]}>
            <View style={styles.stationHeader}>
              <View style={[styles.activeDot, { backgroundColor: getStationColor() }]} />
              <Text style={[styles.stationTagText, { color: getStationColor() }]}>
                ACTIVE DEPARTMENT
              </Text>
            </View>
            <Text style={styles.stationName}>{user.station}</Text>
            <Text style={styles.stationDesc}>
              {isStitching
                ? 'Select and issue cut bundles & component lots to stitching lines'
                : isPacking
                ? 'Select and issue stitched garments & accessory lots to packing section'
                : 'Manage garment lot dispatches & production workflows'}
            </Text>

            {/* Quick Action Button inside Station Banner */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                handleOpenLotList(
                  isPacking ? 'Packing' : 'Stitching',
                  isPacking ? 'packing' : 'stitching'
                )
              }
              style={styles.bannerActionBtnWrapper}
            >
              <LinearGradient
                colors={isPacking ? colors.sageGradient : colors.primaryGradient}
                style={styles.bannerActionBtn}
              >
                <Text style={styles.bannerActionText}>
                  VIEW AVAILABLE LOTS FOR {user.station.toUpperCase()}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Production Lot Metrics */}
          <Text style={styles.sectionTitle}>TODAY'S PRODUCTION LOTS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="layers-outline" size={22} color={colors.primary} />
              <Text style={styles.statNumber}>148</Text>
              <Text style={styles.statLabel}>Lots Issued</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="shirt-outline" size={22} color={colors.sage} />
              <Text style={styles.statNumber}>3,250</Text>
              <Text style={styles.statLabel}>Pcs Issued</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={22} color={colors.cutting} />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>In-Transit</Text>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <Text style={styles.sectionTitle}>DEPARTMENT WORKFLOWS</Text>
          <View style={styles.actionGrid}>
            {/* Stitching Lot Issue Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleOpenLotList('Stitching', 'stitching')}
              style={[styles.actionCard, isStitching && styles.actionCardHighlighted]}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: colors.stitching }]}>
                <Ionicons name="git-network-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionTitle}>Stitching Lot Issue</Text>
              <Text style={styles.actionSub}>Dispatch cut fabric & components</Text>
            </TouchableOpacity>

            {/* Packing Lot Issue Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleOpenLotList('Packing', 'packing')}
              style={[styles.actionCard, isPacking && styles.actionCardHighlighted]}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: colors.packing }]}>
                <Ionicons name="cube-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionTitle}>Packing Lot Issue</Text>
              <Text style={styles.actionSub}>Dispatch finished pieces & polybags</Text>
            </TouchableOpacity>

            {/* Barcode Scanner */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleOpenLotList(isPacking ? 'Packing' : 'Stitching', user.stationId)}
              style={styles.actionCard}
            >
              <LinearGradient
                colors={colors.primaryGradient}
                style={styles.actionIconBadge}
              >
                <MaterialCommunityIcons name="barcode-scan" size={24} color="#FFF" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Scan Lot Barcode</Text>
              <Text style={styles.actionSub}>Quick lot bundle verification</Text>
            </TouchableOpacity>

            {/* Return / Reject Lot */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleOpenLotList(isPacking ? 'Packing' : 'Stitching', user.stationId)}
              style={styles.actionCard}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: colors.cutting }]}>
                <Ionicons name="return-down-back-outline" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionTitle}>Lot Returns</Text>
              <Text style={styles.actionSub}>Process alterations or returns</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
      <BottomNavBar
        activeTab={isPacking ? 'packing' : 'stitching'}
        onSelectTab={(tabKey) => {
          if (tabKey === 'stitching') {
            handleOpenLotList('Stitching', 'stitching');
          } else if (tabKey === 'packing') {
            handleOpenLotList('Packing', 'packing');
          } else if (tabKey === 'summary') {
            handleOpenLotList(isPacking ? 'Packing' : 'Stitching', user.stationId);
          } else {
            handleOpenLotList(isPacking ? 'Packing' : 'Stitching', user.stationId);
          }
        }}
      />

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F9F3',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(12, 59, 46, 0.12)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  welcomeText: {
    fontSize: 12,
    color: '#E9EDEF',
    fontWeight: '600',
  },
  operatorId: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  logoutBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  stationCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    borderWidth: 2,
    padding: 18,
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0px 6px 16px rgba(12, 59, 46, 0.06)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stationTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stationName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  stationDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
    fontWeight: '600',
  },
  bannerActionBtnWrapper: {
    marginTop: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bannerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(12, 59, 46, 0.04)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(12, 59, 46, 0.04)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  actionCardHighlighted: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#EBF5EC',
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  actionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
    fontWeight: '600',
  },
});
