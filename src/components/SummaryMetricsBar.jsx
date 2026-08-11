import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export default function SummaryMetricsBar({ summary, deptThemeColor, isPacking = false }) {
  return (
    <View style={styles.summaryBar}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryVal}>{summary.totalLots}</Text>
        <Text style={styles.summaryLbl}>AVAILABLE LOTS</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryVal, { color: deptThemeColor }]}>
          {summary.totalPcs.toLocaleString()}
        </Text>
        <Text style={styles.summaryLbl}>CUTTING QTY (PCS)</Text>
      </View>
      {!isPacking && (
        <>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: summary.colorPendingCount > 0 ? colors.cutting : colors.success }]}>
              {summary.colorPendingCount}
            </Text>
            <Text style={styles.summaryLbl}>COLOR PENDING</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 6px rgba(12, 59, 46, 0.04)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  summaryLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.cardBorder,
  },
});
