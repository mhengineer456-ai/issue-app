import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function HeaderBar({ department, deptThemeColor, isStitching, onBackPress, onOpenSummary, onOpenCompleted }) {
  return (
    <View style={styles.topHeader}>
      <TouchableOpacity onPress={onBackPress} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.headerTitleGroup}>
        <View style={styles.deptBadge}>
          <Ionicons
            name={isStitching ? 'git-network-outline' : 'cube-outline'}
            size={13}
            color="#38BDF8"
          />
          <Text style={styles.deptBadgeText}>
            {department.toUpperCase()} DEPT
          </Text>
        </View>

        <Text style={styles.mainTitle}>Available Lots</Text>
      </View>
      <View style={styles.headerRightActions}>
        {onOpenCompleted && (
          <TouchableOpacity onPress={onOpenCompleted} style={styles.completedHeaderBtn} activeOpacity={0.7}>
            <Ionicons name="checkmark-done-circle-outline" size={16} color="#34D399" />
            <Text style={styles.completedHeaderBtnText}>COMPLETED</Text>
          </TouchableOpacity>
        )}
        {onOpenSummary && (
          <TouchableOpacity onPress={onOpenSummary} style={styles.summaryHeaderBtn} activeOpacity={0.7}>
            <Ionicons name="pie-chart-outline" size={16} color="#38BDF8" />
            <Text style={styles.summaryHeaderBtnText}>SUMMARY</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(7, 94, 84, 0.2)' },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 3 },
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
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  deptBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#38BDF8',
  },

  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  completedHeaderBtnText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.6,
  },
  summaryHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  summaryHeaderBtnText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
});


