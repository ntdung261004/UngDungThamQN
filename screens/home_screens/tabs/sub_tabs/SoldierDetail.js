import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../../../constants/theme';

export default function SoldierDetail({ route }) {
  const soldier = route?.params?.soldier;
  if (!soldier) return <View style={{ padding: 20 }}><Text>Không tìm thấy chiến sĩ</Text></View>;

  return (
    <View style={styles.container}>
      {soldier.avatar ? <Image source={{ uri: soldier.avatar }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: '#fff' }}>{soldier.fullName?.charAt(0)}</Text></View>}
      <Text style={styles.name}>{soldier.fullName}</Text>
      <Text style={styles.info}>{soldier.rank} • {soldier.position}</Text>
      <Text style={styles.info}>Đơn vị: {soldier.unitCode}</Text>
      <Text style={styles.info}>Mã: {soldier.soldierId}</Text>
      <Text style={styles.info}>SĐT người nhà: {soldier.phoneRelative}</Text>
      <Text style={styles.info}>Nơi ở: {soldier.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  avatar: { width: 120, height: 120, borderRadius: 12, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  info: { color: '#666', marginBottom: 6 }
});
