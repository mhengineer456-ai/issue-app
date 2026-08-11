import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function ImagePreviewModal({ visible, imageUri, onClose, lotNumber = '' }) {
  if (!visible || !imageUri) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalImageOverlay}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />

        {/* Modal Content Header */}
        <View style={styles.previewHeader}>
          {lotNumber ? (
            <Text style={styles.previewTitle}>Lot #{lotNumber} Image Preview</Text>
          ) : (
            <Text style={styles.previewTitle}>Garment Style Preview</Text>
          )}

          <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Full Screen High Res Image View */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.fullPreviewImage} resizeMode="contain" />
        </View>

        {/* Footer info */}
        <View style={styles.footerInfo}>
          <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
          <Text style={styles.footerText}>Tap anywhere outside or close button to dismiss</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.92,
    height: height * 0.72,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  fullPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
