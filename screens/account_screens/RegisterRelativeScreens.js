import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, Smartphone, User, Hash } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';
import axios from 'axios';
import { API_CONFIG } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterRelativeScreens = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [rootCode, setRootCode] = useState(''); 
  const [fullName, setFullName] = useState(''); // Tên chiến sĩ
  const [phone, setPhone] = useState('');       // SĐT người thân
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!rootCode || !fullName || !phone || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      // Gọi API đăng ký và kiểm tra dữ liệu trực tiếp
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/register-relative`, {
        fullName,
        phone,
        password,
        rootCode
      });

      if (response.status === 200) {
        Alert.alert("Thành công", "Xác thực dữ liệu chính xác. Đang đăng nhập...");
        
        // Lưu thông tin user và chuyển thẳng vào Home
        const userData = response.data.user;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        router.replace('/home');
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi kết nối máy chủ";
      Alert.alert("Đăng ký thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={28} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Đăng ký Thân nhân</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={styles.label}>Mã định danh đơn vị (Ví dụ: d6)</Text>
        <CustomInput icon={Hash} placeholder="Nhập mã đơn vị quản lý" value={rootCode} onChangeText={setRootCode} />

        <Text style={styles.label}>Họ và tên Chiến sĩ (Con/Em)</Text>
        <CustomInput icon={User} placeholder="Nhập đúng họ tên chiến sĩ" value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Số điện thoại của bạn (Người thân)</Text>
        <CustomInput icon={Smartphone} placeholder="SĐT để đối chiếu dữ liệu" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        <Text style={styles.label}>Mật khẩu</Text>
        <CustomInput icon={Lock} placeholder="Nhập mật khẩu" secureTextEntry value={password} onChangeText={setPassword} />

        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <CustomInput icon={Lock} placeholder="Nhập lại mật khẩu" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        <TouchableOpacity 
          style={[styles.registerButton, { backgroundColor: '#FF5252' }]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerButtonText}>Đăng ký & Đăng nhập</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 25, paddingTop: 50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { padding: 10, marginLeft: -10 },
  headerTitleText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8, marginTop: 10 },
  registerButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});

export default RegisterRelativeScreens;