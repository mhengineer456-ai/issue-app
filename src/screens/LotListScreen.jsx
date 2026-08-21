import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchAvailableLots, fetchSupervisors, savePackingAllotment, saveStitchingAllotment, isLotAllowedForUser } from '../services/lotService';


// Segregated Components
import HeaderBar from '../components/HeaderBar';
import SearchAndFilterBar from '../components/SearchAndFilterBar';
import SummaryMetricsBar from '../components/SummaryMetricsBar';
import LotCard from '../components/LotCard';
import ImagePreviewModal from '../components/ImagePreviewModal';
import AllotmentAuthModal from '../components/AllotmentAuthModal';
import MultiSelectFilterModal from '../components/MultiSelectFilterModal';
import LoadingOverlay from '../components/LoadingOverlay';
import BottomNavBar from '../components/BottomNavBar';
import TodoIssueModal from '../components/TodoIssueModal';
import ExecutiveSummaryModal from '../components/ExecutiveSummaryModal';

export default function LotListScreen({ route, navigation }) {
  const { department = 'Stitching', departmentId = 'stitching', user } = route.params || {};

  const [currentDept, setCurrentDept] = useState({
    name: department,
    id: departmentId,
  });

  const isStitching = currentDept.id === 'stitching';
  const isPacking = currentDept.id === 'packing';
  const deptThemeColor = isStitching ? colors.stitching : isPacking ? colors.packing : colors.primary;

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Live Supervisors State
  const [supervisors, setSupervisors] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);

  // Sync / Update Loading Overlay State
  const [syncOverlay, setSyncOverlay] = useState({
    visible: false,
    title: 'Updating Google Sheet...',
    subTitle: 'Syncing lot allotment data via Google Apps Script Web App',
    isSuccess: false,
    successMessage: 'Allotment Completed Successfully! 🎉',
  });

  // Modal & Issued Lots States
  const [allotmentAuthLot, setAllotmentAuthLot] = useState(null);
  const [activeModalFilter, setActiveModalFilter] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [todayIssuedLots, setTodayIssuedLots] = useState([]);





  // Filter States
  const [filters, setFilters] = useState({
    supervisor: [],
    fabric: [],
    brand: [],
    garmentType: [],
    status: [],
    colorPending: '',
  });

  useEffect(() => {
    loadLots(currentDept.name);
    loadSupervisorsData();
  }, [currentDept]);

  const loadLots = async (targetDeptName = currentDept.name) => {
    setLoading(true);
    setErrorInfo(null);
    const result = await fetchAvailableLots(targetDeptName);
    if (result.error) {
      setErrorInfo(result);
      setLots([]);
    } else {
      setErrorInfo(null);
      setLots(result.lots || []);
    }
    setLoading(false);
  };

  const loadSupervisorsData = async () => {
    setLoadingSupervisors(true);
    const res = await fetchSupervisors();
    setSupervisors(res.supervisors || []);
    setLoadingSupervisors(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setErrorInfo(null);
    const [lotsRes] = await Promise.all([
      fetchAvailableLots(currentDept.name),
      loadSupervisorsData(),
    ]);
    if (lotsRes.error) {
      setErrorInfo(lotsRes);
      setLots([]);
    } else {
      setErrorInfo(null);
      setLots(lotsRes.lots || []);
    }
    setRefreshing(false);
  };

  const handleBottomTabSelect = (tabKey) => {
    if (tabKey === 'stitching') {
      setCurrentDept({ name: 'Stitching', id: 'stitching' });
    } else if (tabKey === 'packing') {
      setCurrentDept({ name: 'Packing', id: 'packing' });
    } else if (tabKey === 'completed') {
      navigation.navigate('CompletedLot', { user });
    } else if (tabKey === 'todo_issue') {
      navigation.navigate('TodoIssue', { user, todayIssuedLots, availableLotsCount: lots.length });
    } else if (tabKey === 'todo_list') {
      navigation.navigate('TodoList', { user, todayIssuedLots });
    } else if (tabKey === 'summary') {
      navigation.navigate('ExecutiveSummary', { user, lots, todayIssuedLots });
    }
  };






  // Derive unique filter options
  const filterOptions = useMemo(() => {
    const supervisorSet = new Set();
    const fabrics = new Set();
    const brands = new Set();
    const garmentTypes = new Set();
    const statuses = new Set(['Direct', 'Ready for Stitching', 'Printing Working', 'Embroidery Working', 'Pending', 'Stitching Completed']);

    lots.forEach((lot) => {
      if (lot.stitchingSupervisor && lot.stitchingSupervisor !== 'N/A') supervisorSet.add(lot.stitchingSupervisor);
      if (lot.Fabric && lot.Fabric !== 'N/A') fabrics.add(lot.Fabric);
      if (lot.Brand && lot.Brand !== 'N/A') brands.add(lot.Brand);
      if (lot['Garment Type'] && lot['Garment Type'] !== 'N/A') garmentTypes.add(lot['Garment Type']);
      if (lot.status) statuses.add(lot.status);
    });

    return {
      supervisor: Array.from(supervisorSet),
      fabric: Array.from(fabrics),
      brand: Array.from(brands),
      garmentType: Array.from(garmentTypes),
      status: Array.from(statuses),
    };
  }, [lots]);

  // Filtered dataset
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      // User/Operator Scoping (SHEELAGURU sees only assigned Garment Types, PINTU sees ALL)
      if (!isLotAllowedForUser(user, lot)) {
        return false;
      }
      if (filters.supervisor.length > 0 && !filters.supervisor.includes(lot.stitchingSupervisor)) {
        return false;
      }
      if (filters.fabric.length > 0 && !filters.fabric.includes(lot.Fabric)) {
        return false;
      }
      if (filters.brand.length > 0 && !filters.brand.includes(lot.Brand)) {
        return false;
      }
      if (filters.garmentType.length > 0 && !filters.garmentType.includes(lot['Garment Type'])) {
        return false;
      }
      if (filters.status.length > 0 && !filters.status.includes(lot.status)) {
        return false;
      }
      if (filters.colorPending) {
        if (filters.colorPending === 'Yes' && !lot.hasColorPending) return false;
        if (filters.colorPending === 'No' && lot.hasColorPending) return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const searchable = `${lot['Lot Number']} ${lot.Brand} ${lot.Fabric} ${lot['Garment Type']} ${lot.Style} ${lot.stitchingSupervisor}`.toLowerCase();
        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [lots, filters, searchTerm, user]);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalLots = filteredLots.length;
    const totalPcs = filteredLots.reduce((sum, item) => {
      const val = parseInt(item['Total Pcs'], 10);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    const colorPendingCount = filteredLots.filter((item) => item.hasColorPending).length;
    return { totalLots, totalPcs, colorPendingCount };
  }, [filteredLots]);

  const handleAllotLot = (lot) => {
    setAllotmentAuthLot(lot);
  };

  const handleConfirmAllotment = async ({ lot, authorizedBy, supervisor }) => {
    setAllotmentAuthLot(null);

    const newIssuedRecord = {
      lotNumber: lot['Lot Number'],
      garmentType: lot['Garment Type'] || 'N/A',
      fabric: lot.Fabric || 'N/A',
      style: lot.Style || 'N/A',
      brand: lot.Brand || 'N/A',
      totalPcs: lot['Total Pcs'] || 0,
      department: currentDept.name,
      supervisor: supervisor.name,
      authorizedBy: authorizedBy,
      issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSyncOverlay({
      visible: true,
      title: `Saving Lot #${lot['Lot Number']}...`,
      subTitle: `Submitting allotment to ${supervisor.name} (${currentDept.name} Dept) into Google Sheet Issues...`,
      isSuccess: false,
      successMessage: `Lot #${lot['Lot Number']} Allotted Successfully! 🎉`,
    });

    if (isPacking) {
      const res = await savePackingAllotment({ lot, supervisor, authorizedBy });

      if (res && res.ok) {
        setSyncOverlay((prev) => ({
          ...prev,
          isSuccess: true,
          successMessage: `Lot #${lot['Lot Number']} (${lot['Total Pcs']} Pcs) Saved to Issues Sheet!`,
        }));
        setTodayIssuedLots((prev) => [newIssuedRecord, ...prev]);
        setTimeout(() => {
          setSyncOverlay({ visible: false, title: '', subTitle: '', isSuccess: false, successMessage: '' });
          setLots((prev) => prev.filter((item) => item['Lot Number'] !== lot['Lot Number']));
        }, 1300);
      } else {
        setSyncOverlay({ visible: false, title: '', subTitle: '', isSuccess: false, successMessage: '' });
        setTodayIssuedLots((prev) => [newIssuedRecord, ...prev]);
        setLots((prev) => prev.filter((item) => item['Lot Number'] !== lot['Lot Number']));
        Alert.alert(
          'Lot Allotted',
          `Lot #${lot['Lot Number']} (${lot['Total Pcs']} Pcs) allotted to ${supervisor.name}.\n${
            res?.error === 'APPS_SCRIPT_URL not configured'
              ? '(Please add your Google Apps Script Web App URL to src/credentials.js)'
              : 'Sheet Sync Status: ' + (res?.error || 'Local updated')
          }`
        );
      }
    } else {
      const res = await saveStitchingAllotment({ lot, supervisor, authorizedBy });

      if (res && res.ok) {
        setSyncOverlay((prev) => ({
          ...prev,
          isSuccess: true,
          successMessage: `Lot #${lot['Lot Number']} (${lot['Total Pcs']} Pcs) Saved to Stitching Sheet!`,
        }));
        setTodayIssuedLots((prev) => [newIssuedRecord, ...prev]);
        setTimeout(() => {
          setSyncOverlay({ visible: false, title: '', subTitle: '', isSuccess: false, successMessage: '' });
          setLots((prev) => prev.filter((item) => item['Lot Number'] !== lot['Lot Number']));
        }, 1300);
      } else {
        setSyncOverlay({ visible: false, title: '', subTitle: '', isSuccess: false, successMessage: '' });
        setTodayIssuedLots((prev) => [newIssuedRecord, ...prev]);
        setLots((prev) => prev.filter((item) => item['Lot Number'] !== lot['Lot Number']));
        Alert.alert(
          'Lot Allotted',
          `Lot #${lot['Lot Number']} (${lot['Total Pcs']} Pcs) allotted to ${supervisor.name}.\n${
            res?.error === 'APPS_SCRIPT_URL not configured'
              ? '(Please add your Google Apps Script Web App URL to src/credentials.js)'
              : 'Sheet Sync Status: ' + (res?.error || 'Local updated')
          }`
        );
      }
    }
  };




  const clearAllFilters = () => {
    setFilters({
      supervisor: [],
      fabric: [],
      brand: [],
      garmentType: [],
      status: [],
      colorPending: '',
    });
    setSearchTerm('');
  };

  const activeFilterCount =
    filters.supervisor.length +
    filters.fabric.length +
    filters.brand.length +
    filters.garmentType.length +
    filters.status.length +
    (filters.colorPending ? 1 : 0);
    (filters.colorPending ? 1 : 0);

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.container}>

        {/* 1. Header Bar */}
        <HeaderBar
          department={currentDept.name}
          deptThemeColor={deptThemeColor}
          isStitching={isStitching}
          onBackPress={handleBackPress}
          onOpenCompleted={() => navigation.navigate('CompletedLot')}
          onOpenSummary={() => navigation.navigate('ExecutiveSummary', { lots, todayIssuedLots })}
        />




        {/* 2. Search & Filter Bar */}
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          isPacking={isPacking}
          onOpenFilterModal={setActiveModalFilter}
          onToggleColorPending={() =>
            setFilters((prev) => ({
              ...prev,
              colorPending: prev.colorPending === 'Yes' ? '' : 'Yes',
            }))
          }
          onClearAllFilters={clearAllFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* 3. Summary Metrics Bar */}
        <SummaryMetricsBar summary={summary} deptThemeColor={deptThemeColor} isPacking={isPacking} />

        {/* Credentials Setup Banner if Missing */}
        {errorInfo ? (
          <View style={styles.errorBox}>
            <View style={styles.errorHeaderRow}>
              <Ionicons name="key" size={24} color={colors.cutting} />
              <Text style={styles.errorHeaderTitle}>
                {errorInfo.error === 'MISSING_CREDENTIALS' ? 'Google Credentials Required' : 'Sheet Connection Error'}
              </Text>
            </View>
            <Text style={styles.errorMsgText}>{errorInfo.message}</Text>
            <TouchableOpacity onPress={loadLots} style={styles.retryBtn}>
              <Ionicons name="reload" size={14} color="#FFFFFF" />
              <Text style={styles.retryBtnText}>Retry Loading Live Sheet</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 4. Lots List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={deptThemeColor} />
            <Text style={styles.loadingText}>Fetching live sheet lots...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLots}
            keyExtractor={(item) => item['Lot Number']}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              !errorInfo ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color={colors.textMuted} />
                  <Text style={styles.emptyTitle}>No Available Lots Found</Text>
                  <Text style={styles.emptySub}>
                    No unassigned lots matching your filter criteria in the live Google Sheet.
                  </Text>
                  {activeFilterCount > 0 && (
                    <TouchableOpacity onPress={clearAllFilters} style={styles.emptyResetBtn}>
                      <Text style={styles.emptyResetText}>Reset All Filters</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <LotCard
                item={item}
                department={currentDept.name}
                isStitching={isStitching}
                isPacking={isPacking}
                deptThemeColor={deptThemeColor}
                onImagePreview={setPreviewImage}
                onAllotPress={handleAllotLot}
              />
            )}

          />
        )}
      </LinearGradient>

      {/* 5. Allotment Authorization Modal */}
      {allotmentAuthLot && (
        <AllotmentAuthModal
          visible={!!allotmentAuthLot}
          lot={allotmentAuthLot}
          department={currentDept.name}
          supervisors={supervisors}
          loadingSupervisors={loadingSupervisors}
          onClose={() => setAllotmentAuthLot(null)}
          onConfirmAllotment={handleConfirmAllotment}
        />
      )}

      {/* 6. Multi-Select Filter Modal */}
      {activeModalFilter && (
        <MultiSelectFilterModal
          visible={!!activeModalFilter}
          title={
            activeModalFilter === 'supervisor'
              ? 'Stitching Supervisor'
              : activeModalFilter === 'brand'
              ? 'Brand'
              : activeModalFilter === 'fabric'
              ? 'Fabric'
              : activeModalFilter === 'garmentType'
              ? 'Garment Type'
              : 'Status'
          }
          options={filterOptions[activeModalFilter] || []}
          selectedValues={filters[activeModalFilter] || []}
          onClose={() => setActiveModalFilter(null)}
          onApply={(selected) => {
            setFilters((prev) => ({ ...prev, [activeModalFilter]: selected }));
          }}
        />
      )}

      {/* 7. WhatsApp Style Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={currentDept.id}
        stitchingCount={isStitching ? filteredLots.length : 0}
        packingCount={isPacking ? filteredLots.length : 0}
        issuedTodayCount={todayIssuedLots.length}
        onSelectTab={handleBottomTabSelect}
      />


      {/* 8. TODO Issue Lot Status Form Dashboard Modal */}
      <TodoIssueModal
        visible={todoModalVisible}
        lots={lots}
        todayIssuedLots={todayIssuedLots}
        onClose={() => setTodoModalVisible(false)}
        onSelectDepartment={(deptName, deptId) => {
          setCurrentDept({ name: deptName, id: deptId });
        }}
        onFilterColorPending={() => {
          setFilters((prev) => ({ ...prev, colorPending: 'Yes' }));
        }}
        onFilterPriority={() => {
          setSearchTerm('Repeated');
        }}
        onOpenExecutiveSummary={() => setSummaryModalVisible(true)}
      />



      {/* 9. Production Executive Summary Modal */}
      <ExecutiveSummaryModal
        visible={summaryModalVisible}
        lots={lots}
        currentDepartment={currentDept.name}
        onClose={() => setSummaryModalVisible(false)}
      />

      {/* 10. High Res Image Preview Modal */}
      <ImagePreviewModal
        visible={!!previewImage}
        imageUri={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      {/* 11. Live Sync / Update Loading Overlay */}
      <LoadingOverlay
        visible={syncOverlay.visible}
        title={syncOverlay.title}
        subTitle={syncOverlay.subTitle}
        isSuccess={syncOverlay.isSuccess}
        successMessage={syncOverlay.successMessage}
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
  errorBox: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  errorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  errorHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.cutting,
  },
  errorMsgText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    fontWeight: '500',
  },
  retryBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.cutting,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyResetBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyResetText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
});
