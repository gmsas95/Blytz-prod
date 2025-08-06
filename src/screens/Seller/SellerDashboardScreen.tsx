import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { SellerDashboardData } from '../../types/models/seller';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { SellerStackParamList, SellerTabParamList } from '../../navigation/SellerNavigator';
import { functions } from '../../config/firebase.config';
import { httpsCallable } from 'firebase/functions';

type SellerDashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<SellerTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<SellerStackParamList>
>;

const SellerDashboardScreen = () => {
  const navigation = useNavigation<SellerDashboardScreenNavigationProp>();
  const { user, sellerProfile, refreshSellerProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<SellerDashboardData | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      await refreshSellerProfile();
      
      // Call Cloud Function to get real-time dashboard data
      const getSellerDashboard = httpsCallable(functions, 'getSellerDashboard');
      const result = await getSellerDashboard();
      
      if (result.data) {
        setDashboardData(result.data as SellerDashboardData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [refreshSellerProfile]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }) => (
    <View className="bg-white rounded-lg p-4 shadow-sm flex-1 mx-2">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-gray-600 mb-1">{title}</Text>
          <Text className="text-2xl font-bold text-gray-800">{value}</Text>
        </View>
        <View className={`w-12 h-12 rounded-full items-center justify-center`} style={{ backgroundColor: color }}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
      </View>
    </View>
  );

  const QuickActionButton = ({ title, icon, onPress, color }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 shadow-sm flex-1 mx-2 mb-4"
      onPress={onPress}
    >
      <View className="items-center">
        <View className={`w-16 h-16 rounded-full items-center justify-center mb-2`} style={{ backgroundColor: color }}>
          <Ionicons name={icon} size={32} color="#fff" />
        </View>
        <Text className="text-sm font-medium text-gray-800">{title}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !dashboardData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF385C" />
        <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No data available</Text>
      </View>
    );
  }

  const { seller, stats } = dashboardData;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {/* Header */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                Welcome back,
              </Text>
              <Text className="text-2xl font-bold text-purple-600">
                {seller.businessName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className="bg-gray-100 p-2 rounded-full"
            >
              <Ionicons name="person" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {/* Verification Status */}
          <View className="mt-4">
            <View className={`rounded-lg p-3 flex-row items-center ${
              seller.isVerified ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <Ionicons
                name={seller.isVerified ? 'checkmark-circle' : 'time'}
                size={20}
                color={seller.isVerified ? '#10B981' : '#F59E0B'}
              />
              <Text className={`ml-2 font-medium ${
                seller.isVerified ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {seller.isVerified ? 'Verified Seller' : `Status: ${seller.verificationStatus}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Overview</Text>
        <View className="flex-row mb-4">
          <StatCard
            title="Total Revenue"
            value={`RM${stats.totalRevenue.toFixed(2)}`}
            icon="cash"
            color="#10B981"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="cart"
            color="#3B82F6"
          />
        </View>

        <View className="flex-row mb-4">
          <StatCard
            title="Active Streams"
            value={stats.activeStreams}
            icon="radio"
            color="#8B5CF6"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="cube"
            color="#F59E0B"
          />
        </View>

        <View className="flex-row mb-6">
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon="time"
            color="#EF4444"
          />
          <StatCard
            title="Rating"
            value={`${seller.rating}/5`}
            icon="star"
            color="#F97316"
          />
        </View>

        {/* Quick Actions */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap">
          <QuickActionButton
            title="Start Stream"
            icon="radio"
            onPress={() => navigation.navigate('CreateStream')}
            color="#8B5CF6"
          />
          <QuickActionButton
            title="Add Product"
            icon="add-circle"
            onPress={() => navigation.navigate('AddProduct')}
            color="#3B82F6"
          />
          <QuickActionButton
            title="View Orders"
            icon="list"
            onPress={() => navigation.navigate('Orders')}
            color="#10B981"
          />
          <QuickActionButton
            title="Analytics"
            icon="stats-chart"
            onPress={() => {
              // TODO: navigation.navigate('SellerAnalytics')
            }}
            color="#F59E0B"
          />
        </View>

        {/* Recent Activity */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Recent Activity</Text>
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Ionicons name="radio" size={20} color="#8B5CF6" />
            <Text className="ml-2 font-medium text-gray-800">Latest Stream</Text>
          </View>
          <Text className="text-sm text-gray-600 mb-2">
            You have {stats.activeStreams} active livestream(s)
          </Text>
          <TouchableOpacity
            className="bg-purple-100 p-2 rounded-lg"
            onPress={() => navigation.navigate('Streams')}
          >
            <Text className="text-purple-600 text-center font-medium">View All Streams</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Summary */}
        <View className="bg-white rounded-lg p-4 shadow-sm mt-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Text className="ml-2 font-medium text-gray-800">Performance</Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total Sales</Text>
              <Text className="text-sm font-medium text-gray-800">{seller.totalSales}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total Revenue</Text>
              <Text className="text-sm font-medium text-gray-800">RM{seller.totalRevenue.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Customer Rating</Text>
              <Text className="text-sm font-medium text-gray-800">{seller.rating}/5 ({seller.reviewCount} reviews)</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SellerDashboardScreen;
