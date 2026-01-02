import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { LayoutGrid, CalendarDays, Users, MessageSquare, UserCircle, Newspaper, LogOut } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

// Import các Tab con
import OverviewTab from './tabs/OverviewTab';
import ScheduleTab from './tabs/ScheduleTab';
import ListTab from './tabs/ListTab'; 
import PostTab from './tabs/PostTab';
import ContactTab from './tabs/ContactTab';
import AccountTab from './tabs/AccountTab';

const HomeCanBo = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  // Logic hiển thị nội dung theo Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab user={user} />;
      case 'Schedule': return <ScheduleTab user={user} />;
      case 'List': return <ListTab user={user} />; 
      case 'Post': return <PostTab user={user} />;
      case 'Contact': return <ContactTab user={user} />;
      case 'Account': return <AccountTab user={user} onLogout={onLogout} />;
      default: return <OverviewTab user={user} />;
    }
  };

  // Logic hiển thị Tiêu đề/Topbar động
  const renderTopbar = () => {
    // Tab Tổng quan hiển thị thông tin cá nhân chi tiết
    if (activeTab === 'Overview') {
      return (
        <View style={styles.topBarOverview}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <UserCircle size={40} color="#DDD" />
              )}
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.rankTextInline}>
                {user?.rank || 'Cán bộ'}
              </Text>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <Text style={styles.userSub}>
                {user?.position || 'Chưa cập nhật'} | {user?.unitCode}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <LogOut size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      );
    }

    // Các tab khác hiển thị tiêu đề trang chuẩn
    const titles = {
      'Schedule': 'Lịch công tác',
      'List': 'Quản lý đơn vị',
      'Post': 'Bản tin đơn vị',
      'Contact': 'Danh bạ điện thoại',
      'Account': 'Tài khoản'
    };

    return (
      <View style={styles.topBarStandard}>
        <Text style={styles.topBarTitle}>{titles[activeTab] || 'Trang chủ'}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTopbar()}
      
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* THANH ĐIỀU HƯỚNG DƯỚI (BOTTOM NAV) */}
      <View style={styles.bottomNavContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomNavScroll}
        >
          <NavButton 
            label="Tổng quan" icon={LayoutGrid} 
            active={activeTab === 'Overview'} 
            onPress={() => setActiveTab('Overview')} 
          />
          <NavButton 
            label="Quản lý" icon={Users} 
            active={activeTab === 'List'} 
            onPress={() => setActiveTab('List')} 
          />
          <NavButton 
            label="Lịch" icon={CalendarDays} 
            active={activeTab === 'Schedule'} 
            onPress={() => setActiveTab('Schedule')} 
          />
          <NavButton 
            label="Bản tin" icon={Newspaper} 
            active={activeTab === 'Post'} 
            onPress={() => setActiveTab('Post')} 
          />
          <NavButton 
            label="Liên lạc" icon={MessageSquare} 
            active={activeTab === 'Contact'} 
            onPress={() => setActiveTab('Contact')} 
          />
          <NavButton 
            label="Cá nhân" icon={UserCircle} 
            active={activeTab === 'Account'} 
            onPress={() => setActiveTab('Account')} 
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const NavButton = ({ label, icon: Icon, active, onPress }) => (
  <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
    <Icon size={22} color={active ? COLORS.primary : '#666'} />
    <Text style={[styles.navLabel, { color: active ? COLORS.primary : '#666' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  topBarOverview: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE',
    elevation: 2
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 45, height: 45, borderRadius: 25 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  rankTextInline: { fontSize: 11, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase' },
  userSub: { fontSize: 12, color: '#888', marginTop: 2 },
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
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  bottomNavContainer: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: 5 },
  bottomNavScroll: { paddingHorizontal: 10, paddingVertical: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, minWidth: 80 },
  navItemActive: { borderTopWidth: 0 },
  navLabel: { fontSize: 11, marginTop: 4, fontWeight: '500' },
});

export default HomeCanBo;