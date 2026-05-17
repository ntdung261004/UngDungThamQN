import { Shield, UserCheck } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomAlert from '../../../../components/CustomAlert';
import { COLORS } from '../../../../constants/theme';

// NHỚ ĐỔI ĐỊA CHỈ IP NÀY THÀNH IP CỦA BẠN
const API_URL = 'http://192.168.1.100:5000'; 

export default function OfficerList({ currentUser }) {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    type: 'success', 
    message: '' 
  });

  const fetchData = async () => {
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) {
        setLoading(false);
        return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/pending-officers/${userId}`);
      const textData = await response.text(); 
      
      let data;
      try {
        data = JSON.parse(textData); // Ép kiểu an toàn
      } catch (err) {
        console.error("Lỗi parse JSON (API chưa khởi động):", textData);
        return;
      }

      if (response.ok) {
        setPending(data.pending || []);
        setApproved(data.approved || []);
      }
    } catch (error) { 
        console.error("Lỗi fetch:", error); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/approve-officer/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
      });
      
      const textData = await response.text();
      let data;
      try {
          data = JSON.parse(textData);
      } catch(err) {
          console.error("Lỗi parse JSON duyệt tài khoản");
          return;
      }

      if (response.ok) {
          setAlertConfig({
            visible: true,
            type: 'success',
            message: "Đã phê duyệt tài khoản cán bộ thành công!"
          });
          fetchData(); // Tải lại danh sách
      } else {
          setAlertConfig({ visible: true, type: 'error', message: data.message });
      }
    } catch (error) { 
        console.error("Lỗi phê duyệt:", error); 
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  if (loading) return <ActivityIndicator style={{marginTop: 50}} color={COLORS.primary} />;

  const renderCard = (item, isPending) => (
    <View style={styles.card} key={item._id}>
      <View style={styles.cardMain}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: isPending ? '#FFF9C4' : '#E8F5E9' }]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
            ) : (
              <Shield size={24} color={isPending ? '#FBC02D' : COLORS.primary} />
            )}
          </View>
          {isPending && <View style={styles.statusDot} />}
        </View>

        <View style={styles.infoContent}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            {item.rank && <Text style={styles.itemRankInline}>{item.rank} </Text>}
            <Text style={styles.nameText}>{item.fullName}</Text>
          </View>
          <Text style={styles.subInfoText}>
            {item.position || 'Cán bộ'} • {item.unitCode || item.unitPath}
          </Text>
        </View>

        {isPending ? (
          <View style={styles.badgePending}>
            <Text style={styles.badgeText}>Chờ duyệt</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnDetail}>
            <Text style={styles.btnDetailText}>Chi tiết</Text>
          </TouchableOpacity>
        )}
      </View>

      {isPending && (
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.btnApprove} 
            onPress={() => handleApprove(item._id)}
          >
            <UserCheck size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.btnApproveText}>PHÊ DUYỆT TÀI KHOẢN</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>YÊU CẦU PHÊ DUYỆT</Text>
        <View style={styles.countBadge}><Text style={styles.countText}>{pending.length}</Text></View>
      </View>
      {pending.length === 0 ? (
        <View style={styles.emptyBox}><Text style={styles.emptyLabel}>Không có yêu cầu mới</Text></View>
      ) : (
        pending.map(item => renderCard(item, true))
      )}
      
      <View style={[styles.sectionHeader, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>DANH SÁCH CÁN BỘ ĐÃ DUYỆT</Text>
        <View style={[styles.countBadge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.countText, { color: COLORS.primary }]}>{approved.length}</Text></View>
      </View>
      {approved.length === 0 ? (
        <View style={styles.emptyBox}><Text style={styles.emptyLabel}>Chưa có cán bộ nào</Text></View>
      ) : (
        approved.map(item => renderCard(item, false))
      )}

      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#888', letterSpacing: 1 },
  countBadge: { marginLeft: 8, backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 10, fontWeight: 'bold', color: '#FF9800' },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 15, 
    marginBottom: 12, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 50, height: 50, borderRadius: 25 },
  statusDot: { 
    position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, 
    borderRadius: 6, backgroundColor: '#FBC02D', borderWidth: 2, borderColor: '#FFF' 
  },
  itemRankInline: { fontSize: 12, color: '#AAA', fontWeight: '600', marginBottom: 1 },
  infoContent: { flex: 1, marginLeft: 15 },
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subInfoText: { fontSize: 13, color: '#777', marginTop: 3 },
  badgePending: { backgroundColor: '#FFF9C4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 11, color: '#FBC02D', fontWeight: 'bold' },
  btnDetail: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F5F5F5' },
  btnDetailText: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold' },
  actionContainer: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  btnApprove: { 
    backgroundColor: COLORS.primary, 
    height: 44, 
    borderRadius: 10, 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2
  },
  btnApproveText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  emptyBox: { paddingVertical: 20, alignItems: 'center' },
  emptyLabel: { color: '#AAA', fontSize: 13, fontStyle: 'italic' }
});