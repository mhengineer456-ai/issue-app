import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import BottomNavBar from '../components/BottomNavBar';

const CATEGORIES = ['Production', 'Fabric', 'Allotment', 'Quality', 'General'];
const PRIORITIES = [
  { id: 'High', label: 'High Priority', color: colors.error, bg: colors.errorBg },
  { id: 'Medium', label: 'Medium Priority', color: colors.accentGold, bg: '#FFFBEB' },
  { id: 'Low', label: 'Low Priority', color: colors.primary, bg: '#EFF6FF' },
];

export default function TodoListScreen({ route, navigation }) {
  // Initial Sample Daily Tasks
  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      title: 'Verify German Fleece Fabric shade for Lot #11177',
      category: 'Fabric',
      priority: 'High',
      completed: false,
      reminderTime: '11:00 AM Today',
      createdAt: '2026-08-10',
    },
    {
      id: 'task-2',
      title: 'Dispatch 295 Pcs Sweatshirts to Pintu (Packing)',
      category: 'Allotment',
      priority: 'High',
      completed: true,
      reminderTime: '10:30 AM Today',
      createdAt: '2026-08-10',
    },
    {
      id: 'task-3',
      title: 'Check Stitching Line 3 output for Chrome Heart brand',
      category: 'Production',
      priority: 'Medium',
      completed: false,
      reminderTime: '03:00 PM Today',
      createdAt: '2026-08-10',
    },
    {
      id: 'task-4',
      title: 'Download PO documents for pending Winter Season lots',
      category: 'General',
      priority: 'Low',
      completed: false,
      reminderTime: '05:30 PM Today',
      createdAt: '2026-08-10',
    },
  ]);

  // Form & Filter States
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Active' | 'Completed' | 'High'
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  // New Task Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Production');
  const [newPriority, setNewPriority] = useState('High');
  const [newReminderTime, setNewReminderTime] = useState('Today at 04:00 PM');

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (activeFilter === 'Active') return !t.completed;
      if (activeFilter === 'Completed') return t.completed;
      if (activeFilter === 'High') return t.priority === 'High';
      return true;
    });
  }, [tasks, searchTerm, activeFilter]);

  // Task Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter((t) => t.priority === 'High' && !t.completed).length;
    return { total, completed, active, highPriority };
  }, [tasks]);

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) {
      Alert.alert('Task Title Required', 'Please enter a valid task description.');
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      completed: false,
      reminderTime: newReminderTime.trim() || 'Today',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setAddModalVisible(false);
  };

  const handleSelectTab = (tabKey) => {
    if (tabKey === 'stitching') {
      navigation.navigate('LotList', { department: 'Stitching', departmentId: 'stitching' });
    } else if (tabKey === 'packing') {
      navigation.navigate('LotList', { department: 'Packing', departmentId: 'packing' });
    } else if (tabKey === 'todo_issue') {
      navigation.navigate('TodoIssue');
    } else if (tabKey === 'todo_list') {
      // Already on Personal To-Do List screen
    } else if (tabKey === 'summary') {
      navigation.navigate('ExecutiveSummary');
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
              <Ionicons name="time-outline" size={12} color="#38BDF8" />
              <Text style={styles.statusPillText}>DAILY REMINDERS & TASK MANAGER</Text>
            </View>
            <Text style={styles.headerTitle}>My Daily To-Do List</Text>
          </View>
          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            style={styles.addHeaderBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color="#FFFFFF" />
            <Text style={styles.addHeaderBtnText}>ADD TASK</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Summary Bar */}
        <View style={styles.metricsBar}>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{metrics.total}</Text>
            <Text style={styles.metricLabel}>TOTAL TASKS</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: colors.primary }]}>{metrics.active}</Text>
            <Text style={styles.metricLabel}>PENDING</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: colors.error }]}>{metrics.highPriority}</Text>
            <Text style={styles.metricLabel}>HIGH PRIORITY</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, { color: '#059669' }]}>{metrics.completed}</Text>
            <Text style={styles.metricLabel}>DONE</Text>
          </View>
        </View>

        {/* Search Bar & Add Button Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks or categories..."
              placeholderTextColor={colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterBar}>
          {['All', 'Active', 'Completed', 'High'].map((f) => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Tasks Found</Text>
              <Text style={styles.emptySub}>
                {searchTerm
                  ? 'No tasks match your search query.'
                  : 'Tap "+ ADD TASK" at the top to add a new daily reminder.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const prioObj = PRIORITIES.find((p) => p.id === item.priority) || PRIORITIES[2];

            return (
              <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
                {/* Checkbox */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggleTask(item.id)}
                  style={[styles.checkbox, item.completed && styles.checkboxChecked]}
                >
                  {item.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </TouchableOpacity>

                {/* Body Content */}
                <View style={styles.taskBody}>
                  <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                    {item.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>

                    <View style={[styles.priorityBadge, { backgroundColor: prioObj.bg }]}>
                      <Text style={[styles.priorityBadgeText, { color: prioObj.color }]}>
                        {item.priority}
                      </Text>
                    </View>

                    <View style={styles.timeBadge}>
                      <Ionicons name="notifications-outline" size={11} color={colors.textMuted} />
                      <Text style={styles.timeBadgeText}>{item.reminderTime}</Text>
                    </View>
                  </View>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDeleteTask(item.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </LinearGradient>

      {/* Add Task Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set New Task Reminder</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Task Title */}
              <Text style={styles.fieldLabel}>Task Description</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Verify Lot #11180 shade and fabric status"
                placeholderTextColor={colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
                multiline
              />

              {/* Category */}
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.chipGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewCategory(cat)}
                    style={[styles.formChip, newCategory === cat && styles.formChipActive]}
                  >
                    <Text style={[styles.formChipText, newCategory === cat && styles.formChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Priority */}
              <Text style={styles.fieldLabel}>Priority Level</Text>
              <View style={styles.chipGrid}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setNewPriority(p.id)}
                    style={[
                      styles.formChip,
                      newPriority === p.id && { backgroundColor: p.color, borderColor: p.color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.formChipText,
                        newPriority === p.id && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Reminder Time */}
              <Text style={styles.fieldLabel}>Reminder Date & Time</Text>
              <TextInput
                style={styles.modalInputSingle}
                placeholder="e.g. Today at 04:30 PM"
                placeholderTextColor={colors.textMuted}
                value={newReminderTime}
                onChangeText={setNewReminderTime}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={handleAddTask} style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>SAVE TASK REMINDER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* WhatsApp Style Bottom Navigation Bar */}
      <BottomNavBar
        activeTab="todo_list"
        todoListCount={metrics.active}
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
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addHeaderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: '60%',
    backgroundColor: colors.cardBorder,
  },
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  taskCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeBadgeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginTop: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalBody: {
    maxHeight: 360,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    fontSize: 13,
    height: 70,
    color: colors.textPrimary,
  },
  modalInputSingle: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    fontSize: 13,
    height: 44,
    color: colors.textPrimary,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  formChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  formChipTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    marginTop: 16,
  },
  submitBtn: {
    backgroundColor: colors.primaryDark,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
