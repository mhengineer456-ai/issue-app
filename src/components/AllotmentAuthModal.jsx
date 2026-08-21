import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const DEFAULT_AUTHORIZERS = ['PINTU', 'SHEELAGURU', 'ADMIN', 'MANAGER'];

export default function AllotmentAuthModal({
  visible,
  lot,
  department = 'Stitching',
  supervisors = [],
  loadingSupervisors = false,
  onClose,
  onConfirmAllotment,
}) {
  const [authorizer, setAuthorizer] = useState('PINTU');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (visible) {
      setAuthorizer('PINTU');
      setSelectedSupervisor(null);
      setSupervisorSearch('');
      setValidationError('');
      setIsSubmitting(false);
    }
  }, [visible]);

  if (!lot) return null;

  const isStitching = department.toLowerCase() === 'stitching';
  const deptColor = isStitching ? colors.stitching : colors.packing;

  const filteredSupervisors = supervisors.filter((sup) => {
    if (!sup || !sup.name) return false;

    // Filter strictly by active department (Stitching vs Packing)
    if (sup.department) {
      const supDept = sup.department.toLowerCase().trim();
      const targetDept = department.toLowerCase().trim();
      if (supDept !== targetDept) {
        return false;
      }
    }

    if (supervisorSearch.trim()) {
      return sup.name.toLowerCase().includes(supervisorSearch.toLowerCase().trim());
    }
    return true;
  });

  const handleConfirm = () => {
    setValidationError('');
    if (!authorizer.trim()) {
      setValidationError('Please enter or select who Authorized this allotment.');
      return;
    }
    if (!selectedSupervisor) {
      setValidationError('Please select a Supervisor Name from the list.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmAllotment({
        lot,
        authorizedBy: authorizer.trim(),
        supervisor: selectedSupervisor,
      });
    }, 400);
  };

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
              <View style={[styles.deptBadge, { backgroundColor: deptColor }]}>
                <Ionicons
                  name={isStitching ? 'git-network-outline' : 'cube-outline'}
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.deptBadgeText}>{department.toUpperCase()} ALLOTMENT</Text>
              </View>
              <Text style={styles.modalTitle}>Allotment Authorization</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Validation Error Alert */}
          {validationError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Target Lot Summary Banner */}
            <View style={styles.lotSummaryCard}>
              <View style={styles.lotSummaryHeader}>
                <Text style={styles.lotNumText}>Lot #{lot['Lot Number']}</Text>
                <View style={styles.pcsPill}>
                  <Text style={styles.pcsPillText}>{lot['Total Pcs']} Pcs</Text>
                </View>
              </View>
              <Text style={styles.lotMetaText}>
                {lot.Brand} • {lot['Garment Type']} ({lot.Style})
              </Text>
              <Text style={styles.fabricSubText}>Fabric: {lot.Fabric}</Text>
            </View>

            {/* AUTHORIZED BY FIELD */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>AUTHORIZED BY</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={authorizer}
                  onChangeText={setAuthorizer}
                  placeholder="Enter Authorizer Name (e.g. PINTU)"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              {/* Quick Authorizer Selection Chips */}
              <View style={styles.quickChipsRow}>
                {DEFAULT_AUTHORIZERS.map((name) => (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setAuthorizer(name)}
                    style={[
                      styles.quickChip,
                      authorizer === name && styles.quickChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        authorizer === name && styles.quickChipTextActive,
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SUPERVISOR NAME FIELD */}
            <View style={styles.fieldSection}>
              <View style={styles.supervisorLabelRow}>
                <Text style={styles.fieldLabel}>SUPERVISOR NAME</Text>
                <Text style={styles.liveBadgeText}>• Live Sheet Data</Text>
              </View>

              {/* Supervisor Search Input */}
              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={supervisorSearch}
                  onChangeText={setSupervisorSearch}
                  placeholder="Search supervisor name..."
                  placeholderTextColor={colors.textMuted}
                />
                {supervisorSearch ? (
                  <TouchableOpacity onPress={() => setSupervisorSearch('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Supervisor Options List */}
              <View style={styles.supervisorListContainer}>
                {loadingSupervisors ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Fetching supervisors from Google Sheet...</Text>
                  </View>
                ) : filteredSupervisors.length === 0 ? (
                  <Text style={styles.noSupervisorsText}>No supervisors found matching "{supervisorSearch}"</Text>
                ) : (
                  <ScrollView style={styles.supervisorScroll} nestedScrollEnabled={true}>
                    {filteredSupervisors.map((sup) => {
                      const isSelected = selectedSupervisor && selectedSupervisor.name === sup.name;
                      return (
                        <TouchableOpacity
                          key={sup.id || sup.name}
                          activeOpacity={0.7}
                          onPress={() => setSelectedSupervisor(sup)}
                          style={[styles.supervisorRow, isSelected && styles.supervisorRowSelected]}
                        >
                          <View style={styles.supervisorNameGroup}>
                            <Ionicons
                              name="person-circle-outline"
                              size={20}
                              color={isSelected ? colors.primary : colors.textSecondary}
                            />
                            <View>
                              <Text style={[styles.supervisorNameText, isSelected && styles.supervisorNameTextSelected]}>
                                {sup.name}
                              </Text>
                              {sup.department ? (
                                <Text style={styles.supervisorDeptText}>
                                  {sup.department} {sup.shift ? `• ${sup.shift}` : ''}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                          {isSelected && (
                            <View style={styles.checkIconWrapper}>
                              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} disabled={isSubmitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmBtn, { backgroundColor: deptColor }]}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.confirmText}>
                    CONFIRM & ALLOT TO {department.toUpperCase()}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </>
              )}
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
    backgroundColor: 'rgba(12, 59, 46, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0px -6px 24px rgba(12, 59, 46, 0.2)' },
      default: {
        shadowColor: colors.primary,
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
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flex: 1,
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  deptBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  closeBtn: {
    padding: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  scrollBody: {
    maxHeight: 440,
  },
  lotSummaryCard: {
    backgroundColor: '#EBF5EC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    marginBottom: 16,
  },
  lotSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lotNumText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  pcsPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pcsPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  lotMetaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fabricSubText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  supervisorLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  quickChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  quickChipTextActive: {
    color: '#FFFFFF',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 38,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  supervisorListContainer: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    maxHeight: 180,
    overflow: 'hidden',
  },
  supervisorScroll: {
    maxHeight: 180,
    padding: 6,
  },
  loadingBox: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noSupervisorsText: {
    textAlign: 'center',
    color: colors.textMuted,
    padding: 16,
    fontSize: 12,
  },
  supervisorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  supervisorRowSelected: {
    backgroundColor: '#EBF5EC',
  },
  supervisorNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supervisorNameText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  supervisorNameTextSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  supervisorDeptText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  checkIconWrapper: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
