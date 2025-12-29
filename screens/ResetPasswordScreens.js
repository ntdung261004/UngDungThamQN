import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Lock, RotateCcw, ChevronLeft } from 'lucide-react-native';
import CustomInput from '../components/CustomInput';
import { COLORS } from '../theme/color';
import { useRouter } from 'expo-router';

const ResetPasswordScreen = () => {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const router = useRouter();

  const handleReset = () => {
    if (newPass !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }
    Alert.alert("Thành công", "Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.");
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={28} color={COLORS.textDark} />
      </TouchableOpacity>

      <Text style={styles.title}>Mật khẩu mới</Text>
      <Text style={styles.subtitle}>Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <CustomInput icon={Lock} placeholder="........" secureTextEntry={true} value={newPass} onChangeText={setNewPass} />
        
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <CustomInput icon={RotateCcw} placeholder="........" secureTextEntry={true} value={confirmPass} onChangeText={setConfirmPass} />

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Cập nhật mật khẩu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 25, paddingTop: 60 },
  backButton: { marginBottom: 20, marginLeft: -10 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textGrey, marginBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  resetButton: { backgroundColor: COLORS.primary, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  resetText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});

export default ResetPasswordScreen;