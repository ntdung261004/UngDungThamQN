import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Clock } from 'lucide-react-native';
// Sửa lại cú pháp import chuẩn
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import giao diện từ thư mục screens theo đúng cấu trúc của bạn
import HomeCanBo from '../screens/home_screens/HomeCanBo';
import HomeRelative from '../screens/home_screens/HomeRelative';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Nếu chưa đăng nhập, trả về trang login
        router.replace('/login');
      }
    } catch (error) {
      console.error("Lỗi kiểm tra xác thực:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // --- LOGIC PHÊ DUYỆT (CHẶN TẠI ĐÂY) ---
  // Tài khoản mới đăng ký sẽ có isApproved = false
  if (user && user.isApproved === false) {
    return (
      <View style={styles.waitingContainer}>
        <Clock color="#F57C00" size={80} strokeWidth={1.5} />
        <Text style={styles.waitingTitle}>Tài khoản đang chờ duyệt</Text>
        <Text style={styles.waitingSub}>
          Chào <Text style={{fontWeight: 'bold'}}>{user.fullName}</Text>,{"\n"}
          Tài khoản của bạn thuộc đơn vị <Text style={{color: '#2E7D32'}}>{user.rootCode}</Text> đang chờ kiểm tra.{"\n"}
          Vui lòng đợi quản trị viên phê duyệt để sử dụng ứng dụng.
        </Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color="#FFF" size={20} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- LOGIC ĐIỀU HƯỚNG GIAO DIỆN KHI ĐÃ ĐƯỢC DUYỆT ---
  if (user?.role === 'canbo') {
    return <HomeCanBo user={user} onLogout={handleLogout} />;
  } 
  
  if (user?.role === 'relative') {
    return <HomeRelative user={user} onLogout={handleLogout} />;
  }

  return null;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  waitingContainer: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30 
  },
  waitingTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 20, 
    color: '#333' 
  },
  waitingSub: { 
    fontSize: 15, 
    textAlign: 'center', 
    color: '#666', 
    marginTop: 15, 
    lineHeight: 24 
  },
  logoutBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#D32F2F', 
    paddingVertical: 12, 
    paddingHorizontal: 30, 
    borderRadius: 10, 
    marginTop: 40, 
    alignItems: 'center' 
  },
  logoutText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    marginLeft: 10, 
    fontSize: 16 
  }
});