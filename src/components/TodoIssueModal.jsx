import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function TodoIssueModal({
  visible = false,
  lots = [],
  todayIssuedLots = [],
  onClose,
  onSelectDepartment,
  onFilterColorPending,
  onOpenExecutiveSummary,
}) {
  if (!visible) return null;


  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.statusPill}>
                <Ionicons name="ellipse" size={8} color="#10B981" />
                <Text style={styles.statusPillText}>TODAY'S ISSUED LOTS ({todayStr})</Text>
              </View>
              <Text style={styles.modalTitle}>TODO Issue Lot Form</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Section 1: Lots Issued by User Today */}
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>
                Lots Issued By Pintu / User Today ({todayIssuedLots.length})
              </Text>
            </View>

            {todayIssuedLots.length > 0 ? (
              todayIssuedLots.map((item, index) => (
                <View key={`issued-${item.lotNumber}-${index}`} style={styles.issuedLotCard}>
                  <View style={styles.issuedLotHeader}>
                    <View style={styles.lotNumGroup}>
                      <Text style={styles.lotNumText}>Lot #{item.lotNumber}</Text>
                      <View style={styles.deptTag}>
                        <Text style={styles.deptTagText}>{item.department.toUpperCase()}</Text>
                      </View>
                    </View>
                    <View style={styles.issuedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#10B981" />
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
                        <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                        <Text style={styles.metaText}>Supervisor: {item.supervisor}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="shield-checkmark-outline" size={12} color={colors.textSecondary} />
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
                <MaterialCommunityIcons name="clipboard-text-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Lots Issued Today Yet</Text>
                <Text style={styles.emptySub}>
                  When you confirm and allot a lot today, it will be listed here as a record.
                </Text>
              </View>
            )}

            {/* Section 2: Department Quick Allotment Queues */}
            <View style={styles.sectionHeader}>
              <Ionicons name="apps-outline" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Available Department Queues</Text>
            </View>

            <View style={styles.queueGrid}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onSelectDepartment('Stitching', 'stitching');
                }}
                style={[styles.queueCard, { borderColor: colors.stitching }]}
              >
                <Ionicons name="git-network-outline" size={24} color={colors.stitching} />
                <Text style={styles.queueTitle}>Stitching Dept</Text>
                <Text style={[styles.queueSub, { color: colors.stitching }]}>View Available Lots</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  onSelectDepartment('Packing', 'packing');
                }}
                style={[styles.queueCard, { borderColor: colors.packing }]}
              >
                <Ionicons name="cube-outline" size={24} color={colors.packing} />
                <Text style={styles.queueTitle}>Packing Dept</Text>
                <Text style={[styles.queueSub, { color: colors.packing }]}>View Available Lots</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {onOpenExecutiveSummary && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onOpenExecutiveSummary();
                }}
                style={styles.summaryBtn}
              >
                <Ionicons name="pie-chart-outline" size={16} color="#FFFFFF" />
                <Text style={styles.summaryBtnText}>OPEN EXECUTIVE SUMMARY</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>CLOSE TODO PANEL</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0px -6px 24px rgba(15, 23, 42, 0.2)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
  },
  headerTitleGroup: {
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  issuedLotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.04)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  issuedLotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lotNumGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lotNumText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.primary,
  },
  deptTag: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deptTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  issuedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
    paddingTop: 8,
    marginBottom: 8,
  },
  brandGarmentText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  fabricText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  issuedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  pcsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pcsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
  },
  pcsVal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  emptyIssuedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  queueGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  queueCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  queueTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 6,
  },
  queueSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    marginTop: 8,
    gap: 8,
  },
  summaryBtn: {
    backgroundColor: colors.stitching,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  summaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  doneBtn: {
    backgroundColor: colors.primaryDark,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

