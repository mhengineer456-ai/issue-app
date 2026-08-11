import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SearchAndFilterBar({
  searchTerm,
  onSearchChange,
  filters,
  isPacking = false,
  onOpenFilterModal,
  onToggleColorPending,
  onClearAllFilters,
  activeFilterCount,
}) {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Lot #, Brand, Fabric, Style..."
            placeholderTextColor={colors.textMuted}
            value={searchTerm}
            onChangeText={onSearchChange}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips Scroll */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsScroll}>
          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={onClearAllFilters} style={styles.clearChip}>
              <Ionicons name="refresh" size={14} color={colors.error} />
              <Text style={styles.clearChipText}>Reset ({activeFilterCount})</Text>
            </TouchableOpacity>
          )}

          {/* Supervisor Chip */}
          <TouchableOpacity
            onPress={() => onOpenFilterModal('supervisor')}
            style={[styles.filterChip, filters.supervisor && filters.supervisor.length > 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filters.supervisor && filters.supervisor.length > 0 && styles.filterChipTextActive]}>
              Supervisor {filters.supervisor && filters.supervisor.length > 0 ? `(${filters.supervisor.length})` : ''}
            </Text>
            <Ionicons name="chevron-down" size={14} color={filters.supervisor && filters.supervisor.length > 0 ? '#FFF' : colors.textSecondary} />
          </TouchableOpacity>

          {/* Brand Chip */}
          <TouchableOpacity
            onPress={() => onOpenFilterModal('brand')}
            style={[styles.filterChip, filters.brand.length > 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filters.brand.length > 0 && styles.filterChipTextActive]}>
              Brand {filters.brand.length > 0 ? `(${filters.brand.length})` : ''}
            </Text>
            <Ionicons name="chevron-down" size={14} color={filters.brand.length > 0 ? '#FFF' : colors.textSecondary} />
          </TouchableOpacity>

          {/* Fabric Chip */}
          <TouchableOpacity
            onPress={() => onOpenFilterModal('fabric')}
            style={[styles.filterChip, filters.fabric.length > 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filters.fabric.length > 0 && styles.filterChipTextActive]}>
              Fabric {filters.fabric.length > 0 ? `(${filters.fabric.length})` : ''}
            </Text>
            <Ionicons name="chevron-down" size={14} color={filters.fabric.length > 0 ? '#FFF' : colors.textSecondary} />
          </TouchableOpacity>

          {/* Garment Type Chip */}
          <TouchableOpacity
            onPress={() => onOpenFilterModal('garmentType')}
            style={[styles.filterChip, filters.garmentType.length > 0 && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filters.garmentType.length > 0 && styles.filterChipTextActive]}>
              Type {filters.garmentType.length > 0 ? `(${filters.garmentType.length})` : ''}
            </Text>
            <Ionicons name="chevron-down" size={14} color={filters.garmentType.length > 0 ? '#FFF' : colors.textSecondary} />
          </TouchableOpacity>

          {/* Status Chip (Only show for Stitching department!) */}
          {!isPacking && (
            <TouchableOpacity
              onPress={() => onOpenFilterModal('status')}
              style={[styles.filterChip, filters.status.length > 0 && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filters.status.length > 0 && styles.filterChipTextActive]}>
                Status {filters.status.length > 0 ? `(${filters.status.length})` : ''}
              </Text>
              <Ionicons name="chevron-down" size={14} color={filters.status.length > 0 ? '#FFF' : colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Color Pending Pill (Only show for Stitching department!) */}
          {!isPacking && (
            <TouchableOpacity
              onPress={onToggleColorPending}
              style={[styles.filterChip, filters.colorPending === 'Yes' && styles.filterChipWarning]}
            >
              <Ionicons
                name="warning-outline"
                size={14}
                color={filters.colorPending === 'Yes' ? '#FFF' : colors.cutting}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filters.colorPending === 'Yes' && styles.filterChipTextActive,
                ]}
              >
                Color Pending
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    height: 44,
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(12, 59, 46, 0.05)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterChipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clearChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.error,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipWarning: {
    backgroundColor: colors.cutting,
    borderColor: colors.cutting,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
