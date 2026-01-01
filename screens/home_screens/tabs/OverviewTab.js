import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Users, UserCheck, ShieldAlert, Bell } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

const OverviewTab = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Dùng user.id (đã map từ _id ở backend login)
      const userId = user?.id || user?._id; 
      const response = await fetch(`http://localhost:5000/api/auth/overview-stats/${userId}`);
      const data = await response.json();
      setStats(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); setRefreshing(false); }
    };

  useEffect(() => { fetchStats(); }, [user]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
    >
      <Text style={styles.sectionTitle}>Số liệu đơn vị: {user?.unitCode || user?.unitPath}</Text>
      <View style={styles.statsGrid}>
        <StatCard title="Tổng chiến sĩ" value={stats?.totalSoldiers} icon={Users} color="#2196F3" />
        <StatCard title="Thân nhân đăng ký" value={stats?.totalRelatives} icon={UserCheck} color="#4CAF50" />
        
        {user?.isAdmin && (
          <>
            <StatCard title="Cán bộ đăng ký" value={stats?.totalOfficers} icon={ShieldAlert} color="#FF9800" />
            <StatCard title="Chờ phê duyệt" value={stats?.pendingApprovals} icon={Bell} color="#F44336" isAlert />
          </>
        )}
        
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value, icon: Icon, color, isAlert }) => (
  <View style={[styles.card, isAlert && value > 0 && styles.alertCard]}>
    <View style={[styles.iconBox, { backgroundColor: color + '20' }]}><Icon size={24} color={color} /></View>
    <Text style={styles.cardValue}>{value || 0}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: '48%', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 2 },
  alertCard: { borderWidth: 1, borderColor: '#FFCDD2' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  cardTitle: { fontSize: 11, color: '#666' }
});

export default OverviewTab;