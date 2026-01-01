import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Smartphone, Lock, ChevronLeft, ShieldAlert, HelpCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// Import AsyncStorage để lưu trạng thái đăng nhập
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import các thành phần tùy chỉnh
import CustomInput from '../../components/CustomInput';
import CustomAlert from '../../components/CustomAlert';
import { COLORS } from '../../constants/theme';

const LoginScreens = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams(); 

  // State quản lý dữ liệu
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
    if (!rootCode || !phone || !password) {
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        message: "Vui lòng nhập đầy đủ Key đơn vị, SĐT và mật khẩu", 
        autoClose: false 
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rootCode, phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // QUAN TRỌNG: Lưu thông tin user và token vào máy để app/home.js sử dụng
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('token', data.token);

        setAlertConfig({ 
            visible: true, 
            type: 'success', 
            message: "Đăng nhập thành công!", 
            autoClose: true 
        });

        setTimeout(() => {
          // Điều hướng về /home (File app/home.js sẽ tự check isApproved)
          router.replace('/home');
        }, 1500);
      } else {
        setAlertConfig({ 
            visible: true, 
            type: 'error', 
            message: data.message || "Thông tin không chính xác", 
            autoClose: false 
        });
      }
    } catch (error) {
      setAlertConfig({ 
        visible: true, 
        type: 'error', 
        message: "Lỗi kết nối Server! Vui lòng kiểm tra lại.", 
        autoClose: false 
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <ChevronLeft size={28} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>
          Hệ thống {role === 'canbo' ? 'Cán bộ quản lý' : 'Thân nhân quân nhân'}
        </Text>

        <View style={styles.form}>
          {/* ĐỔI NHÃN THEO YÊU CẦU MỚI */}
          <Text style={styles.label}>Key đơn vị cung cấp</Text>
          <CustomInput 
            icon={ShieldAlert} 
            placeholder="Ví dụ: D6E5F5QK7" 
            value={rootCode}
            onChangeText={setRootCode}
          />

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

          <TouchableOpacity 
            style={styles.forgotPassContainer} 
            onPress={() => router.push('/forgot_password')}
          >
            <HelpCircle size={16} color={COLORS.primary} />
            <Text style={styles.forgotPassText}> Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginText}>Vào hệ thống</Text>
          </TouchableOpacity>

          <View style={styles.footerLink}>
            <Text style={styles.noAccount}>Chưa có tài khoản? </Text>
            <TouchableOpacity 
              onPress={() => role === 'canbo' 
                ? router.push('/register_canbo') 
                : router.push('/register_relative')}
            >
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alertConfig.visible}
        type={alertConfig.type}
        message={alertConfig.message}
        autoClose={alertConfig.autoClose}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
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
  footerLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 35 },
  noAccount: { color: COLORS.textGrey, fontSize: 14 },
  linkText: { color: COLORS.primary, fontSize: 14, fontWeight: 'bold' }
});

export default LoginScreens;