import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Users, ShieldCheck, ChevronRight, Info } from 'lucide-react-native';
import { COLORS } from '../theme/color';

import { useRouter } from 'expo-router';

const WelcomeScreens = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header Logo */}
      <View style={styles.header}>
        <ShieldCheck size={24} color={COLORS.primary} />
        <Text style={styles.headerText}>Việt Nam QĐ</Text>
      </View>

      {/* Content chính */}
      <View style={styles.content}>
        
        {/* Chèn Icon thay cho khoảng trống */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/app_icon.png')} 
            style={styles.mainIcon}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.mainTitle}>Cổng thông tin Thăm gặp</Text>
        <Text style={styles.subTitle}>
          Kết nối tình thân, chia sẻ yêu thương trong môi trường quân ngũ.
        </Text>

        <Text style={styles.choiceLabel}>CHỌN VAI TRÒ ĐỂ TIẾP TỤC</Text>

        {/* Nút chọn Người thân */}
        <TouchableOpacity style={styles.roleCard} activeOpacity={0.7} onPress={() => router.push('/login')} >
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
            <Users size={24} color={COLORS.primary} />
          </View>
          <View style={styles.roleTextGroup}>
            <Text style={styles.roleTitle}>Người thân</Text>
            <Text style={styles.roleDesc}>Đăng ký thăm nuôi, gửi quà</Text>
          </View>
          <ChevronRight size={20} color="#CCC" />
        </TouchableOpacity>

        {/* Nút chọn Cán bộ */}
        <TouchableOpacity style={styles.roleCard} activeOpacity={0.7} onPress={() => router.push('/login')} >
          <View style={[styles.iconBox, { backgroundColor: '#F0F2F5' }]}>
            <ShieldCheck size={24} color="#546E7A" />
          </View>
          <View style={styles.roleTextGroup}>
            <Text style={styles.roleTitle}>Cán bộ</Text>
            <Text style={styles.roleDesc}>Quản lý lịch trình, phê duyệt</Text>
          </View>
          <ChevronRight size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.lineDivider}>
          <View style={styles.line} />
          <Text style={styles.supportText}>Hỗ trợ kỹ thuật</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Info size={18} color={COLORS.primary} />
          <Text style={styles.helpText}>Hướng dẫn sử dụng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 50, gap: 8 },
  headerText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Style cho Container chứa ảnh
  imageContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  // Style cho Icon mới chèn vào
  mainIcon: {
    width: 120, // Bạn có thể điều chỉnh độ to nhỏ ở đây
    height: 120,
  },

  mainTitle: { fontSize: 26, fontWeight: '800', color: '#101828', textAlign: 'center', marginBottom: 10 },
  subTitle: { fontSize: 15, color: '#667085', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22, marginBottom: 40 },
  choiceLabel: { fontSize: 12, fontWeight: '700', color: '#98A2B3', letterSpacing: 1, marginBottom: 20 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  roleTextGroup: { flex: 1 },
  roleTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  roleDesc: { fontSize: 13, color: COLORS.textGrey, marginTop: 2 },
  footer: { marginBottom: 40, alignItems: 'center' },
  lineDivider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#EAECF0' },
  supportText: { marginHorizontal: 10, fontSize: 12, color: '#98A2B3' },
  helpButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' }
});

export default WelcomeScreens;