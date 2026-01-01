import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { UserCheck, UserX, MoreVertical, Shield } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';

export default function OfficerList({ currentUser }) {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/pending-officers/${currentUser.id}`);
      const data = await response.json();
      setPending(data.pending);
      setApproved(data.approved);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    const response = await fetch(`http://localhost:5000/api/auth/approve-officer/${id}`, { method: 'PUT' });
    if (response.ok) fetchData();
  };

  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa/từ chối tài khoản này?", [
      { text: "Hủy" },
      { text: "Xóa", onPress: async () => {
          await fetch(`http://localhost:5000/api/auth/delete-officer/${id}`, { method: 'DELETE' });
          fetchData();
      }, style: 'destructive' }
    ]);
  };

  const renderOfficerCard = ({ item, isPending }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
          <Shield size={24} color={COLORS.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.subText}>SĐT: {item.phone}</Text>
          <Text style={styles.unitTag}>Đơn vị: {item.unitCode} ({item.unitPath})</Text>
        </View>
        {isPending ? (
          <View style={styles.statusWait}><Text style={styles.statusWaitText}>Chờ duyệt</Text></View>
        ) : (
          <TouchableOpacity><MoreVertical size={20} color="#999" /></TouchableOpacity>
        )}
      </View>

      {isPending && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnReject} onPress={() => handleDelete(item._id)}>
            <Text style={styles.btnRejectText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnApprove} onPress={() => handleApprove(item._id)}>
            <Text style={styles.btnApproveText}>Phê duyệt</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={[
        { title: 'YÊU CẦU PHÊ DUYỆT', data: pending, isPending: true },
        { title: 'DANH SÁCH CÁN BỘ', data: approved, isPending: false }
      ]}
      keyExtractor={(item) => item.title}
      renderItem={({ item }) => (
        <View>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          {item.data.length === 0 ? (
            <Text style={styles.emptyText}>Không có dữ liệu</Text>
          ) : (
            item.data.map(officer => renderOfficerCard({ item: officer, isPending: item.isPending }))
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#666', marginVertical: 15, letterSpacing: 1 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  subText: { fontSize: 13, color: '#666', marginTop: 2 },
  unitTag: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  statusWait: { backgroundColor: '#FFF9C4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  statusWaitText: { color: '#FBC02D', fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15 },
  btnReject: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, marginRight: 10 },
  btnRejectText: { color: '#666', fontWeight: '600' },
  btnApprove: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 8 },
  btnApproveText: { color: '#FFF', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', fontStyle: 'italic', marginBottom: 20 }
});