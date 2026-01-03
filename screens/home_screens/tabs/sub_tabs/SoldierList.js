import React, { useState, useCallback } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  SafeAreaView, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { Search, Filter, Plus, ChevronRight, Phone } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';

// Đảm bảo IP này đúng với IP máy tính chạy server của bạn
const API_URL = 'http://192.168.1.100:5000'; 

export default function SoldierList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentUser = params.currentUser ? JSON.parse(params.currentUser) : null;

  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSoldiers = async () => {
    if (!currentUser) return;
    try {
      const userId = currentUser.id || currentUser._id;
      const response = await fetch(`${API_URL}/api/auth/soldiers/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSoldiers(data.soldiers || []);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSoldiers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSoldiers();
  };

  const filteredSoldiers = soldiers.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.unitCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    // Xử lý ảnh an toàn: Nếu không có hoặc lỗi chuỗi base64 thì dùng ảnh mặc định
    const hasAvatar = item.avatar && item.avatar.startsWith('data:image');
    const imageSource = hasAvatar ? { uri: item.avatar } : { uri: 'https://via.placeholder.com/150' };

    // Giả định logic kiểm tra người thân đã có tài khoản (so khớp SĐT)
    const isRelativeRegistered = item.isRelativeRegistered || false; 

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/SoldierDetail',
          params: { soldier: JSON.stringify(item) }
        })}
      >
        <View style={styles.cardHeader}>
          <Image source={imageSource} style={styles.avatar} />
          <View style={styles.mainInfo}>
            <Text style={styles.rankLabel}>{item.rank || 'Binh nhì'}</Text>
            <Text style={styles.nameLabel}>{item.fullName?.toUpperCase()}</Text>
            <Text style={styles.unitLabel}>{item.position} - {item.unitCode}</Text>
          </View>
          <ChevronRight size={20} color="#CCC" />
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusTag, isRelativeRegistered ? styles.tagSuccess : styles.tagWarning]}>
            <Phone size={12} color={isRelativeRegistered ? '#2E7D32' : '#ED6C02'} style={{ marginRight: 4 }} />
            <Text style={[styles.tagText, isRelativeRegistered ? { color: '#2E7D32' } : { color: '#ED6C02' }]}>
              {isRelativeRegistered ? "Thân nhân đã đăng ký" : "Thân nhân chưa đăng ký"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterSection}>
        {/* Ô tìm kiếm */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm theo tên, đơn vị..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Bộ lọc chip */}
        <View style={styles.filterOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}><Text style={styles.chipTextActive}>Tất cả</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Đã đăng ký</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Chưa đăng ký</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Filter size={14} color="#666" /><Text style={styles.chipText}> Lọc</Text></TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tổng số chiến sĩ */}
        <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Tổng số: <Text style={styles.countText}>{filteredSoldiers.length}</Text> chiến sĩ</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSoldiers}
          renderItem={renderItem}
          keyExtractor={item => (item._id || item.id).toString()}
          contentContainerStyle={styles.listContent}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có dữ liệu chiến sĩ</Text>
            </View>
          }
        />
      )}

      {/* Nút thêm tròn nhỏ neo góc phải */}
      <TouchableOpacity 
        style={styles.fabRound}
        onPress={() => router.push({
          pathname: '/AddSoldier',
          params: { currentUser: JSON.stringify(currentUser) }
        })}
      >
        <Plus size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  filterSection: { backgroundColor: '#FFF', paddingBottom: 12, paddingTop: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, borderRadius: 12, height: 48, borderWidth: 1, borderColor: '#EEE' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  filterOptions: { flexDirection: 'row', marginBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F2F5', marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { fontSize: 13, color: '#FFF', fontWeight: '600' },
  summaryRow: { paddingHorizontal: 16, marginTop: 5 },
  summaryText: { fontSize: 14, color: '#666' },
  countText: { fontWeight: 'bold', color: COLORS.primary },
  listContent: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#F0F2F5' },
  mainInfo: { flex: 1, marginLeft: 16 },
  rankLabel: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  nameLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  unitLabel: { fontSize: 13, color: '#666' },
  cardFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F2F5' },
  statusTag: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagSuccess: { backgroundColor: '#E8F5E9' },
  tagWarning: { backgroundColor: '#FFF3E0' },
  tagText: { fontSize: 12, fontWeight: '600' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#999', fontSize: 15 },
  fabRound: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    backgroundColor: COLORS.primary, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65
  },
});