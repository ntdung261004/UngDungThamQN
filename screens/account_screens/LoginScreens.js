import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, HelpCircle, Lock, ShieldAlert, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Import AsyncStorage để lưu trạng thái đăng nhập
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import các thành phần tùy chỉnh
import CustomAlert from '../../components/CustomAlert';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

const LoginScreens = () => {
  const router = useRouter();
  // Lấy role từ màn hình trước truyền sang (VD: 'relative' hoặc 'canbo')
  const { role } = useLocalSearchParams(); 

  // State quản lý dữ liệu nhập vào
  const [rootCode, setRootCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    type: 'success', 
    message: '', 
    autoClose: false 
  });

  const handleLogin = async () => {
    // Kiểm tra tính hợp lệ của dữ liệu form tùy chọn theo vai trò đăng nhập
    if (role === 'relative') {
      // Vai trò Thân nhân: Chỉ yêu cầu SĐT và Mật khẩu
      if (!phone || !password) {
        setAlertConfig({ 
          visible: true, 
          type: 'error', 
          message: "Vui lòng nhập SĐT và mật khẩu", 
          autoClose: false 
        });
        return;
      }
    } else {
      // Vai trò Cán bộ: Yêu cầu cả 3 trường thông tin
      if (!rootCode || !phone || !password) {
        setAlertConfig({ 
          visible: true, 
          type: 'error', 
          message: "Vui lòng nhập đầy đủ Key đơn vị, SĐT và mật khẩu", 
          autoClose: false 
        });
        return;
      }
    }

    try {
      // LƯU Ý: Thay đổi IP này thành IP cứng của máy tính chạy Server của bạn
      const response = await fetch(`http://192.168.1.100:5000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }) 
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu trữ Token xác thực và thông tin hồ sơ User vào bộ nhớ máy
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        setAlertConfig({ 
          visible: true, 
          type: 'success', 
          message: "Đăng nhập thành công!", 
          autoClose: true 
        });

        // Chuyển hướng tài khoản vào màn hình chính sau khi thông báo thành công hiển thị
        setTimeout(() => {
          router.push('/home');
        }, 1500);

      } else {
        setAlertConfig({ 
          visible: true, 
          type: 'error', 
          message: data.message, 
          autoClose: false 
        });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        message: "Không thể kết nối đến máy chủ", 
        autoClose: false 
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={30} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>
          {role === 'relative' ? "Dành cho Thân nhân chiến sĩ" : "Dành cho Cán bộ đơn vị"}
        </Text>

        <View style={styles.form}>
          
          {/* Chỉ hiển thị ô nhập Mã định danh nếu vai trò KHÔNG PHẢI là Thân nhân */}
          {role !== 'relative' && (
            <View>
              <Text style={styles.label}>Mã định danh đơn vị (*)</Text>
              <CustomInput 
                icon={ShieldAlert} 
                placeholder="VD: d6e5f5qk7" 
                value={rootCode}
                onChangeText={setRootCode}
              />
            </View>
          )}

          <Text style={styles.label}>Số điện thoại</Text>
          <CustomInput 
            icon={Smartphone} 
            placeholder="Nhập số điện thoại" 
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <CustomInput 
            icon={Lock} 
            placeholder="Nhập mật khẩu" 
            secureTextEntry={true} 
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.forgotPassContainer} onPress={() => router.push('/forgot_password')}>
            <HelpCircle size={16} color={COLORS.primary} style={{ marginRight: 5 }}/>
            <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} activeOpacity={0.8} onPress={handleLogin}>
            <Text style={styles.loginText}>ĐĂNG NHẬP</Text>
          </TouchableOpacity>
          
          {/* ĐÃ HOÀN TÁC: Khôi phục liên kết chuyển hướng đăng ký theo phân hệ vai trò thông minh */}
          <TouchableOpacity 
            style={styles.footerLink} 
            onPress={() => router.push(role === 'relative' ? '/register_relative' : '/register_canbo')}
          >
            <Text style={styles.footerText}>
              Chưa có tài khoản?{' '}
              <Text style={[styles.link, { color: role === 'relative' ? '#FF5252' : COLORS.primary }]}>
                Đăng ký ngay
              </Text>
            </Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        message={alertConfig.message}
        autoClose={alertConfig.autoClose}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 60 },
  backButton: { marginBottom: 20, marginLeft: -10 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark },
  subtitle: { fontSize: 15, color: COLORS.textGrey, marginBottom: 30 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 5, marginTop: 15 },
  forgotPassContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 10 },
  forgotPassText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  loginButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  loginText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  
  // Style định dạng dòng chữ footer liên kết đăng ký tài khoản mới tinh chỉnh gọn gàng
  footerLink: { marginTop: 25, alignItems: 'center', marginBottom: 20 },
  footerText: { color: COLORS.textGrey, fontSize: 14 },
  link: { fontWeight: 'bold' }
});

export default LoginScreens;