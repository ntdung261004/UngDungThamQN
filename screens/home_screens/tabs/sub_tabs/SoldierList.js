import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { PlusCircle, User } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import CustomAlert from '../../../../components/CustomAlert';
import { useRouter } from 'expo-router';

export default function SoldierList({ currentUser }) {
  const router = useRouter();
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'success', message: '' });

  const fetchData = async () => {
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/auth/soldiers/${userId}`);
      if (!res.ok) throw new Error("Lỗi kết nối");
      const data = await res.json();
      setSoldiers(data.soldiers || []);
    } catch (err) { 
      console.error('Lỗi fetch soldiers:', err); 
    } finally { 
      setLoading(false); 
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  const getPositionAbbr = (pos) => {
    if (pos === "Tiểu đội trưởng") return "AT";
    if (pos === "Khẩu đội trưởng") return "KĐT";
    return "CS";
  };

  const renderItem = (item) => (
    <View style={styles.card} key={item._id}>
      <View style={styles.cardMain}>
        <View style={styles.avatarCircle}>
          {item.avatar ? <Image source={{ uri: item.avatar }} style={styles.avatarImg} /> : <User size={24} color="#FFF" />}
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.rankTextSmall}>{item.rank || 'Chiến sĩ'}</Text>
          <Text style={styles.nameText} numberOfLines={1}>{item.fullName}</Text>
          <Text style={styles.subInfoText}>
            {getPositionAbbr(item.position)} • {item.unitCode}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.btnDetail} 
          onPress={() => router.push({
            pathname: '/SoldierDetail',
            params: { soldier: JSON.stringify(item) }
          })}
        >
          <Text style={styles.btnDetailText}>Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) return <ActivityIndicator style={{marginTop: 30}} color={COLORS.primary} />;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} />}
      >
        {soldiers.length === 0 ? (
          <View style={styles.emptyBox}><Text style={styles.emptyLabel}>Chưa có chiến sĩ nào</Text></View>
        ) : (
          soldiers.map(s => renderItem(s))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push({
          pathname: '/AddSoldier',
          params: { currentUser: JSON.stringify(currentUser) }
        })}
      >
        <PlusCircle color="#fff" size={28} />
      </TouchableOpacity>

      <CustomAlert visible={alertConfig.visible} type={alertConfig.type} message={alertConfig.message} onClose={() => setAlertConfig({ ...alertConfig, visible: false })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 10, elevation: 2 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary },
  avatarImg: { width: 45, height: 45, borderRadius: 22.5 },
  infoContent: { flex: 1, marginLeft: 12 },
  rankTextSmall: { fontSize: 11, color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  nameText: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: -2 },
  subInfoText: { fontSize: 12, color: '#777' },
  btnDetail: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#F0F7F0' },
  btnDetailText: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  emptyBox: { paddingVertical: 50, alignItems: 'center' },
  emptyLabel: { color: '#AAA', fontSize: 13 }
});