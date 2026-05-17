import { Bell, LogOut, MessageSquare, Newspaper, UserCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// ĐÃ THÊM useSafeAreaInsets ĐỂ CHỐNG ĐÈ NÚT BOTTOM BAR
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Các Tab con (sườn)
const BangTinTab = () => (
  <View style={styles.centerTab}><Text style={styles.tabPlaceholderText}>NỘI DUNG TẤM BẢNG TIN</Text></View>
);
const LienLacTab = () => (
  <View style={styles.centerTab}><Text style={styles.tabPlaceholderText}>DANH SÁCH LIÊN LẠC CHỈ HUY</Text></View>
);
const ThongBaoTab = () => (
  <View style={styles.centerTab}><Text style={styles.tabPlaceholderText}>DANH SÁCH THÔNG BÁO MỚI</Text></View>
);
const CaNhanTab = ({ onLogout }) => (
  <View style={styles.centerTab}>
    <Text style={styles.tabPlaceholderText}>THÔNG TIN TÀI KHOẢN CÁ NHÂN</Text>
    <TouchableOpacity style={styles.logoutTabBtn} onPress={onLogout}>
      <LogOut size={20} color="#FFF" style={{ marginRight: 8 }} />
      <Text style={styles.logoutTabBtnText}>ĐĂNG XUẤT TÀI KHOẢN</Text>
    </TouchableOpacity>
  </View>
);

// LƯU Ý: NHỚ ĐỔI ĐỊA CHỈ IP NÀY THÀNH IP HIỆN TẠI CỦA BẠN
const API_URL = 'http://192.168.1.100:5000';

export default function HomeRelative({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Post');
  const [soldier, setSoldier] = useState(null);
  const [loadingSoldier, setLoadingSoldier] = useState(true);

  // Khai báo công cụ đo đạc màn hình (chống đè phím ảo)
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchSoldierInfo = async () => {
      if (!user?.soldierId) {
        setLoadingSoldier(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/auth/soldier-info/${user.soldierId}`);
        if (response.ok) {
          const data = await response.json();
          setSoldier(data.soldier);
        }
      } catch (error) {
        console.error("Lỗi fetch thông tin chiến sĩ:", error);
      } finally {
        setLoadingSoldier(false);
      }
    };
    fetchSoldierInfo();
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Post': return <BangTinTab />;
      case 'Contact': return <LienLacTab />;
      case 'Notification': return <ThongBaoTab />;
      case 'Account': return <CaNhanTab onLogout={onLogout} />;
      default: return <BangTinTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'Contact': return 'Hộp thư liên lạc';
      case 'Notification': return 'Thông báo từ đơn vị';
      case 'Account': return 'Hồ sơ cá nhân';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {activeTab === 'Post' ? (
        <View style={styles.topBarProfile}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <UserCircle size={34} color="#AAA" />
              )}
            </View>
            <View style={{ marginLeft: 12 }}>
              
              {/* ĐÃ SỬA: Chữ THÂN NHÂN nằm riêng ở trên, không có ngoặc */}
              <Text style={styles.rankTextTop}>THÂN NHÂN</Text>
              
              <Text style={styles.userName}>{user?.fullName || 'Người nhà'}</Text>
              
              {loadingSoldier ? (
                <ActivityIndicator size="small" color="#FF5252" style={{ alignSelf: 'flex-start', marginTop: 2 }} />
              ) : (
                // ĐÃ SỬA: Hiển thị Mối quan hệ | Tên chiến sĩ
                <Text style={styles.userSub}>
                  {user?.relationship || 'Người nhà'} | {soldier ? `${soldier.rank} ${soldier.fullName}` : `Chiến sĩ • ${user?.unitCode || ''}`}
                </Text>
              )}

            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <LogOut size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.topBarStandard}>
          <Text style={styles.topBarTitle}>{getTabTitle()}</Text>
        </View>
      )}

      <View style={styles.mainBody}>
        {renderContent()}
      </View>

      {/* ĐÃ SỬA LỖI ĐÈ NÚT ẢO: Dùng insets.bottom đẩy padding lên */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Post')}>
          <Newspaper size={22} color={activeTab === 'Post' ? '#FF5252' : '#888'} />
          <Text style={[styles.navText, activeTab === 'Post' && styles.navTextActive]}>Bảng tin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Contact')}>
          <MessageSquare size={22} color={activeTab === 'Contact' ? '#FF5252' : '#888'} />
          <Text style={[styles.navText, activeTab === 'Contact' && styles.navTextActive]}>Liên lạc</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Notification')}>
          <Bell size={22} color={activeTab === 'Notification' ? '#FF5252' : '#888'} />
          <Text style={[styles.navText, activeTab === 'Notification' && styles.navTextActive]}>Thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Account')}>
          <UserCircle size={22} color={activeTab === 'Account' ? '#FF5252' : '#888'} />
          <Text style={[styles.navText, activeTab === 'Account' && styles.navTextActive]}>Cá nhân</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  mainBody: { flex: 1 },
  
  topBarProfile: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  
  // Style MỚI cho chữ THÂN NHÂN ở trên cùng
  rankTextTop: { fontSize: 11, color: '#FF5252', fontWeight: '800', marginBottom: 2, letterSpacing: 0.5 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userSub: { fontSize: 13, color: '#666', marginTop: 2, fontWeight: '500' },
  
  logoutBtn: { padding: 8, borderRadius: 10, backgroundColor: '#FFF0F0' },
  
  topBarStandard: { 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE',
    elevation: 2
  },
  topBarTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 10, // Giữ padding Top
    justifyContent: 'space-around',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5
  },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 11, color: '#888', marginTop: 4, fontWeight: '500' },
  navTextActive: { color: '#FF5252', fontWeight: 'bold' },

  centerTab: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  tabPlaceholderText: { fontSize: 14, color: '#999', fontWeight: '600', letterSpacing: 0.5 },
  logoutTabBtn: { marginTop: 20, flexDirection: 'row', backgroundColor: '#FF5252', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  logoutTabBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});