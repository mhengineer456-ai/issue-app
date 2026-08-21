import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function BottomNavBar({
  activeTab = 'stitching', // 'stitching' | 'packing' | 'completed' | 'todo_issue' | 'todo_list' | 'summary'
  stitchingCount = 0,
  packingCount = 0,
  completedCount = 0,
  issuedTodayCount = 0,
  todoListCount = 0,
  onSelectTab,
}) {
  return (
    <View style={styles.bottomBarWrapper}>
      <View style={styles.container}>
        {/* Tab 1: Stitching */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('stitching')}
          style={[styles.tabItem, activeTab === 'stitching' && styles.tabItemActive]}
        >
          <View style={styles.iconBadgeWrapper}>
            <Ionicons
              name={activeTab === 'stitching' ? 'git-network' : 'git-network-outline'}
              size={20}
              color={activeTab === 'stitching' ? colors.stitching : colors.textMuted}
            />
            {stitchingCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.stitching }]}>
                <Text style={styles.badgeText}>{stitchingCount > 99 ? '99+' : stitchingCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'stitching' && styles.tabLabelActiveStyle]}>
            Stitching
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Packing */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('packing')}
          style={[styles.tabItem, activeTab === 'packing' && styles.tabItemActive]}
        >
          <View style={styles.iconBadgeWrapper}>
            <Ionicons
              name={activeTab === 'packing' ? 'cube' : 'cube-outline'}
              size={20}
              color={activeTab === 'packing' ? colors.packing : colors.textMuted}
            />
            {packingCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.packing }]}>
                <Text style={styles.badgeText}>{packingCount > 99 ? '99+' : packingCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'packing' && styles.tabLabelActivePacking]}>
            Packing
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Completed Lots */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('completed')}
          style={[styles.tabItem, activeTab === 'completed' && styles.tabItemActive]}
        >
          <View style={styles.iconBadgeWrapper}>
            <Ionicons
              name={activeTab === 'completed' ? 'checkmark-done-circle' : 'checkmark-done-circle-outline'}
              size={21}
              color={activeTab === 'completed' ? '#047857' : colors.textMuted}
            />
            {completedCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: '#047857' }]}>
                <Text style={styles.badgeText}>{completedCount > 99 ? '99+' : completedCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'completed' && styles.tabLabelActiveCompleted]}>
            Completed
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Issued Today */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('todo_issue')}
          style={[styles.tabItem, activeTab === 'todo_issue' && styles.tabItemActive]}
        >
          <View style={styles.iconBadgeWrapper}>
            <MaterialCommunityIcons
              name={activeTab === 'todo_issue' ? 'clipboard-check' : 'clipboard-text-clock-outline'}
              size={21}
              color={activeTab === 'todo_issue' ? colors.accentGold : colors.textMuted}
            />
            {issuedTodayCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.accentGold }]}>
                <Text style={styles.badgeText}>{issuedTodayCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'todo_issue' && styles.tabLabelActiveTodoIssue]}>
            Issued Today
          </Text>
        </TouchableOpacity>

        {/* Tab 5: To-Do List */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('todo_list')}
          style={[styles.tabItem, activeTab === 'todo_list' && styles.tabItemActive]}
        >
          <View style={styles.iconBadgeWrapper}>
            <Ionicons
              name={activeTab === 'todo_list' ? 'checkbox' : 'checkbox-outline'}
              size={20}
              color={activeTab === 'todo_list' ? colors.success : colors.textMuted}
            />
            {todoListCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.success }]}>
                <Text style={styles.badgeText}>{todoListCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'todo_list' && styles.tabLabelActiveTodoList]}>
            To-Do List
          </Text>
        </TouchableOpacity>

        {/* Tab 6: Summary */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectTab('summary')}
          style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
        >
          <View style={styles.iconBadgeWrapper}>
            <Ionicons
              name={activeTab === 'summary' ? 'pie-chart' : 'pie-chart-outline'}
              size={20}
              color={activeTab === 'summary' ? colors.primary : colors.textMuted}
            />
            <View style={[styles.badgePill, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>ALL</Text>
            </View>
          </View>
          <Text style={[styles.tabLabel, activeTab === 'summary' && styles.tabLabelActiveSummary]}>
            Summary
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBarWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingBottom: Platform.OS === 'android' ? 16 : Platform.OS === 'ios' ? 24 : 0,
    paddingTop: 4,
    ...Platform.select({
      web: { boxShadow: '0px -4px 16px rgba(15, 23, 42, 0.08)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 12,
      },
    }),
  },
  container: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: colors.inputBg,
  },
  iconBadgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  badgePill: {
    position: 'absolute',
    top: -6,
    right: -12,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActiveStyle: {
    color: colors.stitching,
    fontWeight: '800',
  },
  tabLabelActivePacking: {
    color: colors.packing,
    fontWeight: '800',
  },
  tabLabelActiveCompleted: {
    color: '#047857',
    fontWeight: '800',
  },
  tabLabelActiveTodoIssue: {
    color: colors.accentGold,
    fontWeight: '800',
  },
  tabLabelActiveTodoList: {
    color: colors.success,
    fontWeight: '800',
  },
  tabLabelActiveSummary: {
    color: colors.primary,
    fontWeight: '800',
  },
});
