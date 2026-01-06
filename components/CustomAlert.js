import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle2, AlertCircle, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const CustomAlert = ({ visible, type, message, onClose, autoClose = false, confirmMode = false, onConfirm, confirmText = 'Có', cancelText = 'Hủy' }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      if (autoClose) {
        const timer = setTimeout(() => {
          onClose && onClose();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.alertBox, { opacity }]}>
        <View style={[styles.iconContainer, { backgroundColor: isSuccess ? '#E8F5E9' : '#FFEBEE' }]}>
          {isSuccess ? (
            <CheckCircle2 color="#2E7D32" size={32} />
          ) : (
            <AlertCircle color="#D32F2F" size={32} />
          )}
        </View>

        <Text style={styles.message}>{message}</Text>

        {confirmMode ? (
          <View style={styles.confirmRow}>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#EEE' }]} onPress={() => onClose && onClose()}>
              <Text style={styles.confirmText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: isSuccess ? '#E8F5E9' : '#FDECEF' }]} onPress={() => onConfirm && onConfirm()}>
              <Text style={[styles.confirmText, { color: isSuccess ? '#2E7D32' : '#E53935' }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          !autoClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          )
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  alertBox: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  message: { fontSize: 16, textAlign: 'center', color: '#333', marginBottom: 20, fontWeight: '500' },
  closeButton: { backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10 },
  closeButtonText: { color: 'white', fontWeight: 'bold' },
  confirmRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  confirmBtn: { flex: 1, paddingVertical: 10, marginHorizontal: 6, borderRadius: 10, alignItems: 'center' },
  confirmText: { fontWeight: '700' },
});

export default CustomAlert;