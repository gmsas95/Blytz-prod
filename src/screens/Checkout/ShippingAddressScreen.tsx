import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {ShippingAddress} from '../../types/auth';
import {User} from '../../types/models/user';

export default function ShippingAddressScreen() {
  const {user, updateShippingAddress, addShippingAddress, deleteShippingAddress, refreshUser} = useAuth();
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        // Mock data for now, replace with actual fetch from user.shippingAddresses
        const userAddresses = user.shippingAddresses || [];
        setAddresses(userAddresses);
        if (userAddresses.length > 0) {
          handleSelectAddress(userAddresses[0]);
        }
      } catch (err: unknown) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load shipping addresses.');
        Alert.alert(
          'Error',
          'Could not load shipping addresses. Please try again later.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleSaveAddress = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save an address.');
      return;
    }
    if (
      !name ||
      !addressLine1 ||
      !city ||
      !state ||
      !zipCode ||
      !country ||
      !phoneNumber
    ) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    const addressData: ShippingAddress = {
      id: selectedAddress?.id || Date.now().toString(), // Use existing ID or generate new
      name,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode: zipCode,
      country,
      phoneNumber,
      isDefault: selectedAddress?.isDefault || false, // Preserve default status or set to false
    };

    try {
      if (selectedAddress?.id) {
        // Assuming user.updateShippingAddress is implemented on the User object
        await updateShippingAddress(addressData);
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        // Assuming user.addShippingAddress is implemented on the User object
        await addShippingAddress(addressData);
        Alert.alert('Success', 'Address added successfully!');
      }
      // Refresh addresses after save
      await refreshUser();
      setAddresses(user.shippingAddresses || []);
      handleAddNewAddress();
    } catch (err: unknown) {
      console.error('Error saving address:', err);
      setError('Failed to save address.');
      Alert.alert('Error', 'Could not save the address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddress(address);
    setName(address.name);
    setAddressLine1(address.addressLine1);
    setAddressLine2(address.addressLine2 || '');
    setCity(address.city);
    setState(address.state);
    setZipCode(address.postalCode);
    setCountry(address.country);
    setPhoneNumber(address.phoneNumber);
  };

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setName('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('');
    setPhoneNumber('');
  };

  const handleDeleteAddress = async () => {
    if (!user || !selectedAddress?.id) return;
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            setError(null);
            try {
              await deleteShippingAddress(selectedAddress.id!); // Assuming deleteShippingAddress takes ID
              Alert.alert('Success', 'Address deleted successfully!');
              await refreshUser();
              setAddresses(user.shippingAddresses || []);
              handleAddNewAddress();
            } catch (err: unknown) {
              console.error('Error deleting address:', err);
              setError('Failed to delete address.');
              Alert.alert(
                'Error',
                'Could not delete the address. Please try again.',
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between py-4 px-4 border-b border-border mt-4">
        <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="text" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">Shipping Addresses</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1">
        <View className="p-5">
          {isLoading && <ActivityIndicator size="large" color="#FF385C" />}
          {error && (
            <Text className="text-center mb-2.5 text-sm text-error">
              {error}
            </Text>
          )}

          {addresses.length > 0 && !selectedAddress && (
            <View className="mb-5">
              <Text className="text-lg font-semibold mt-5 mb-2.5 text-text">
                Select an Address:
              </Text>
              {addresses.map(addr => (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => handleSelectAddress(addr)}
                  className="mb-2.5 p-4 border border-border rounded-lg items-center">
                  <Text className="text-text">
                    {addr.name} - {addr.addressLine1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text className="text-lg font-semibold mt-5 mb-2.5 text-text">
            {selectedAddress ? 'Edit Address' : 'Add New Address'}
          </Text>

          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            accessibilityLabel="Full Name Input"
          />
          <TextInput
            placeholder="Address Line 1"
            value={addressLine1}
            onChangeText={setAddressLine1}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            accessibilityLabel="Address Line 1 Input"
          />
          <TextInput
            placeholder="Address Line 2 (Optional)"
            value={addressLine2}
            onChangeText={setAddressLine2}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            accessibilityLabel="Address Line 2 Input"
          />
          <TextInput
            placeholder="City"
            value={city}
            onChangeText={setCity}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            accessibilityLabel="City Input"
          />
          <TextInput
            placeholder="State/Province/Region"
            value={state}
            onChangeText={setState}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            accessibilityLabel="State Input"
          />
          <TextInput
            placeholder="ZIP/Postal Code"
            value={zipCode}
            onChangeText={setZipCode}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            keyboardType="numeric"
            accessibilityLabel="ZIP Code Input"
          />
          <TextInput
            placeholder="Country"
            value={country}
            onChangeText={setCountry}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            accessibilityLabel="Country Input"
          />
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            className="h-11 border border-border rounded-lg px-4 text-base mb-4 text-text"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            accessibilityLabel="Phone Number Input"
          />

          <TouchableOpacity
            onPress={handleSaveAddress}
            disabled={isLoading}
            className="mt-4 py-3 rounded-lg items-center justify-center bg-primary">
            <Text className="text-white text-base font-bold">
              {selectedAddress ? 'Update Address' : 'Save Address'}
            </Text>
          </TouchableOpacity>

          {selectedAddress && (
            <TouchableOpacity
              onPress={handleDeleteAddress}
              disabled={isLoading}
              className="mt-4 py-3 rounded-lg items-center justify-center bg-error">
              <Text className="text-white text-base font-bold">
                Delete Address
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleAddNewAddress}
            className="mt-4 py-3 rounded-lg items-center justify-center bg-transparent border border-primary">
            <Text className="text-base font-bold text-primary">
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
