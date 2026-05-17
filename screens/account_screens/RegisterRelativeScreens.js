import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, RotateCcw, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

// NHỚ ĐỔI IP CỦA BẠN VÀO ĐÂY
const API_URL = 'http://192.168.1.100:5000';

const RegisterRelativeScreens = () => {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phone || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập Số điện thoại và Mật khẩu.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register-relative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await response.json();

      if (response.ok) {
        // Lưu token và user vào máy
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        
        // Chuyển sang màn hình Setup Profile và truyền kèm thông tin chiến sĩ
        router.push({
          pathname: '/SetupProfileRelative',
          params: { soldier: JSON.stringify(data.soldier) }
        });
      } else {
        Alert.alert("Lỗi đăng ký", data.message);
      }
    } catch (error) {
      Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={28} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Đăng ký Thân nhân</Text>
          <View style={{ width: 28 }} />
        </View>

        <Text style={styles.subText}>Vui lòng nhập Số điện thoại mà bạn đã cung cấp cho chỉ huy đơn vị để xác thực.</Text>

        <Text style={styles.label}>Số điện thoại</Text>
        <CustomInput 
          icon={Smartphone} 
          placeholder="Nhập số điện thoại" 
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Tạo Mật khẩu</Text>
        <CustomInput 
          icon={Lock} 
          placeholder="........" 
          secureTextEntry={true} 
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <CustomInput 
          icon={RotateCcw} 
          placeholder="Xác nhận mật khẩu" 
          secureTextEntry={true} 
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity 
          style={[styles.registerButton, { backgroundColor: '#FF5252' }, loading && { opacity: 0.7 }]} 
          activeOpacity={0.8}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerButtonText}>Xác thực & Kết nối</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/login')}>
          <Text style={styles.footerText}>Đã có tài khoản? <Text style={[styles.link, {color: '#FF5252'}]}>Đăng nhập</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 25, paddingTop: 50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backButton: { padding: 10, marginLeft: -10 },
  headerTitleText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark },
  subText: { fontSize: 14, color: '#666', marginBottom: 25, lineHeight: 20 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  registerButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 20, marginBottom: 40, alignItems: 'center' },
  footerText: { color: COLORS.textGrey, fontSize: 14 },
  link: { fontWeight: 'bold' }
});

export default RegisterRelativeScreens;