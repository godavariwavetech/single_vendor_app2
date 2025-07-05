import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { translate, setCurrentLanguage, getAvailableLocales } from '../../config/i18n'; // Adjust path as needed
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data
const carData = {
  name: 'Maruti Suzuki Ertiga',
  type: 'Sedan',
  seats: '7 Seater',
  fuel: 'Petrol',
  regNumber: 'AP 6009 EGH',
  reissCertificate: 'Verified',
  insurance: 'Not Submitted',
  permit: 'Verified',
  carPhotoOwner: 'Verified'
};

const AddCarDriver = () => {
  const [activeTab, setActiveTab] = useState('Add Car');

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('SelectedLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang) => {
    await setCurrentLanguage(lang);
  };

  const renderContent = () => {
    if (activeTab === 'Add Car') {
      return (
        <View style={styles.card}>
          <View style={styles.carInfo}>
            <Image
              source={{ uri: 'https://via.placeholder.com/50' }}
              style={styles.carImage}
            />
            <View>
              <Text style={styles.carName}>{carData.name}</Text>
              <Text>{carData.type}</Text>
              <Text>{carData.seats}</Text>
              <Text>{carData.fuel}</Text>
              <Text>{carData.regNumber}</Text>
            </View>
            <Text style={styles.verified}>✓ {translate(carData.reissCertificate.toLowerCase())}</Text>
          </View>
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text>{translate('reissCertificate')} ✓ {translate(carData.reissCertificate.toLowerCase())}</Text>
              <Text>{translate('insurance')} ✓ {translate(carData.insurance.toLowerCase())}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text>{translate('permit')} ✓ {translate(carData.permit.toLowerCase())}</Text>
              <Text>{translate('carPhotoOwner')} ✓ {translate(carData.carPhotoOwner.toLowerCase())}</Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.card}>
          <Text>Driver content here</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Car and Driver</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={styles.icon}>≡</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.icon}>🎧</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.customTabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Add Car' && styles.activeTab]}
          onPress={() => setActiveTab('Add Car')}
        >
          <Text style={[styles.tabText, activeTab === 'Add Car' && styles.activeTabText]}>
            {translate('addCar')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Add Driver' && styles.activeTab]}
          onPress={() => setActiveTab('Add Driver')}
        >
          <Text style={[styles.tabText, activeTab === 'Add Driver' && styles.activeTabText]}>
            {translate('addDriver')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderContent()}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        {getAvailableLocales().map(lang => (
          <TouchableOpacity key={lang} onPress={() => changeLanguage(lang)} style={styles.langButton}>
            <Text>{lang.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#4a4a4a' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  headerIcons: { flexDirection: 'row' },
  icon: { fontSize: 20, color: '#ffffff', marginLeft: 10 },
  customTabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tab: { paddingVertical: 5, paddingHorizontal: 15 },
  activeTab: { backgroundColor: '#ffcc80', borderRadius: 5 },
  tabText: { fontSize: 16, fontWeight: 'bold' },
  activeTabText: { color: '#ffffff' },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginVertical: 10 },
  carInfo: { flexDirection: 'row', alignItems: 'center' },
  carImage: { width: 50, height: 50, marginRight: 10 },
  carName: { fontSize: 16, fontWeight: 'bold' },
  verified: { color: 'green', position: 'absolute', right: 10 },
  details: { marginTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  addButton: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    backgroundColor: '#ff9500', 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  addButtonText: { color: 'white', fontSize: 24 },
  langButton: { 
    padding: 5, 
    marginTop: 10, 
    alignSelf: 'flex-end' 
  },
  content: { flex: 1, padding: 10 }
});

export default AddCarDriver;