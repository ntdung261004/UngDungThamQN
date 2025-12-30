import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
// Giả sử bạn lưu thông tin user trong bộ nhớ (sau này sẽ dùng AsyncStorage)
import HomeCanBo from '../screens/home_screens/HomeCanBo';
import HomeRelative from '../screens/home_screens/HomeRelative';

export default function HomePage() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tạm thời lấy dữ liệu giả lập (Sau này lấy từ thông tin trả về của API Login)
    // Bạn có thể thử đổi 'canbo' thành 'relative' để test 2 giao diện
    const userRole = 'canbo'; 
    setRole(userRole);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return role === 'canbo' ? <HomeCanBo /> : <HomeRelative />;
}