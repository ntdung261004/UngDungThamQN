import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { LayoutGrid, CalendarDays, Users, MessageSquare, UserCircle, Newspaper, LogOut } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

// Import các Tab con
import OverviewTab from './tabs/OverviewTab';
import ScheduleTab from './tabs/ScheduleTab';
import ListTab from './tabs/ListTab'; // Đã đổi tên từ ApprovalTab
import PostTab from './tabs/PostTab'; // Trang mới
import ContactTab from './tabs/ContactTab';
import AccountTab from './tabs/AccountTab';

const HomeCanBo = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab user={user} />;
      case 'Schedule': return <ScheduleTab user={user} />;
      
      // QUAN TRỌNG: Truyền user vào đây
      case 'List': return <ListTab user={user} />; 
      
      case 'Post': return <PostTab user={user} />;
      case 'Contact': return <ContactTab user={user} />;
      case 'Account': return <AccountTab user={user} onLogout={onLogout} />;
      default: return <OverviewTab user={user} />;
    }
  };

  const renderTopbar = () => {
    if (activeTab === 'Overview') {
      return (
        <View style={styles.topBarOverview}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <UserCircle size={40} color="#DDD" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.userName}>{user?.fullName || 'Cán bộ'}</Text>
              <Text style={styles.userSub}>{user?.rank} - {user?.position}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
            <LogOut size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      );
    }

    const titles = { 
        Schedule: 'Lịch Thăm', 
        List: 'Danh Sách', 
        Post: 'Bài Viết',
        Contact: 'Nhắn Tin', 
        Account: 'Tài Khoản' 
    };
    return (
      <View style={styles.topBarStandard}>
        <Text style={styles.topBarTitle}>{titles[activeTab]}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderTopbar()}
      <View style={{ flex: 1 }}>{renderContent()}</View>

      {/* BOTTOM NAVIGATION CÓ THỂ CUỘN NGANG */}
      <View style={styles.bottomNavContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.bottomNavScroll}
        >
          <NavItem icon={LayoutGrid} label="Tổng quan" active={activeTab === 'Overview'} onPress={() => setActiveTab('Overview')} />
          <NavItem icon={CalendarDays} label="Lịch thăm" active={activeTab === 'Schedule'} onPress={() => setActiveTab('Schedule')} />
          <NavItem icon={Users} label="Danh sách" active={activeTab === 'List'} onPress={() => setActiveTab('List')} />
          <NavItem icon={Newspaper} label="Bài viết" active={activeTab === 'Post'} onPress={() => setActiveTab('Post')} />
          <NavItem icon={MessageSquare} label="Nhắn tin" active={activeTab === 'Contact'} onPress={() => setActiveTab('Contact')} />
          <NavItem icon={UserCircle} label="Tài khoản" active={activeTab === 'Account'} onPress={() => setActiveTab('Account')} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const NavItem = ({ icon: Icon, label, active, onPress }) => (
  <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
    <Icon size={22} color={active ? COLORS.primary : '#666'} />
    <Text style={[styles.navLabel, { color: active ? COLORS.primary : '#666' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  topBarOverview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userSub: { fontSize: 12, color: '#666' },
  topBarStandard: { height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  bottomNavContainer: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  bottomNavScroll: { paddingHorizontal: 10, height: 70, alignItems: 'center' },
  navItem: { width: 85, justifyContent: 'center', alignItems: 'center', height: '100%' },
  navLabel: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  logoutBtn: { padding: 8 }
});

export default HomeCanBo;