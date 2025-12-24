import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ẩn thanh tiêu đề mặc định để dùng giao diện tùy chỉnh của bạn
        animation: 'slide_from_right', // Hiệu ứng chuyển trang mượt mà trên cả iOS/Android
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register_canbo" />
      <Stack.Screen name="register_relative" />
    </Stack>
  );
}