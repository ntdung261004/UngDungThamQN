import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, HelpCircle, Lock, ShieldAlert, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CustomAlert from '../../components/CustomAlert';
import CustomInput from '../../components/CustomInput';
import { COLORS } from '../../constants/theme';

const LoginScreens = () => {
  const router = useRouter();
  // Lấy role từ màn hình trước truyền sang (VD: 'relative' hoặc 'canbo')
  const { role } = useLocalSearchParams(); 

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
    // 1. KIỂM TRA LỖI TÙY THEO VAI TRÒ
    if (role === 'relative') {
      // Nếu là Thân nhân: Chỉ cần SĐT và Mật khẩu
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
      // Nếu là Cán bộ: Bắt buộc cả 3 trường
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
      // NHỚ ĐỔI ĐỊA CHỈ IP NÀY THÀNH IP CỦA BẠN
      const response = await fetch(`http://192.168.1.100:5000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // API hiện tại chỉ cần gửi phone và password lên Backend
        body: JSON.stringify({ phone, password }) 
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu token và thông tin user vào AsyncStorage
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        setAlertConfig({ 
          visible: true, 
          type: 'success', 
          message: "Đăng nhập thành công!", 
          autoClose: true 
        });

        // Chuyển hướng theo role
        setTimeout(() => {
          if (data.user.role === 'relative') {
            router.push('/home'); // Vào thẳng app của thân nhân
          } else {
            router.push('/home'); // Vào thẳng app của cán bộ
          }
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
          
          {/* 2. ĐIỀU KIỆN HIỂN THỊ: Chỉ hiện Mã đơn vị khi KHÔNG phải là Thân nhân */}
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
});

export default LoginScreens;