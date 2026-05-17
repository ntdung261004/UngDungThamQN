import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, Filter, Phone, Plus, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../../../../constants/theme';

// NHỚ ĐỔI LẠI THÀNH IP CỦA BẠN NHÉ
const API_URL = 'http://192.168.1.100:5000'; 

export default function SoldierList() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [soldiers, setSoldiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedSoldier, setSelectedSoldier] = useState(null);

  const fetchSoldiers = async (user) => {
    try {
      const userId = user.id || user._id;
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
      const initData = async () => {
        try {
          const userStr = await AsyncStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            fetchSoldiers(user); 
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error("Error reading AsyncStorage:", error);
          setLoading(false);
        }
      };
      initData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (currentUser) {
      fetchSoldiers(currentUser);
    } else {
      setRefreshing(false);
    }
  };

  const openActionModal = (soldier) => {
    setSelectedSoldier(soldier);
    setActionModalVisible(true);
  };

  const handleViewDetails = () => {
    setActionModalVisible(false);
    router.push({
      pathname: '/SoldierDetail',
      params: { soldier: JSON.stringify(selectedSoldier) }
    });
  };

  const handleUpdate = () => {
    setActionModalVisible(false);
    Alert.alert("Tính năng cập nhật", "Bạn cần tạo thêm màn hình Cập nhật chiến sĩ. Chúng ta sẽ làm ở bước tiếp theo!");
  };

  const handleDelete = () => {
    setActionModalVisible(false); 
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa chiến sĩ ${selectedSoldier?.fullName}?\nDữ liệu sẽ không thể khôi phục.`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: confirmDelete }
      ]
    );
  };

  // ĐÃ NÂNG CẤP: Bắt lỗi thông minh để không bị văng App
  const confirmDelete = async () => {
    setLoading(true);
    try {
      const id = selectedSoldier._id || selectedSoldier.id;
      if (!id) {
        Alert.alert("Lỗi", "Không tìm thấy dữ liệu ID của chiến sĩ.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/soldiers/${id}`, {
        method: 'DELETE',
      });
      
      // Chuyển kết quả về dạng text trước để kiểm tra (Tránh lỗi <HTML>)
      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData); // Thử ép kiểu sang JSON
      } catch (err) {
        // Nếu không ép kiểu được (do là trang HTML), báo lỗi nhắc nhở
        Alert.alert("Lỗi máy chủ", "Lệnh xóa không tồn tại. Vui lòng kiểm tra lại xem bạn ĐÃ KHỞI ĐỘNG LẠI Server Backend chưa?");
        setLoading(false);
        return;
      }

      if (response.ok) {
        Alert.alert("Thành công", "Đã xóa chiến sĩ khỏi hệ thống.");
        onRefresh(); 
      } else {
        Alert.alert("Lỗi", data.message || "Không thể xóa chiến sĩ");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      Alert.alert("Lỗi kết nối", "Vui lòng kiểm tra lại mạng của bạn.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSoldiers = soldiers.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.unitCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const hasAvatar = item.avatar && item.avatar.startsWith('data:image');
    const imageSource = hasAvatar ? { uri: item.avatar } : { uri: 'https://via.placeholder.com/150' };
    const isRelativeRegistered = item.isRelativeRegistered || false; 

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => openActionModal(item)}
      >
        <View style={styles.cardHeader}>
          <Image source={imageSource} style={styles.avatar} />
          <View style={styles.mainInfo}>
            <Text style={styles.rankLabel}>{item.rank || 'Binh nhì'}</Text>
            <Text style={styles.nameLabel}>{item.fullName?.toUpperCase()}</Text>
            <Text style={styles.unitLabel}>{item.position} - {item.unitCode}</Text>
          </View>
          <ChevronRight size={18} color="#CCC" />
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusTag, isRelativeRegistered ? styles.tagSuccess : styles.tagWarning]}>
            <Phone size={10} color={isRelativeRegistered ? '#2E7D32' : '#ED6C02'} style={{ marginRight: 4 }} />
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
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm theo tên, đơn vị..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <TouchableOpacity style={[styles.chip, styles.chipActive]}><Text style={styles.chipTextActive}>Tất cả</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Đã đăng ký</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Chưa đăng ký</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip}><Filter size={14} color="#666" /><Text style={styles.chipText}> Lọc</Text></TouchableOpacity>
          </ScrollView>
        </View>

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

      <TouchableOpacity 
        style={styles.fabRound}
        onPress={() => router.push('/AddSoldier')}
      >
        <Plus size={32} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={actionModalVisible} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setActionModalVisible(false)} 
        >
          <View style={styles.actionModalContent}>
            <Text style={styles.actionModalTitle}>{selectedSoldier?.fullName}</Text>

            <TouchableOpacity style={styles.actionBtn} onPress={handleViewDetails}>
              <Text style={styles.actionText}>Xem chi tiết</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleUpdate}>
              <Text style={styles.actionText}>Cập nhật thông tin</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={handleDelete}>
              <Text style={[styles.actionText, { color: '#F44336' }]}>Xóa chiến sĩ</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  
  listContent: { padding: 12, paddingBottom: 100 },
  
// Đã tinh chỉnh thu nhỏ Card
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 8, // Giảm padding từ 16 xuống 12
    marginBottom: 8, // Giảm khoảng cách giữa các item từ 16 xuống 10
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { 
    width: 45, // Thu nhỏ ảnh từ 64 xuống 50
    height: 45, 
    borderRadius: 10, 
    backgroundColor: '#F0F2F5' 
  },
  mainInfo: { flex: 1, marginLeft: 10 }, // Giảm khoảng cách lề từ 16 xuống 12
  rankLabel: { fontSize: 10, color: COLORS.primary, fontWeight: '700', marginBottom: 1 }, // Thu nhỏ font từ 12 xuống 11
  nameLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 1 }, // Thu nhỏ font từ 16 xuống 15, margin 4 xuống 2
  unitLabel: { fontSize: 11, color: '#666' }, // Thu nhỏ font từ 13 xuống 12
  
  cardFooter: { 
    marginTop: 5, // Giảm margin từ 12 xuống 8
    paddingTop: 5, // Giảm padding từ 12 xuống 8
    borderTopWidth: 1, 
    borderTopColor: '#F0F2F5' 
  },
  statusTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  tagSuccess: { backgroundColor: '#E8F5E9' },
  tagWarning: { backgroundColor: '#FFF3E0' },
  tagText: { fontSize: 10, fontWeight: '500' }, // Thu nhỏ font tag từ 12 xuống 11
  
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#999', fontSize: 15 },
  fabRound: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    backgroundColor: COLORS.primary, 
    width: 50, // Thu nhỏ nút plus một chút cho cân đối
    height: 50, 
    borderRadius: 28, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65
  },

  // --- STYLE MỚI CHO MODAL TÙY CHỌN (ĐÃ LÀM GẦN LẠI) ---
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  actionModalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    paddingBottom: 30 // Ép gọn đáy lại một chút
  },
  actionModalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    textAlign: 'center', 
    marginBottom: 10, // Thu hẹp khoảng cách chữ và đường kẻ
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE', 
    paddingBottom: 12 
  },
  actionBtn: { 
    paddingVertical: 12, // (Quan trọng) Giảm từ 18 xuống 12 để các nút sát lại nhau
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE', 
    alignItems: 'center' 
  },
  actionText: { 
    fontSize: 16, 
    color: COLORS.primary, 
    fontWeight: '600' 
  },
});