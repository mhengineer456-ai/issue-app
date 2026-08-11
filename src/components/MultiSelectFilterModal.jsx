import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function MultiSelectFilterModal({
  visible,
  title,
  options = [],
  selectedValues = [],
  onClose,
  onApply,
}) {
  const [tempSelected, setTempSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (visible) {
      setTempSelected([...selectedValues]);
      setSearchTerm('');
    }
  }, [visible, selectedValues]);

  const handleToggle = (option) => {
    if (tempSelected.includes(option)) {
      setTempSelected(tempSelected.filter((item) => item !== option));
    } else {
      setTempSelected([...tempSelected, option]);
    }
  };

  const handleSelectAll = () => {
    setTempSelected([...options]);
  };

  const handleClearAll = () => {
    setTempSelected([]);
  };

  const filteredOptions = options.filter((opt) =>
    opt ? opt.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  const handleConfirm = () => {
    onApply(tempSelected);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter by {title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${title.toLowerCase()}...`}
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

          {/* Actions Bar */}
          <View style={styles.actionsBar}>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={styles.actionLinkBlue}>Select All ({options.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.actionLinkRed}>Clear Selected</Text>
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
            {filteredOptions.length === 0 ? (
              <Text style={styles.noResultsText}>No options matching "{searchTerm}"</Text>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = tempSelected.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.7}
                    onPress={() => handleToggle(option)}
                    style={[styles.optionRow, isChecked && styles.optionRowActive]}
                  >
                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                      {isChecked && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                    <Text style={[styles.optionText, isChecked && styles.optionTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirm} style={styles.applyBtn}>
              <Text style={styles.applyText}>
                Apply ({tempSelected.length})
              </Text>
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
    backgroundColor: 'rgba(12, 59, 46, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0px -4px 20px rgba(12, 59, 46, 0.15)' },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  closeBtn: {
    padding: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8EAD9',
    marginBottom: 8,
  },
  actionLinkBlue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  actionLinkRed: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.error,
  },
  listScroll: {
    maxHeight: 280,
  },
  noResultsText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 20,
    fontSize: 13,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: '#EBF5EC',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  optionTextActive: {
    fontWeight: '800',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
