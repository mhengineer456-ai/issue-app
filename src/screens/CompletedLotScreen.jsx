import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fetchCompletedLots, submitLotApproval, isLotAllowedForUser } from '../services/lotService';
import CompletedLotCard from '../components/CompletedLotCard';
import BottomNavBar from '../components/BottomNavBar';

const CUSTOM_API_KEY_STORAGE = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';

export default function CompletedLotScreen({ route, navigation }) {
  const user = route.params?.user || {
    operatorId: 'ST-708',
    stationId: 'stitching',
    station: 'Stitching Dept',
  };

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Custom API Key Modal State
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [inputApiKey, setInputApiKey] = useState('');

  const [errorCode, setErrorCode] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('All');
  const [selectedGarmentType, setSelectedGarmentType] = useState('All');

  // Filter Dropdown Modal States
  const [supervisorModalVisible, setSupervisorModalVisible] = useState(false);
  const [garmentModalVisible, setGarmentModalVisible] = useState(false);

  // Image Modal
  const [previewImage, setPreviewImage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setErrorCode(null);
      const savedKey = await AsyncStorage.getItem(CUSTOM_API_KEY_STORAGE);
      const activeKey = savedKey || customApiKey || null;
      const res = await fetchCompletedLots(activeKey);
      if (res.error) {
        setErrorCode(res.error);
        setErrorMessage(res.message || `Unable to fetch completed lots (${res.error}).`);
        setLots([]);
      } else {
        setErrorCode(null);
        setLots(res.lots || []);
      }
    } catch (err) {
      setErrorCode('NETWORK_ERROR');
      setErrorMessage('Network error occurred while fetching completed lots.');
      setLots([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSavedApiKey();
  }, []);

  const loadSavedApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(CUSTOM_API_KEY_STORAGE);
      if (savedKey) {
        setCustomApiKey(savedKey);
        setInputApiKey(savedKey);
      }
    } catch (e) {
      // ignore
    }
    loadData();
  };

  const handleSaveApiKey = async () => {
    if (!inputApiKey.trim()) return;
    try {
      await AsyncStorage.setItem(CUSTOM_API_KEY_STORAGE, inputApiKey.trim());
      setCustomApiKey(inputApiKey.trim());
      setApiKeyModalVisible(false);
      setLoading(true);
      const res = await fetchCompletedLots(inputApiKey.trim());
      if (res.error) {
        setErrorMessage(res.message || `Unable to fetch completed lots (${res.error}).`);
        setLots([]);
      } else {
        setErrorMessage(null);
        setLots(res.lots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDirectApprovalSubmission = async (lotItem) => {
    if (!lotItem || !lotItem.lotNumber) return;
    try {
      // 1. Show loading spinner on card button
      setLots((prevLots) =>
        prevLots.map((l) =>
          l.lotNumber === lotItem.lotNumber
            ? { ...l, isSubmittingApproval: true }
            : l
        )
      );

      // 2. Await Master Index Sheet update
      await submitLotApproval({
        lotNumber: lotItem.lotNumber,
        supervisor: lotItem.supervisor || user.name || 'MONU',
        remarks: 'Approval Submitted via Pintu',
        status: 'Complete Lot',
      });
    } catch (e) {
      console.warn('Direct approval submission error:', e.message);
    } finally {
      // 3. Remove the approved lot from Completed Lot UI list
      setLots((prevLots) => prevLots.filter((l) => l.lotNumber !== lotItem.lotNumber));
    }
  };

  // Supervisor list for dropdown filter
  const supervisorsList = useMemo(() => {
    const set = new Set();
    lots.forEach((item) => {
      if (item.supervisor && item.supervisor !== 'N/A') {
        set.add(item.supervisor.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [lots]);

  // Garment Type list for dropdown filter
  const garmentTypesList = useMemo(() => {
    const set = new Set();
    lots.forEach((item) => {
      if (item.garmentType && item.garmentType !== 'N/A') {
        set.add(item.garmentType.trim());
      }
    });
    return ['All', ...Array.from(set)];
  }, [lots]);

  // Filtered lots
  const filteredLots = useMemo(() => {
    return lots.filter((item) => {
      // User/Operator Scoping (SHEELAGURU sees only assigned Garment Types, PINTU sees ALL)
      if (!isLotAllowedForUser(user, item)) {
        return false;
      }
      // Supervisor filter
      if (selectedSupervisor !== 'All' && item.supervisor !== selectedSupervisor) {
        return false;
      }
      // Garment Type filter
      if (selectedGarmentType !== 'All' && item.garmentType !== selectedGarmentType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchLot = item.lotNumber.toString().toLowerCase().includes(q);
        const matchBrand = item.brand.toString().toLowerCase().includes(q);
        const matchSupervisor = item.supervisor.toString().toLowerCase().includes(q);
        const matchParty = item.partyName.toString().toLowerCase().includes(q);
        const matchFabric = item.fabric.toString().toLowerCase().includes(q);
        const matchGarment = item.garmentType.toString().toLowerCase().includes(q);
        const matchRecordId = item.recordId.toString().toLowerCase().includes(q);
        return (
          matchLot ||
          matchBrand ||
          matchSupervisor ||
          matchParty ||
          matchFabric ||
          matchGarment ||
          matchRecordId
        );
      }
      return true;
    });
  }, [lots, searchQuery, selectedSupervisor, selectedGarmentType]);

  // Metrics
  const totalCompletedPcs = useMemo(() => {
    return filteredLots.reduce((acc, curr) => acc + (curr.pcsQty || 0), 0);
  }, [filteredLots]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0F172A', '#1E40AF', '#F8FAFC']} style={styles.container}>
        {/* Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Completed Lots</Text>
            <Text style={styles.headerSubtitle}>Finished Production & Dispatched Lots</Text>
          </View>

          <View style={styles.topRightHeaderBtns}>
            <TouchableOpacity onPress={() => setApiKeyModalVisible(true)} style={styles.headerKeyBtn}>
              <Ionicons name="key-outline" size={18} color="#FDE68A" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Banner */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Ionicons name="checkmark-done-circle-outline" size={22} color="#047857" />
            <Text style={styles.metricNumber}>{filteredLots.length}</Text>
            <Text style={styles.metricLabel}>Completed Lots</Text>
          </View>

          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="counter" size={22} color={colors.primary} />
            <Text style={styles.metricNumber}>{totalCompletedPcs.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Pcs</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="people-outline" size={22} color={colors.stitching} />
            <Text style={styles.metricNumber}>{supervisorsList.length - 1}</Text>
            <Text style={styles.metricLabel}>Supervisors</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Lot #, Brand, Supervisor, Party..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Dropdown Filters Bar (Supervisor & Garment Type) */}
        <View style={styles.dropdownFilterRow}>
          {/* Supervisor Dropdown Trigger */}
          <TouchableOpacity
            style={[
              styles.dropdownSelectBox,
              selectedSupervisor !== 'All' && styles.dropdownSelectBoxActive,
            ]}
            onPress={() => setSupervisorModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={16} color={selectedSupervisor !== 'All' ? '#1D4ED8' : '#64748B'} />
            <Text style={[styles.dropdownSelectText, selectedSupervisor !== 'All' && styles.dropdownSelectTextActive]} numberOfLines={1}>
              {selectedSupervisor === 'All' ? 'All Supervisors' : selectedSupervisor}
            </Text>
            <Ionicons name="chevron-down" size={16} color={selectedSupervisor !== 'All' ? '#1D4ED8' : '#64748B'} />
          </TouchableOpacity>

          {/* Garment Type Dropdown Trigger */}
          <TouchableOpacity
            style={[
              styles.dropdownSelectBox,
              selectedGarmentType !== 'All' && styles.dropdownSelectBoxActive,
            ]}
            onPress={() => setGarmentModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="shirt-outline" size={16} color={selectedGarmentType !== 'All' ? '#1D4ED8' : '#64748B'} />
            <Text style={[styles.dropdownSelectText, selectedGarmentType !== 'All' && styles.dropdownSelectTextActive]} numberOfLines={1}>
              {selectedGarmentType === 'All' ? 'All Garments' : selectedGarmentType}
            </Text>
            <Ionicons name="chevron-down" size={16} color={selectedGarmentType !== 'All' ? '#1D4ED8' : '#64748B'} />
          </TouchableOpacity>

          {/* Reset Filters Button */}
          {(selectedSupervisor !== 'All' || selectedGarmentType !== 'All') && (
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={() => {
                setSelectedSupervisor('All');
                setSelectedGarmentType('All');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>

        {/* Main List Area */}
        <View style={styles.listContainer}>
          {loading && !refreshing ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Fetching Completed Lots live...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.errorWrapper}>
              {errorCode === 'RATE_LIMIT_429' ? (
                <>
                  <Ionicons name="time-outline" size={44} color={colors.accentGold} />
                  <Text style={styles.errorTitle}>API Rate Limit Reached (429)</Text>
                  <Text style={styles.errorText}>
                    Google Sheets API rate limit was temporarily reached.
                  </Text>
                  <View style={styles.rateLimitBox}>
                    <Text style={styles.rateLimitTitle}>Quick Fix:</Text>
                    <Text style={styles.rateLimitText}>• Wait 10-15 seconds and tap <Text style={styles.boldText}>Retry</Text> below.</Text>
                    <Text style={styles.rateLimitText}>• Or tap <Text style={styles.boldText}>API Key</Text> to use your own Google Cloud API Key for unlimited requests.</Text>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons name="lock-closed-outline" size={44} color={colors.error} />
                  <Text style={styles.errorTitle}>Google Sheet Access Restricted</Text>
                  <Text style={styles.errorText}>
                    The Google Sheet ("REQUIREMENTS") is currently set to private/restricted.
                  </Text>
                  <View style={styles.stepsBox}>
                    <Text style={styles.stepTitle}>To fix this in 10 seconds:</Text>
                    <Text style={styles.stepText}>1. Open your Google Sheet in browser</Text>
                    <Text style={styles.stepText}>2. Click top-right blue <Text style={styles.boldText}>Share</Text> button</Text>
                    <Text style={styles.stepText}>3. Change access from <Text style={styles.boldText}>Restricted</Text> to <Text style={styles.boldText}>"Anyone with the link"</Text> (Viewer)</Text>
                  </View>
                </>
              )}

              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://docs.google.com/spreadsheets/d/1Ydzo9F2FUsU_VTQdUfz12uQ_l4E_B0fhp0w4H0DYA')}
                  style={styles.openSheetBtn}
                >
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                  <Text style={styles.openSheetBtnText}>Open Sheet</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setApiKeyModalVisible(true)}
                  style={styles.keyBtn}
                >
                  <Ionicons name="key-outline" size={16} color={colors.accentGold} />
                  <Text style={styles.keyBtnText}>API Key</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : filteredLots.length === 0 ? (
            <View style={styles.emptyWrapper}>
              <Ionicons name="layers-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Completed Lots Found</Text>
              <Text style={styles.emptySub}>
                {searchQuery || selectedSupervisor !== 'All'
                  ? 'Try clearing your search filters'
                  : 'No completed lot records found in sheet.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLots}
              keyExtractor={(item) => item.id || item.recordId || item.lotNumber}
              renderItem={({ item }) => (
                <CompletedLotCard
                  item={item}
                  onImagePreview={(imgUrl) => setPreviewImage(imgUrl)}
                  onApprovalSubmission={handleDirectApprovalSubmission}
                />
              )}
              contentContainerStyle={styles.flatListContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
              }
            />
          )}
        </View>

        {/* Bottom Navigation */}
        <BottomNavBar
          activeTab="completed"
          completedCount={filteredLots.length}
          onSelectTab={(tabKey) => {
            if (tabKey === 'stitching') {
              navigation.navigate('LotList', { department: 'Stitching', departmentId: 'stitching', user });
            } else if (tabKey === 'packing') {
              navigation.navigate('LotList', { department: 'Packing', departmentId: 'packing', user });
            } else if (tabKey === 'completed') {
              // Already on completed lots
            } else if (tabKey === 'todo_issue') {
              navigation.navigate('TodoIssue', { user });
            } else if (tabKey === 'todo_list') {
              navigation.navigate('TodoList', { user });
            } else {
              navigation.navigate('ExecutiveSummary', { user });
            }
          }}
        />
      </LinearGradient>

      {/* Custom Google API Key Input Modal */}
      <Modal visible={apiKeyModalVisible} transparent animationType="slide">
        <View style={styles.apiKeyModalOverlay}>
          <View style={styles.apiKeyModalCard}>
            <View style={styles.apiKeyHeader}>
              <Ionicons name="key" size={22} color={colors.primary} />
              <Text style={styles.apiKeyModalTitle}>Custom Google API Key</Text>
            </View>
            <Text style={styles.apiKeyModalSub}>
              Paste your Google Cloud API key below to query your private Google Sheets directly.
            </Text>

            <TextInput
              style={styles.apiKeyInput}
              placeholder="Paste AIzaSy... Google API Key here"
              placeholderTextColor={colors.textMuted}
              value={inputApiKey}
              onChangeText={setInputApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.apiKeyModalBtnRow}>
              <TouchableOpacity
                onPress={() => setApiKeyModalVisible(false)}
                style={styles.cancelKeyBtn}
              >
                <Text style={styles.cancelKeyBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveApiKey}
                style={styles.saveKeyBtn}
              >
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.saveKeyBtnText}>Save & Fetch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Image Preview Modal */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity onPress={() => setPreviewImage(null)} style={styles.modalCloseBtn}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.modalImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>

      {/* Supervisor Filter Dropdown Modal */}
      <Modal
        visible={supervisorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSupervisorModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setSupervisorModalVisible(false)}
        >
          <View style={styles.dropdownModalCard}>
            <View style={styles.dropdownModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="person" size={18} color="#1E40AF" />
                <Text style={styles.dropdownModalTitle}>Filter by Supervisor</Text>
              </View>
              <TouchableOpacity onPress={() => setSupervisorModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={supervisorsList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOptionRow,
                    selectedSupervisor === item && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedSupervisor(item);
                    setSupervisorModalVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownOptionText, selectedSupervisor === item && styles.dropdownOptionTextSelected]}>
                    {item === 'All' ? 'All Supervisors' : item}
                  </Text>
                  {selectedSupervisor === item && (
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Garment Type Filter Dropdown Modal */}
      <Modal
        visible={garmentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGarmentModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setGarmentModalVisible(false)}
        >
          <View style={styles.dropdownModalCard}>
            <View style={styles.dropdownModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shirt" size={18} color="#1E40AF" />
                <Text style={styles.dropdownModalTitle}>Filter by Garment Type</Text>
              </View>
              <TouchableOpacity onPress={() => setGarmentModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={garmentTypesList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownOptionRow,
                    selectedGarmentType === item && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedGarmentType(item);
                    setGarmentModalVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownOptionText, selectedGarmentType === item && styles.dropdownOptionTextSelected]}>
                    {item === 'All' ? 'All Garments' : item}
                  </Text>
                  {selectedGarmentType === item && (
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : Platform.OS === 'ios' ? 12 : 0,
  },
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 6 : 8,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleGroup: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  topRightHeaderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerKeyBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.4)',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(15, 23, 42, 0.08)' },
      default: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  metricNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  supervisorFilterWrapper: {
    marginBottom: 8,
  },
  supervisorFilterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  errorWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 14,
  },
  stepsBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    maxWidth: 340,
    marginBottom: 16,
  },
  rateLimitBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    maxWidth: 340,
    marginBottom: 16,
  },
  rateLimitTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B46617',
    marginBottom: 6,
  },
  rateLimitText: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 18,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.error,
    marginBottom: 6,
  },
  stepText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '900',
    color: '#7F1D1D',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  openSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  openSheetBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  keyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  keyBtnText: {
    color: '#B46617',
    fontSize: 12,
    fontWeight: '800',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  apiKeyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  apiKeyModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  apiKeyModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  apiKeyModalSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  apiKeyInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 20,
  },
  apiKeyModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelKeyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelKeyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  saveKeyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },

  /* Approval Submission Modal Styles */
  approvalModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  approvalModalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.25)' },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
    }),
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    gap: 12,
  },
  approvalIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalHeaderTitleGroup: {
    flex: 1,
  },
  approvalModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#065F46',
  },
  approvalModalSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginTop: 1,
  },
  closeApprovalBtn: {
    padding: 6,
  },
  approvalFormBody: {
    padding: 18,
  },
  lotSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 6,
  },
  lotSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lotSummaryLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  lotSummaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  lotSummaryQty: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  typeChipActive: {
    backgroundColor: '#059669',
    borderColor: '#047857',
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  submitApprovalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
  },
  submitApprovalBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  approvalSuccessCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalSuccessTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#065F46',
    marginTop: 10,
  },
  approvalSuccessSub: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  dropdownFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  dropdownSelectBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownSelectBoxActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  dropdownSelectText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownSelectTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  resetFilterBtn: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  dropdownModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownOptionSelected: {
    backgroundColor: '#ECFDF5',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  dropdownOptionTextSelected: {
    fontWeight: '700',
    color: '#047857',
  },
});
