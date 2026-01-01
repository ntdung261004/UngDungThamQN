import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/theme';
import OfficerList from './sub_tabs/OfficerList';

export default function ListTab({ user }) {

  const [subTab, setSubTab] = useState('Officers');
  const renderSubContent = () => {
    switch (subTab) {
      case 'Soldiers': return <View style={styles.page}><Text>Trang: Danh sách Chiến sĩ</Text></View>;
      case 'Relatives': return <View style={styles.page}><Text>Trang: Thân nhân đăng ký</Text></View>;
      case 'Officers': return <OfficerList currentUser={user} />;
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

        <TouchableOpacity 
          style={[styles.subTab, subTab === 'Officers' && styles.activeSubTab]} 
          onPress={() => setSubTab('Officers')}
        >
          <Text style={[styles.subTabText, subTab === 'Officers' && styles.activeSubTabText]}>Cán bộ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderSubContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  subTabBar: { flexDirection: 'row', backgroundColor: '#F4F4F4', margin: 15, borderRadius: 10, padding: 4 },
  subTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeSubTab: { backgroundColor: '#FFF', elevation: 2 },
  subTabText: { fontSize: 13, color: '#666', fontWeight: '600' },
  activeSubTabText: { color: COLORS.primary },
  content: { flex: 1, paddingHorizontal: 20 },
  page: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});