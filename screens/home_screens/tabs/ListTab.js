import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../constants/theme';
import OfficerList from './sub_tabs/OfficerList';
import SoldierList from './sub_tabs/SoldierList';

export default function ListTab({ user, navigation }) {
  const [subTab, setSubTab] = useState(user?.isAdmin ? 'Officers' : 'Soldiers');
  const [soldiers, setSoldiers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Thay đổi IP này thành IP máy tính chạy server của bạn (VD: 192.168.x.x)
      const baseUrl = 'http://192.168.1.100:5000/api/auth';
      
      const [resS, resU] = await Promise.all([
        fetch(`${baseUrl}/soldiers`),
        fetch(`${baseUrl}/users`)
      ]);

      if (resS.ok && resS.headers.get('content-type')?.includes('application/json')) {
        setSoldiers(await resS.json());
      }
      if (resU.ok && resU.headers.get('content-type')?.includes('application/json')) {
        setAllUsers(await resU.json());
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderSubContent = () => {
    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />;

    switch (subTab) {
      case 'Soldiers': 
        return <SoldierList soldiers={soldiers} officers={allUsers} currentUser={user} />;
      case 'Relatives': 
        return <View style={styles.page}><Text style={styles.emptyText}>Trang: Thân nhân đăng ký</Text></View>;
      case 'Officers': 
        return <OfficerList currentUser={user} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.subTabBar}>
        <TouchableOpacity 
          style={[styles.subTab, subTab === 'Soldiers' && styles.activeSubTab]} 
          onPress={() => setSubTab('Soldiers')}
        >
          <Text style={[styles.subTabText, subTab === 'Soldiers' && styles.activeSubTabText]}>Chiến sĩ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.subTab, subTab === 'Relatives' && styles.activeSubTab]} 
          onPress={() => setSubTab('Relatives')}
        >
          <Text style={[styles.subTabText, subTab === 'Relatives' && styles.activeSubTabText]}>Thân nhân</Text>
        </TouchableOpacity>

        {user?.isAdmin && (
          <TouchableOpacity 
            style={[styles.subTab, subTab === 'Officers' && styles.activeSubTab]} 
            onPress={() => setSubTab('Officers')}
          >
            <Text style={[styles.subTabText, subTab === 'Officers' && styles.activeSubTabText]}>Cán bộ</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {renderSubContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  subTabBar: { flexDirection: 'row', backgroundColor: '#F4F4F4', marginHorizontal: 15, marginVertical: 10, borderRadius: 12, padding: 4 },
  subTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeSubTab: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  subTabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  activeSubTabText: { color: COLORS.primary },
  content: { flex: 1 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 }
});