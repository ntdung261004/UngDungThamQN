import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeCanBo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TRANG CHỦ CÁN BỘ</Text>
      <Text style={styles.subtitle}>Chức năng: Quản lý ra vào, Duyệt thăm thân</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f5e9' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 10 }
});