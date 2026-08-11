import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import BottomNavBar from '../components/BottomNavBar';

export default function ExecutiveSummaryScreen({ route, navigation }) {
  const { lots = [], todayIssuedLots = [] } = route.params || {};
  const [activeTab, setActiveTab] = useState('packing'); // 'packing' | 'stitching'

  // Dynamic calculations
  const metrics = useMemo(() => {
    // 1. Packing Summary Calculations
    const stitchingCompletedNotIssued = lots.filter(
      (l) => l.completedStatusDisplay && l.completedStatusDisplay !== '-' && l.completedStatusDisplay !== 'N/A'
    );
    const stitchingIncompleteNotIssued = lots.filter(
      (l) => !l.completedStatusDisplay || l.completedStatusDisplay === '-' || l.completedStatusDisplay === 'N/A'
    );

    // 2. Stitching Summary Calculations
    const directLots = lots.filter(
      (l) => (l['Direct Stitching'] || '').toLowerCase() === 'yes' || l.status === 'Direct'
    );
    const colorPendingLots = lots.filter((l) => l.hasColorPending);

    // Brand & Fabric Breakdown for current dataset
    const brandMap = {};
    const fabricMap = {};
    let totalPcsSum = 0;

    lots.forEach((l) => {
      const b = l.Brand && l.Brand !== 'N/A' ? l.Brand : 'Unspecified Brand';
      const f = l.Fabric && l.Fabric !== 'N/A' ? l.Fabric : 'Unspecified Fabric';
      const pcs = parseInt(l['Total Pcs'], 10) || 0;

      totalPcsSum += pcs;
      brandMap[b] = (brandMap[b] || 0) + 1;
      fabricMap[f] = (fabricMap[f] || 0) + 1;
    });

    const brandList = Object.entries(brandMap).sort((a, b) => b[1] - a[1]);
    const fabricList = Object.entries(fabricMap).sort((a, b) => b[1] - a[1]);

    return {
      totalLots: lots.length,
      totalPcs: totalPcsSum,
      stitchingCompletedNotIssued,
      stitchingIncompleteNotIssued,
      directLots,
      colorPendingLots,
      brandList,
      fabricList,
    };
  }, [lots]);

  const handleSelectTab = (tabKey) => {
    if (tabKey === 'stitching') {
      navigation.navigate('LotList', { department: 'Stitching', departmentId: 'stitching' });
    } else if (tabKey === 'packing') {
      navigation.navigate('LotList', { department: 'Packing', departmentId: 'packing' });
    } else if (tabKey === 'todo_issue') {
      navigation.navigate('TodoIssue', { todayIssuedLots });
    } else if (tabKey === 'todo_list') {
      navigation.navigate('TodoList', { todayIssuedLots });
    } else if (tabKey === 'summary') {
      // Already on Summary screen
    }
  };


  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('LotList', { department: 'Stitching', departmentId: 'stitching' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <View style={styles.badgePill}>
              <Ionicons name="pie-chart-outline" size={12} color="#38BDF8" />
              <Text style={styles.badgePillText}>PRODUCTION EXECUTIVE SUMMARY</Text>
            </View>
            <Text style={styles.headerTitle}>Lot Distribution & Pending Summary</Text>
          </View>
        </View>

        {/* Department Selector Tabs */}
        <View style={styles.tabBarWrapper}>
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setActiveTab('packing')}
              style={[styles.tabBtn, activeTab === 'packing' && styles.tabBtnActivePacking]}
            >
              <Ionicons
                name="cube-outline"
                size={16}
                color={activeTab === 'packing' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text style={[styles.tabBtnText, activeTab === 'packing' && styles.tabBtnTextActive]}>
                PACKING SUMMARY
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('stitching')}
              style={[styles.tabBtn, activeTab === 'stitching' && styles.tabBtnActiveStitching]}
            >
              <Ionicons
                name="git-network-outline"
                size={16}
                color={activeTab === 'stitching' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text style={[styles.tabBtnText, activeTab === 'stitching' && styles.tabBtnTextActive]}>
                STITCHING SUMMARY
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'packing' ? (
            /* PACKING SUMMARY SECTION */
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeaderTitle}>STITCHING COMPLETION STATUS (PACKING QUEUE)</Text>

              <View style={styles.metricRow}>
                <View style={[styles.metricCard, { borderColor: '#10B981', backgroundColor: '#ECFDF5' }]}>
                  <View style={styles.metricCardHeader}>
                    <Ionicons name="checkmark-done-circle" size={22} color="#10B981" />
                    <Text style={[styles.metricVal, { color: '#059669' }]}>
                      {metrics.stitchingCompletedNotIssued.length}
                    </Text>
                  </View>
                  <Text style={styles.metricTitle}>Stitching Completed</Text>
                  <Text style={styles.metricSub}>Ready for immediate packing dispatch</Text>
                </View>

                <View style={[styles.metricCard, { borderColor: colors.cutting, backgroundColor: '#FFFBEB' }]}>
                  <View style={styles.metricCardHeader}>
                    <Ionicons name="time-outline" size={22} color={colors.cutting} />
                    <Text style={[styles.metricVal, { color: colors.cutting }]}>
                      {metrics.stitchingIncompleteNotIssued.length}
                    </Text>
                  </View>
                  <Text style={styles.metricTitle}>Stitching Incomplete</Text>
                  <Text style={styles.metricSub}>Stitching in progress or pending</Text>
                </View>
              </View>

              {/* Brand Breakdown */}
              <Text style={styles.sectionHeaderTitle}>BRAND BREAKDOWN (PENDING PACKING)</Text>
              <View style={styles.breakdownCard}>
                {metrics.brandList.length > 0 ? (
                  metrics.brandList.map(([brand, count]) => (
                    <View key={brand} style={styles.breakdownRow}>
                      <View style={styles.brandNameGroup}>
                        <Ionicons name="pricetag-outline" size={15} color={colors.primary} />
                        <Text style={styles.brandNameText}>{brand}</Text>
                      </View>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{count} Lots Pending</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No brand data available</Text>
                )}
              </View>

              {/* Fabric Breakdown */}
              <Text style={styles.sectionHeaderTitle}>FABRIC BREAKDOWN (PENDING PACKING)</Text>
              <View style={styles.breakdownCard}>
                {metrics.fabricList.length > 0 ? (
                  metrics.fabricList.map(([fabric, count]) => (
                    <View key={fabric} style={styles.breakdownRow}>
                      <View style={styles.brandNameGroup}>
                        <MaterialCommunityIcons name="texture-box" size={17} color={colors.packing} />
                        <Text style={styles.brandNameText}>{fabric}</Text>
                      </View>
                      <View style={[styles.countBadge, { backgroundColor: colors.packingBg }]}>
                        <Text style={[styles.countBadgeText, { color: colors.packing }]}>{count} Lots</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No fabric data available</Text>
                )}
              </View>
            </View>
          ) : (
            /* STITCHING SUMMARY SECTION */
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeaderTitle}>STITCHING ALLOTMENT & COLOR STATUS</Text>

              <View style={styles.metricRow}>
                <View style={[styles.metricCard, { borderColor: colors.stitching, backgroundColor: '#EFF6FF' }]}>
                  <View style={styles.metricCardHeader}>
                    <Ionicons name="flash-outline" size={22} color={colors.stitching} />
                    <Text style={[styles.metricVal, { color: colors.stitching }]}>
                      {metrics.directLots.length}
                    </Text>
                  </View>
                  <Text style={styles.metricTitle}>Direct Stitching Lots</Text>
                  <Text style={styles.metricSub}>Ready for direct line issue</Text>
                </View>

                <View style={[styles.metricCard, { borderColor: colors.cutting, backgroundColor: '#FFFBEB' }]}>
                  <View style={styles.metricCardHeader}>
                    <Ionicons name="warning-outline" size={22} color={colors.cutting} />
                    <Text style={[styles.metricVal, { color: colors.cutting }]}>
                      {metrics.colorPendingLots.length}
                    </Text>
                  </View>
                  <Text style={styles.metricTitle}>Color Pending Lots</Text>
                  <Text style={styles.metricSub}>Waiting for shade approvals</Text>
                </View>
              </View>

              {/* Brand Breakdown */}
              <Text style={styles.sectionHeaderTitle}>BRAND BREAKDOWN (UNASSIGNED STITCHING)</Text>
              <View style={styles.breakdownCard}>
                {metrics.brandList.length > 0 ? (
                  metrics.brandList.map(([brand, count]) => (
                    <View key={brand} style={styles.breakdownRow}>
                      <View style={styles.brandNameGroup}>
                        <Ionicons name="pricetag-outline" size={15} color={colors.stitching} />
                        <Text style={styles.brandNameText}>{brand}</Text>
                      </View>
                      <View style={[styles.countBadge, { backgroundColor: colors.stitchingBg }]}>
                        <Text style={[styles.countBadgeText, { color: colors.stitching }]}>{count} Lots</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No brand data available</Text>
                )}
              </View>

              {/* Fabric Breakdown */}
              <Text style={styles.sectionHeaderTitle}>FABRIC BREAKDOWN (UNASSIGNED STITCHING)</Text>
              <View style={styles.breakdownCard}>
                {metrics.fabricList.length > 0 ? (
                  metrics.fabricList.map(([fabric, count]) => (
                    <View key={fabric} style={styles.breakdownRow}>
                      <View style={styles.brandNameGroup}>
                        <MaterialCommunityIcons name="texture-box" size={17} color={colors.stitching} />
                        <Text style={styles.brandNameText}>{fabric}</Text>
                      </View>
                      <View style={[styles.countBadge, { backgroundColor: colors.stitchingBg }]}>
                        <Text style={[styles.countBadgeText, { color: colors.stitching }]}>{count} Lots</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No fabric data available</Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>

      {/* WhatsApp Style Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="summary"
        issuedTodayCount={todayIssuedLots.length}
        onSelectTab={handleSelectTab}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.2)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flex: 1,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActivePacking: {
    backgroundColor: colors.packing,
  },
  tabBtnActiveStitching: {
    backgroundColor: colors.stitching,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  brandNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  noDataText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
