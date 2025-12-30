import { useRouter } from 'expo-router';
import { ChevronRight, Info, ShieldCheck, Users } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const WelcomeScreens = () => {
  const router = useRouter();

  // Hàm xử lý chọn vai trò và chuyển sang Login kèm tham số
  const handleRoleSelect = (role) => {
    router.push({
      pathname: '/login',
      params: { role: role }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ShieldCheck size={24} color={COLORS.primary} />
        <Text style={styles.headerText}>Việt Nam QĐ</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/app_icon.png')} 
            style={styles.mainIcon}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.mainTitle}>Cổng thông tin Thăm gặp</Text>
        <Text style={styles.subTitle}>
          Kết nối tình thân, chia sẻ yêu thương trong môi trường quân ngũ.
        </Text>

        <Text style={styles.choiceLabel}>CHỌN VAI TRÒ ĐỂ TIẾP TỤC</Text>

        {/* Chọn Người thân */}
        <TouchableOpacity 
          style={styles.roleCard} 
          onPress={() => handleRoleSelect('relative')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
            <Users size={24} color={COLORS.primary} />
          </View>
          <View style={styles.roleTextGroup}>
            <Text style={styles.roleTitle}>Người thân</Text>
            <Text style={styles.roleDesc}>Đăng ký thăm nuôi, gửi quà</Text>
          </View>
          <ChevronRight size={20} color="#CCC" />
        </TouchableOpacity>

        {/* Chọn Cán bộ */}
        <TouchableOpacity 
          style={styles.roleCard} 
          onPress={() => handleRoleSelect('canbo')}
        >
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

      <View style={styles.footer}>
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
  imageContainer: { height: 180, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mainIcon: { width: 120, height: 120 },
  mainTitle: { fontSize: 26, fontWeight: '800', color: '#101828', textAlign: 'center', marginBottom: 10 },
  subTitle: { fontSize: 15, color: '#667085', textAlign: 'center', paddingHorizontal: 20, marginBottom: 40 },
  choiceLabel: { fontSize: 12, fontWeight: '700', color: '#98A2B3', marginBottom: 20 },
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, width: '100%', marginBottom: 16, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  roleTextGroup: { flex: 1 },
  roleTitle: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  roleDesc: { fontSize: 13, color: COLORS.textGrey },
  footer: { marginBottom: 40, alignItems: 'center' },
  helpButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' }
});

export default WelcomeScreens;