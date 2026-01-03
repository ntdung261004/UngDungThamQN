import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Search, UserCheck, UserMinus, MapPin, ChevronRight, Plus } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import { useRouter } from 'expo-router';

export default function SoldierList({ soldiers = [], officers = [], currentUser }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  // Logic viết tắt Cấp bậc & Chức vụ
  const getRankAbbr = (rank) => {
    const map = { 'Binh nhì': 'BN', 'Binh nhất': 'B1', 'Hạ sĩ': 'H1', 'Trung sĩ': 'H2', 'Thượng sĩ': 'H3' };
    return map[rank] || rank;
  };
  const getPosAbbr = (pos) => {
    const map = { 'Chiến sĩ': 'cs', 'Tiểu đội trưởng': 'at', 'Khẩu đội trưởng': 'kđt' };
    return map[pos] ? map[pos].toLowerCase() : pos.toLowerCase();
  };

  const checkRegistered = (phone) => officers.some(u => u.phone === phone);

  const filteredData = useMemo(() => {
    return soldiers.filter(s => {
      const isReg = checkRegistered(s.phoneRelative);
      const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.unitCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (activeFilter === 'Đơn vị') return s.unitCode === currentUser?.unitCode;
      if (activeFilter === 'Cấp bậc') return ['Hạ sĩ', 'Trung sĩ', 'Thượng sĩ'].includes(s.rank);
      if (activeFilter === 'Chức vụ') return s.position !== 'Chiến sĩ';
      if (activeFilter === 'Có người nhà') return isReg;
      if (activeFilter === 'Chưa có người nhà') return !isReg;
      return true;
    });
  }, [soldiers, searchQuery, activeFilter, officers, currentUser]);

  const renderItem = ({ item }) => {
    const isReg = checkRegistered(item.phoneRelative);
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({ pathname: '/SoldierDetail', params: { id: item._id } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{getRankAbbr(item.rank)}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.name}>{item.fullName.toUpperCase()}</Text>
            <Text style={styles.subInfo}>{getPosAbbr(item.position)} • {item.unitCode}</Text>
          </View>
          <View style={[styles.tag, isReg ? styles.tagGreen : styles.tagOrange]}>
            {isReg ? <UserCheck size={12} color="#27ae60" /> : <UserMinus size={12} color="#f39c12" />}
            <Text style={[styles.tagText, { color: isReg ? '#27ae60' : '#f39c12' }]}>
              {isReg ? 'Đã có TN' : 'Chưa có TN'}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.loc}>
            <MapPin size={14} color="#888" />
            <Text style={styles.locText} numberOfLines={1}>{item.address}</Text>
          </View>
          <ChevronRight size={18} color="#CCC" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#999" />
          <TextInput 
            placeholder="Tìm tên hoặc đơn vị..." 
            style={styles.input} 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['Tất cả', 'Đơn vị', 'Cấp bậc', 'Chức vụ', 'Có người nhà', 'Chưa có người nhà'].map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Tổng số: <Text style={{fontWeight:'bold'}}>{filteredData.length}</Text> chiến sĩ</Text>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.empty}>Không có dữ liệu chiến sĩ</Text>}
      />

      {/* Nút Thêm Mới (FAB) neo ở dưới */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({
          pathname: '/AddSoldier',
          params: { currentUser: JSON.stringify(currentUser) }
        })}
      >
        <Plus size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  searchSection: { padding: 15, backgroundColor: '#FFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F5', paddingHorizontal: 12, borderRadius: 10, height: 45 },
  input: { flex: 1, marginLeft: 8, fontSize: 14 },
  filterSection: { backgroundColor: '#FFF', paddingBottom: 10 },
  filterScroll: { paddingHorizontal: 15 },
  filterTab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F3F5', marginRight: 8, borderWidth: 1, borderColor: '#EEE' },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { color: '#FFF', fontWeight: 'bold' },
  summaryBox: { paddingHorizontal: 15, paddingVertical: 8 },
  summaryText: { fontSize: 13, color: '#555' },
  listContainer: { padding: 15, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  rankBadge: { width: 50, height: 50, borderRadius: 12, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  rankText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 18 },
  infoCol: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subInfo: { fontSize: 13, color: '#888', marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagGreen: { backgroundColor: '#E8F5E9' },
  tagOrange: { backgroundColor: '#FFF3E0' },
  tagText: { fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8F9FA', paddingTop: 12 },
  loc: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  locText: { fontSize: 13, color: '#777', marginLeft: 6 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});