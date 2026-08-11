import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function LotCard({
  item,
  department,
  isStitching,
  isPacking,
  deptThemeColor,
  onImagePreview,
  onAllotPress,
}) {
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Direct':
        return { bg: '#EBF5EC', text: '#0C3B2E', border: '#C8E2CB' };
      case 'Ready for Stitching':
        return { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
      case 'Printing Working':
        return { bg: '#FFFBEB', text: '#B46617', border: '#FDE68A' };
      case 'Embroidery Working':
        return { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' };
      case 'Stitching Completed':
        return { bg: '#EBF5EC', text: colors.primary, border: colors.cardBorder };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
    }
  };

  const statusStyle = getStatusBadgeStyle(item.status);

  return (
    <View style={styles.lotCard}>
      {/* Card Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.lotNumGroup}>
          {item.isRepeatedLot && (
            <View style={styles.repeatedBadge}>
              <Ionicons name="star" size={12} color={colors.accentGold} />
            </View>
          )}
          <Text style={styles.lotNumText}>Lot #{item['Lot Number']}</Text>
          {item.Season !== 'N/A' && (
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>{item.Season}</Text>
            </View>
          )}
        </View>

        {/* Stitching Completed Chip */}
        {item.completedStatusDisplay && item.completedStatusDisplay !== '-' ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#047857" />
            <Text style={styles.completedBadgeText}>Stitching Completed</Text>
          </View>
        ) : !isPacking ? (
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Card Main Body */}
      <View style={styles.cardBody}>
        {/* Image Thumbnail */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => item.Image && item.Image !== 'N/A' && onImagePreview(item.Image)}
          style={styles.imageThumbWrapper}
        >
          {item.Image && item.Image !== 'N/A' ? (
            <Image source={{ uri: item.Image }} style={styles.imageThumb} resizeMode="cover" />
          ) : (
            <View style={styles.noImageThumb}>
              <Ionicons name="shirt-outline" size={24} color={colors.textMuted} />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Specifications */}
        <View style={styles.specsGroup}>
          <Text style={styles.brandTitle}>{item.Brand}</Text>
          <Text style={styles.garmentTypeStyle}>
            {item['Garment Type']} • {item.Style}
          </Text>
          <Text style={styles.fabricText} numberOfLines={1}>
            Fabric: {item.Fabric}
          </Text>

          {/* Color Status or Pending Days Tag */}
          <View style={styles.colorStatusRow}>
            {isPacking ? (
              <View style={styles.packingTag}>
                <Ionicons name="time-outline" size={12} color={colors.primary} />
                <Text style={styles.packingTagText}>
                  Stitched by: {item.stitchingSupervisor || 'N/A'} • {item.completedStatusDisplay || 'Ready'}
                </Text>
              </View>
            ) : item.hasColorPending ? (
              <View style={styles.colorPendingTag}>
                <Ionicons name="warning" size={12} color={colors.cutting} />
                <Text style={styles.colorPendingText} numberOfLines={1}>
                  Color Pending: {item.pendingColorsText}
                </Text>
              </View>
            ) : (
              <View style={styles.colorOkTag}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={styles.colorOkText}>Color Status: OK</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.pcsBadgeGroup}>
          <Text style={styles.pcsLabel}>CUTTING QTY</Text>
          <Text style={[styles.pcsValue, { color: deptThemeColor }]}>
            {item['Total Pcs']} Pcs
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onAllotPress(item)}
          style={styles.allotBtnWrapper}
        >
          <LinearGradient
            colors={isStitching ? colors.blueGradient : colors.skyGradient}
            style={styles.allotBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.allotBtnText}>
              ALLOT TO {department.toUpperCase()}
            </Text>
            <Ionicons name="arrow-forward" size={15} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

}


const styles = StyleSheet.create({
  lotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
    padding: 14,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(12, 59, 46, 0.04)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lotNumGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  repeatedBadge: {
    padding: 2,
  },
  lotNumText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  seasonBadge: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  seasonText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EBF5EC',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF5EC',
    marginBottom: 10,
  },
  imageThumbWrapper: {
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F2F9F3',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  noImageThumb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  specsGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  garmentTypeStyle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  fabricText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  colorStatusRow: {
    marginTop: 6,
  },
  packingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  packingTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  colorPendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  colorPendingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cutting,
  },
  colorOkTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  colorOkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pcsBadgeGroup: {
    justifyContent: 'center',
  },
  pcsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  pcsValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  allotBtnWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  allotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  allotBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  completedBadge: {
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
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
  },
});
