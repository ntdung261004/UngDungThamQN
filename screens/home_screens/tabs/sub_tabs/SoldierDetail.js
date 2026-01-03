import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, MapPin, Calendar, Phone, Shield, Bookmark, UserCheck, UserMinus } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { baseUrl } from '../../../../constants/config';

export default function SoldierDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Nhận dữ liệu chiến sĩ từ SoldierList
  const soldier = params.soldier ? JSON.parse(params.soldier) : null;
  const currentUser = params.currentUser ? JSON.parse(params.currentUser) : null;
  
  const [hasRegisteredRelative, setHasRegisteredRelative] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function checkRel() {
      if (!soldier || !currentUser || !soldier.phoneRelative) {
        if (mounted) setHasRegisteredRelative(false);
        return;
      }
      try {
        const uid = currentUser.id || currentUser._id;
        const res = await fetch(`${baseUrl}/relative-exists/${uid}/${encodeURIComponent(soldier.phoneRelative)}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setHasRegisteredRelative(!!data.exists);
        } else {
          if (mounted) setHasRegisteredRelative(false);
        }
      } catch (e) {
        if (mounted) setHasRegisteredRelative(false);
      }
    }
    checkRel();
    return () => { mounted = false; };
  }, [soldier, currentUser]);

  if (!soldier) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy thông tin chiến sĩ</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={{color: COLORS.primary}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết chiến sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {soldier.avatar ? (
              <Image source={{ uri: soldier.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>{soldier.fullName?.charAt(0)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{soldier.fullName}</Text>
          <Text style={styles.rankPos}>{soldier.rank} • {soldier.position}</Text>
          <View style={styles.headerTagRow}>
            <View style={[styles.detailTag, hasRegisteredRelative ? styles.tagGreen : styles.tagOrange]}>
              {hasRegisteredRelative === null ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : hasRegisteredRelative ? (
                <UserCheck size={14} color={'#27ae60'} />
              ) : (
                <UserMinus size={14} color={'#f39c12'} />
              )}
              <Text style={[styles.detailTagText, { color: hasRegisteredRelative ? '#27ae60' : '#f39c12' }]}>{hasRegisteredRelative ? 'Đã có người thân' : 'Chưa có người thân'}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { marginRight: 8 }]} onPress={() => { /* placeholder */ }}>
                <Text style={styles.actionBtnText}>Sửa thông tin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FDECEF' }]} onPress={() => { /* placeholder */ }}>
                <Text style={[styles.actionBtnText, { color: '#E53935' }]}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <InfoItem icon={Shield} label="Đơn vị" value={soldier.unitCode} />
          <InfoItem icon={Phone} label="SĐT người nhà" value={soldier.phoneRelative} />
          <InfoItem icon={Calendar} label="Ngày sinh" value={soldier.dob ? new Date(soldier.dob).toLocaleDateString('vi-VN') : '---'} />
          <InfoItem icon={Calendar} label="Ngày nhập ngũ" value={soldier.enlistDate ? new Date(soldier.enlistDate).toLocaleDateString('vi-VN') : '---'} />
          <InfoItem icon={MapPin} label="Quê quán" value={soldier.address} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.iconBox}>
      <Icon size={20} color={COLORS.primary} />
    </View>
    <View style={styles.infoRight}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  container: { flex: 1 },
  profileCard: { backgroundColor: '#FFF', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  headerTagRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 },
  detailTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  detailTagText: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  actionRow: { flexDirection: 'row' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EEE' },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  avatarWrapper: { marginBottom: 15, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#FFF' },
  avatarPlaceholder: { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  rankPos: { fontSize: 14, color: '#777', marginTop: 5 },
  infoSection: { padding: 20, marginTop: 10 },
  infoItem: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0F7F0', justifyContent: 'center', alignItems: 'center' },
  infoRight: { marginLeft: 15 },
  infoLabel: { fontSize: 12, color: '#999' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 2 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});