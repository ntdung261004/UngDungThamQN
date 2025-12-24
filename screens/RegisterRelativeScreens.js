import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Smartphone, Lock, ChevronLeft, Users, EyeOff, RotateCcw, Heart } from 'lucide-react-native';
import CustomInput from '../components/CustomInput';
import { COLORS } from '../theme/color';

import { useRouter } from 'expo-router';

const RegisterRelativeScreens = () => {
  const router = useRouter();
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/')}>
          <ChevronLeft size={28} color={COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Đăng ký</Text>

        {/* Biểu tượng Trái tim/Người thân trung tâm */}
        <View style={styles.headerIcon}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFF0F0' }]}>
            <Heart size={40} color="#FF5252" />
          </View>
        </View>

        <Text style={styles.title}>Đăng ký Thân nhân</Text>
        <Text style={styles.subtitle}>
          Tạo tài khoản để theo dõi tình hình công tác và đăng ký thăm con em tại đơn vị.
        </Text>

        <Text style={styles.label}>Họ và tên người thân</Text>
        <CustomInput icon={User} placeholder="Nguyễn Văn B" />

        <Text style={styles.label}>Số điện thoại</Text>
        <CustomInput icon={Smartphone} placeholder="09xx xxx xxx" />

        <Text style={styles.label}>Mã số quân nhân (Con em)</Text>
        <CustomInput icon={Users} placeholder="Nhập mã số để liên kết" />

        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputWrapper}>
          <CustomInput icon={Lock} placeholder="........" secureTextEntry={true} />
          <TouchableOpacity style={styles.eyeIcon}>
            <EyeOff size={20} color={COLORS.textGrey} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <View style={styles.inputWrapper}>
          <CustomInput icon={RotateCcw} placeholder="........" secureTextEntry={true} />
          <TouchableOpacity style={styles.eyeIcon}>
            <EyeOff size={20} color={COLORS.textGrey} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.registerButton, { backgroundColor: '#FF5252' }]} activeOpacity={0.8}>
          <Text style={styles.registerButtonText}>Đăng ký & Kết nối</Text>
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
  scrollContent: { padding: 25, paddingTop: 40 },
  backButton: { marginBottom: 10 },
  backText: { fontSize: 24, fontWeight: 'bold', color: COLORS.textDark },
  headerTitle: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: -30, marginBottom: 30 },
  headerIcon: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { 
    width: 90, height: 90, 
    borderRadius: 20, justifyContent: 'center', alignItems: 'center' 
  },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: COLORS.textDark, marginBottom: 10 },
  subtitle: { fontSize: 14, textAlign: 'center', color: COLORS.textGrey, marginBottom: 30, paddingHorizontal: 20 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 8 },
  inputWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, top: 18 },
  registerButton: {
    height: 55, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginTop: 30
  },
  registerButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  footerLink: { marginTop: 20, marginBottom: 30, alignItems: 'center' },
  footerText: { color: COLORS.textGrey, fontSize: 14 },
  link: { fontWeight: 'bold' }
});

export default RegisterRelativeScreens;