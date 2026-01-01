import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import OfficerList from './sub_tabs/OfficerList';

export default function ListTab({ user }) {
  // Nếu là Admin thì mặc định mở 'Officers', nếu không thì mở 'Soldiers'
  const [subTab, setSubTab] = useState(user?.isAdmin ? 'Officers' : 'Soldiers');

  const renderSubContent = () => {
    switch (subTab) {
      case 'Soldiers': 
        return <View style={styles.page}><Text style={styles.emptyText}>Trang: Danh sách Chiến sĩ</Text></View>;
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
      {/* SUB-MENU TABS */}
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

        {/* CHỈ HIỂN THỊ MỤC CÁN BỘ NẾU LÀ ADMIN */}
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
  subTabBar: { 
    flexDirection: 'row', 
    backgroundColor: '#F4F4F4', 
    marginHorizontal: 15, 
    marginVertical: 10, 
    borderRadius: 12, 
    padding: 4 
  },
  subTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeSubTab: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  subTabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  activeSubTabText: { color: COLORS.primary },
  content: { flex: 1 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 }
});