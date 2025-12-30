import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeRelative() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TRANG CHỦ THÂN NHÂN</Text>
      <Text style={styles.subtitle}>Chức năng: Đăng ký thăm, Xem lịch hẹn</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff5f5' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#d32f2f' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 }
});