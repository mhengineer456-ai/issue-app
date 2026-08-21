import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function CompletedLotCard({ item, onImagePreview, onApprovalSubmission }) {
  const formattedDate = item.timestamp
    ? item.timestamp.split('T')[0] || item.timestamp
    : '-';

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.lotNumberGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-done-circle" size={20} color="#047857" />
          </View>
          <Text style={styles.lotTitle}>Lot #{item.lotNumber}</Text>
          {item.recordId ? (
            <View style={styles.recordIdBadge}>
              <Text style={styles.recordIdText}>{item.recordId}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle-sharp" size={13} color="#047857" />
          <Text style={styles.statusText}>{item.status || 'Complete Lot'}</Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.cardBody}>
        {/* Left Image Thumbnail */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => item.image && item.image !== 'N/A' && onImagePreview(item.image)}
          style={styles.imageWrapper}
        >
          {item.image && item.image !== 'N/A' ? (
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Ionicons name="shirt-outline" size={24} color={colors.textMuted} />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Right Info Specs */}
        <View style={styles.detailsGroup}>
          <Text style={styles.brandTitle}>{item.brand}</Text>

          <Text style={styles.garmentSub}>
            {item.garmentType} • {item.style}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.infoText}>Supervisor: </Text>
            <Text style={styles.infoValueHighlight}>{item.supervisor}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.infoText}>Party: </Text>
            <Text style={styles.infoValue}>{item.partyName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="layers-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.infoText}>Fabric: </Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.fabric}
            </Text>
          </View>

          {item.remarks ? (
            <View style={styles.remarksBox}>
              <Ionicons name="information-circle-outline" size={13} color={colors.primary} />
              <Text style={styles.remarksText} numberOfLines={2}>
                {item.remarks}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Footer Details (Qty & Date) */}
      <View style={styles.cardFooter}>
        <View style={styles.qtyBadge}>
          <MaterialCommunityIcons name="counter" size={16} color={colors.primary} />
          <Text style={styles.qtyLabel}>Completed Pcs:</Text>
          <Text style={styles.qtyValue}>{item.pcsQty.toLocaleString()} Pcs</Text>
        </View>

        <View style={styles.dateGroup}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      {/* Action Row: Approval Submission Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.approvalButton}
          activeOpacity={0.8}
          disabled={item.isSubmittingApproval || (item.status && item.status.includes('Approved'))}
          onPress={() => onApprovalSubmission && onApprovalSubmission(item)}
        >
          <View
            style={[
              styles.approvalGradient,
              item.status && item.status.includes('Approved') && styles.approvedBtnBg,
            ]}
          >
            {item.isSubmittingApproval ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.approvalButtonText}>Submitting to Sheets...</Text>
              </>
            ) : item.status && item.status.includes('Approved') ? (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.approvalButtonText}>Approved & Submitted ✓</Text>
              </>
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={17} color="#FFFFFF" />
                <Text style={styles.approvalButtonText}>Approval Submission</Text>
                <Ionicons name="chevron-forward" size={14} color="#D1FAE5" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(15, 23, 42, 0.06)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  lotNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lotTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  recordIdBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recordIdText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  imageWrapper: {
    width: 90,
    height: 105,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  detailsGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  garmentSub: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  infoText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
  },
  infoValueHighlight: {
    fontSize: 11,
    color: colors.stitching,
    fontWeight: '900',
  },
  remarksBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  remarksText: {
    fontSize: 10.5,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  qtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  actionSection: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  approvalButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  approvalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    backgroundColor: '#059669',
  },
  approvedBtnBg: {
    backgroundColor: '#047857',
  },
  approvalButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
