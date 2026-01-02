import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { PlusCircle } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import CustomAlert from '../../../../components/CustomAlert';
import { useNavigation } from '@react-navigation/native';

export default function SoldierList({ currentUser, navigation }) {
  const nav = navigation || useNavigation();
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ visible: false, type: 'success', message: '' });

  const fetchData = async () => {
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;
    try {
      const res = await fetch(`http://192.168.1.100:5000/api/auth/soldiers/${userId}`);
      const data = await res.json();
      setSoldiers(data.soldiers || []);
    } catch (err) { console.error('Lỗi fetch soldiers', err); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, [currentUser]);

  const renderItem = (item) => (
    <View style={styles.card} key={item._id}>
      <View style={styles.cardMain}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            {item.avatar ? <Image source={{ uri: item.avatar }} style={styles.avatarImg} /> : <Text style={{color: '#fff'}}>{item.fullName ? item.fullName.charAt(0) : 'C'}</Text>}
          </View>
        </View>

        <View style={styles.infoContent}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            {item.rank && <Text style={styles.itemRankInline}>{item.rank} </Text>}
            <Text style={styles.nameText}>{item.fullName}</Text>
          </View>
          <Text style={styles.subInfoText}>{item.position || 'Chiến sĩ'} • {item.unitCode}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <View style={styles.tag}><Text style={styles.tagText}>{item.soldierId || 'ID: ---'}</Text></View>
            {item.phoneRelative ? <View style={[styles.tag, { marginLeft: 8 }]}><Text style={styles.tagText}>{item.phoneRelative}</Text></View> : null}
          </View>
        </View>

        <TouchableOpacity style={styles.btnDetail} onPress={() => nav?.navigate('SoldierDetail', { soldier: item })}>
          <Text style={styles.btnDetailText}>Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{marginTop: 30}} color={COLORS.primary} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {soldiers.length === 0 ? (
          <View style={styles.emptyBox}><Text style={styles.emptyLabel}>Chưa có chiến sĩ nào</Text></View>
        ) : (
          soldiers.map(s => renderItem(s))
        )}
      </ScrollView>

      {/* Floating add button */}
      <TouchableOpacity style={styles.fab} onPress={() => nav?.navigate('AddSoldier', { currentUser })}>
        <PlusCircle color="#fff" size={28} />
      </TouchableOpacity>

      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  infoContent: { flex: 1, marginLeft: 12 },
  itemRankInline: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 1 },
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subInfoText: { fontSize: 13, color: '#777', marginTop: 3 },
  tag: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, color: '#666' },
  btnDetail: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F5F5F5' },
  btnDetailText: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold' },
  emptyBox: { paddingVertical: 30, alignItems: 'center' },
  emptyLabel: { color: '#AAA', fontSize: 13 },
  fab: { position: 'absolute', right: 18, bottom: 24, backgroundColor: COLORS.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});
