import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function OverviewTab({ currentUser }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const userId = currentUser?.id || currentUser?._id;
      if (!userId) return setLoading(false);
      try {
        const response = await fetch(`http://192.168.1.100:5000/api/auth/overview-stats/${userId}`);
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Lỗi fetch overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [currentUser]);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tổng quan</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Tổng chiến sĩ</Text>
        <Text style={styles.value}>{stats?.totalSoldiers ?? '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tổng cán bộ</Text>
        <Text style={styles.value}>{stats?.totalOfficers ?? '-'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Thân nhân</Text>
        <Text style={styles.value}>{stats?.totalRelatives ?? '-'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  label: { color: '#666' },
  value: { color: COLORS.primary, fontWeight: '700' }
});