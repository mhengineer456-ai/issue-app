import React from 'react';
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

export default function TodoIssueScreen({ route, navigation }) {
  const { todayIssuedLots = [], availableLotsCount = 0 } = route.params || {};
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSelectTab = (tabKey) => {
    if (tabKey === 'stitching') {
      navigation.navigate('LotList', { department: 'Stitching', departmentId: 'stitching' });
    } else if (tabKey === 'packing') {
      navigation.navigate('LotList', { department: 'Packing', departmentId: 'packing' });
    } else if (tabKey === 'completed') {
      navigation.navigate('CompletedLot');
    } else if (tabKey === 'todo_issue') {
      // Already on Issued Today screen
    } else if (tabKey === 'todo_list') {
      navigation.navigate('TodoList', { todayIssuedLots });
    } else if (tabKey === 'summary') {
      navigation.navigate('ExecutiveSummary', { todayIssuedLots });
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
            <View style={styles.statusPill}>
              <Ionicons name="ellipse" size={8} color="#10B981" />
              <Text style={styles.statusPillText}>TODAY'S ISSUED LOTS ({todayStr})</Text>
            </View>
            <Text style={styles.headerTitle}>TODO Issue Lot Dashboard</Text>
          </View>
        </View>

        {/* Scrollable Body */}
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Section 1: Lots Issued By User Today */}
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>
              Lots Issued By User Today ({todayIssuedLots.length})
            </Text>
          </View>

          {todayIssuedLots.length > 0 ? (
            todayIssuedLots.map((item, index) => (
              <View key={`issued-${item.lotNumber}-${index}`} style={styles.issuedLotCard}>
                <View style={styles.issuedLotHeader}>
                  <View style={styles.lotNumGroup}>
                    <Text style={styles.lotNumText}>Lot #{item.lotNumber}</Text>
                    <View style={styles.deptTag}>
                      <Text style={styles.deptTagText}>{(item.department || 'DEPT').toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.issuedBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                    <Text style={styles.issuedBadgeText}>ISSUED TODAY</Text>
                  </View>
                </View>

                <View style={styles.issuedBody}>
                  <Text style={styles.brandGarmentText}>
                    {item.brand} • {item.garmentType} ({item.style})
                  </Text>
                  <Text style={styles.fabricText}>Fabric: {item.fabric}</Text>
                  
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
                      <Text style={styles.metaText}>Supervisor: {item.supervisor}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="shield-checkmark-outline" size={13} color={colors.textSecondary} />
                      <Text style={styles.metaText}>Auth: {item.authorizedBy}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.issuedFooter}>
                  <View style={styles.pcsGroup}>
                    <Text style={styles.pcsLabel}>QUANTITY</Text>
                    <Text style={styles.pcsVal}>{item.totalPcs} Pcs</Text>
                  </View>
                  <Text style={styles.timeText}>Issued at {item.issueTime || 'Today'}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyIssuedBox}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Lots Issued Today Yet</Text>
              <Text style={styles.emptySub}>
                When you confirm and issue lots today, they will automatically appear here.
              </Text>
            </View>
          )}

          {/* Section 2: Department Quick Allotment Queues */}
          <View style={styles.sectionHeader}>
            <Ionicons name="apps-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Available Department Queues</Text>
          </View>

          <View style={styles.queueGrid}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('LotList', { department: 'Stitching', departmentId: 'stitching' })}
              style={[styles.queueCard, { borderColor: colors.stitching }]}
            >
              <Ionicons name="git-network-outline" size={28} color={colors.stitching} />
              <Text style={styles.queueTitle}>Stitching Dept</Text>
              <Text style={[styles.queueSub, { color: colors.stitching }]}>View Available Lots</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('LotList', { department: 'Packing', departmentId: 'packing' })}
              style={[styles.queueCard, { borderColor: colors.packing }]}
            >
              <Ionicons name="cube-outline" size={28} color={colors.packing} />
              <Text style={styles.queueTitle}>Packing Dept</Text>
              <Text style={[styles.queueSub, { color: colors.packing }]}>View Available Lots</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* WhatsApp Style Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="todo_issue"
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  issuedLotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(15, 23, 42, 0.05)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      },
    }),
  },
  issuedLotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lotNumGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lotNumText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  deptTag: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deptTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  issuedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  issuedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  issuedBody: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
    marginBottom: 10,
  },
  brandGarmentText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  fabricText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  issuedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  pcsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pcsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  pcsVal: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  emptyIssuedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  queueGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  queueCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  queueSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});
