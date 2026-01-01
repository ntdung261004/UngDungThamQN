import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Users, UserCheck, ShieldAlert,Bell } from 'lucide-react-native';
import { COLORS } from '../../../constants/theme';

const OverviewTab = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/overview-stats/${user.id}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Lỗi fetch stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) return <ActivityIndicator style={{flex:1}} color={COLORS.primary} />;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Số liệu đơn vị ({user.unitCode})</Text>
      
      <View style={styles.statsGrid}>
        <StatCard 
          title="Tổng chiến sĩ" 
          value={stats?.totalSoldiers} 
          icon={Users} 
          color="#2196F3" 
        />
        <StatCard 
          title="Thân nhân đăng ký" 
          value={stats?.totalRelatives} 
          icon={UserCheck} 
          color="#4CAF50" 
        />
        <StatCard 
          title="Cán bộ đăng ký" 
          value={stats?.totalOfficers} 
          icon={ShieldAlert} 
          color="#FF9800" 
        />
        <StatCard 
          title="Cần xử lý mới" 
          value={stats?.pendingApprovals} 
          icon={Bell} 
          color="#F44336" 
          isAlert
        />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Việc cần làm ngay</Text>
        <View style={styles.emptyTask}>
            <Text style={{color: '#999'}}>Chưa có thông báo phê duyệt mới</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Component thẻ số liệu con
const StatCard = ({ title, value, icon: Icon, color, isAlert }) => (
  <View style={[styles.card, isAlert && styles.alertCard]}>
    <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 15, marginTop: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#FFF', width: '48%', padding: 15, borderRadius: 15, 
    marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  alertCard: { borderWidth: 1, borderColor: '#FFCDD2' },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  cardTitle: { fontSize: 12, color: '#666', marginTop: 2 },
  recentSection: { marginTop: 10 },
  emptyTask: { backgroundColor: '#F0F0F0', padding: 30, borderRadius: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CCC' }
});

export default OverviewTab;