import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  PermissionsAndroid,
  Keyboard,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
} from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {useDispatch, useSelector} from 'react-redux';
import {setAddressList} from '../../redux/reducers/daddy';
import {getAvailableLocations} from '../../redux/reducers/auth';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import CustomModal from '../../components/CustomModal';
import {setUserDetails} from '../../redux/reducers/addressSlice';
import { colors } from '../../config/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// FIX: Set default coordinates to Tirupati, Andhra Pradesh
const TIRUPATI_COORDS = {
    latitude: 13.6288,
    longitude: 79.4192,
};

const AddAddressScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {availableLocations} = useSelector(state => state.Auth);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('Home');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [doorNo, setDoorNo] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [region, setRegion] = useState({
    latitude: TIRUPATI_COORDS.latitude,
    longitude: TIRUPATI_COORDS.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: TIRUPATI_COORDS.latitude,
    longitude: TIRUPATI_COORDS.longitude,
  });
  const mapRef = useRef(null);
  const lastUpdateTime = useRef(Date.now());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const searchTimeout = useRef(null);
  const [areaAvailable,setAreaAvailable] = useState(true)
  const [customModal, setCustomModal] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: null,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationValidation, setLocationValidation] = useState(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const [isSearching, setIsSearching] = useState(false);

  const showCustomModal = useCallback(
    (
      title,
      message,
      onConfirm,
      onCancel = null,
      confirmText = 'OK',
      cancelText = null,
    ) => {
      setCustomModal({
        visible: true,
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
      });
    },
    [],
  );

  const hideCustomModal = useCallback(() => {
    setCustomModal(prev => ({...prev, visible: false}));
  }, []);

  const getAddressFromCoordinates = async (latitude, longitude) => {
    setIsFetchingAddress(true);
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      );
      const data = await response.json();
      if (data) {
        const fullAddress = `${data.locality}, ${data.city}, ${data.principalSubdivision}, ${data.postcode}, ${data.countryName}`;
        setAddress(fullAddress);
        setCity(data.city || '');
        setState(data.principalSubdivision || '');
        setDoorNo(data.locality || '');
        setPincode(data.postcode || '');
        setLandmark(data.localityInfo?.informative?.[0]?.name || data.city);
      } else {
        console.warn('Address data not found in BigDataCloud response:', data);
      }
    } catch (error) {
      console.error('Error getting address from BigDataCloud:', error);
      showCustomModal('Error', 'Failed to get address details. Please try again.');
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const animateToRegion = useCallback(newRegion => {
    mapRef.current?.animateToRegion(newRegion, 1000);
  }, []);

  const onRegionChangeComplete = useCallback(newRegion => {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime.current > 500) {
      setMarkerPosition({ latitude: newRegion.latitude, longitude: newRegion.longitude });
      setRegion(newRegion);
      getAddressFromCoordinates(newRegion.latitude, newRegion.longitude);
      const validation = isLocationWithinDeliveryRadius(newRegion.latitude, newRegion.longitude);
      setLocationValidation(validation);
      lastUpdateTime.current = currentTime;
    }
  }, [isLocationWithinDeliveryRadius]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'ios') return getCurrentLocation();
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        showCustomModal('Permission Denied', 'Location permission is required.');
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (route.params?.address) {
      showCustomModal('Update Location', 'Use current location for this address?', () => fetchCurrentLocation(), null, 'Update', 'Cancel');
      return;
    }
    fetchCurrentLocation();
  }, [route.params?.address]);

  const fetchCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
        setMarkerPosition({ latitude, longitude });
        setRegion(newRegion);
        animateToRegion(newRegion);
        getAddressFromCoordinates(latitude, longitude);
        const validation = isLocationWithinDeliveryRadius(latitude, longitude);
        setLocationValidation(validation);
        setIsLoadingLocation(false);
      },
      error => {
        setIsLoadingLocation(false);
        showCustomModal('Location Error', 'Unable to fetch your current location.');
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, [animateToRegion]);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidHide.remove();
      keyboardDidShow.remove();
    };
  }, []);

  const [inputErrors, setInputErrors] = useState({});
  const validateInputs = useCallback(() => {
    const errors = {
      name: !name,
      contact: !/^[6-9]\d{9}$/.test(contact),
      doorNo: !doorNo,
      pincode: !pincode,
      landmark: !landmark,
    };
    setInputErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      showCustomModal('Validation Error', 'Please fill all required fields correctly.');
      return false;
    }
    return true;
  }, [name, contact, doorNo, pincode, landmark]);

  const handleSave = useCallback(() => {
    if (validateInputs()) {
      setModalVisible(false);
      addAddress();
      dispatch(setUserDetails({ name, contact, pincode, landmark, city, state }));
    }
  }, [validateInputs]);

  const toggleModal = useCallback(() => setModalVisible(prev => !prev), []);

  const addAddress = useCallback(async () => {
    setIsSaving(true);
    try {
      const validation = isLocationWithinDeliveryRadius(markerPosition.latitude, markerPosition.longitude);
      if (validation.isAvailable) {
        const addressData = {
          addressType: selectedType, address: doorNo, location_id: validation.nearestLocation.id,
          customer_latitude: markerPosition.latitude.toString(), customer_longitude: markerPosition.longitude.toString(),
          customer_name: name, customer_mobile_number: contact, pincode, landmark, city, state, full_address: address,
        };
        const action = route.params?.address ? setAddressList({ ...addressData, id: route.params.address.id }) : setAddressList(addressData);
        await dispatch(action);
        navigation.goBack();
      } else {
        const { nearestLocation, distance } = validation;
        const message = `The selected location is not available for delivery. The nearest service area is ${nearestLocation?.location_name || 'away'} (${distance.toFixed(1)} km away).`;
        showCustomModal('Location Not Available', message);
        setAreaAvailable(false);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showCustomModal('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [dispatch, selectedType, doorNo, markerPosition, name, contact, pincode, landmark, city, state, address, route.params?.address, navigation, isLocationWithinDeliveryRadius]);

  // FIX: This useEffect now handles both editing an address AND fetching the initial default address
  useEffect(() => {
    // If we are editing an existing address, use its coordinates
    if (route.params?.address) {
      const addr = route.params.address;
      setName(addr.customer_name || '');
      setContact(addr.customer_mobile_number || '');
      setDoorNo(addr.address || ''); 
      setPincode(addr.pincode || '');
      setLandmark(addr.landmark || '');
      setSelectedType(addr.address_type || 'Home');
      setAddress(addr.full_address || '');
      setCity(addr.city || '');
      setState(addr.state || '');
      if (addr.customer_latitude && addr.customer_longitude) {
        const lat = parseFloat(addr.customer_latitude);
        const lng = parseFloat(addr.customer_longitude);
        const newRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 };
        setMarkerPosition({ latitude: lat, longitude: lng });
        setRegion(newRegion);
        animateToRegion(newRegion);
        // Also fetch address and validate for the existing location
        getAddressFromCoordinates(lat, lng);
        setLocationValidation(isLocationWithinDeliveryRadius(lat, lng));
      }
    } else {
      // This is a new address, fetch details for the default Tirupati location immediately
      getAddressFromCoordinates(TIRUPATI_COORDS.latitude, TIRUPATI_COORDS.longitude);
      setLocationValidation(isLocationWithinDeliveryRadius(TIRUPATI_COORDS.latitude, TIRUPATI_COORDS.longitude));
    }
  }, [route.params]); // This hook now depends only on route.params

  useEffect(() => {
    if (!availableLocations || availableLocations.length === 0) {
      dispatch(getAvailableLocations());
    }
  }, [dispatch, availableLocations]);

  const handleSearch = useCallback(text => {
    setSearchQuery(text);
    setShowResults(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (text.trim().length < 3) {
        setSearchResults([]);
        return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&countrycodes=in&limit=7`,
          { headers: { 'User-Agent': 'com.your.app.name' } }
        );
        const data = await response.json();
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching places:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const handlePlaceSelect = useCallback(result => {
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    const newRegion = { latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
    setMarkerPosition({ latitude, longitude });
    setRegion(newRegion);
    animateToRegion(newRegion);
    getAddressFromCoordinates(latitude, longitude);
    setLocationValidation(isLocationWithinDeliveryRadius(latitude, longitude));
    setShowResults(false);
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  }, [animateToRegion, isLocationWithinDeliveryRadius]);
  
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const isLocationWithinDeliveryRadius = useCallback((selectedLat, selectedLon) => {
    if (!availableLocations?.length) return { isAvailable: false, nearestLocation: null, distance: Infinity };
    let nearestLocation = null, minDistance = Infinity, isAvailable = false, bestAvailableLocation = null;
    for (const location of availableLocations) {
      const distance = calculateDistance(selectedLat, selectedLon, parseFloat(location.location_latitude), parseFloat(location.location_longitude));
      if (distance < minDistance) { minDistance = distance; nearestLocation = location; }
      if (distance <= parseFloat(location.maximum_delivery_service_km)) { isAvailable = true; bestAvailableLocation = location; break; }
    }
    if (isAvailable) return { isAvailable: true, nearestLocation: bestAvailableLocation, distance: calculateDistance(selectedLat, selectedLon, parseFloat(bestAvailableLocation.location_latitude), parseFloat(bestAvailableLocation.location_longitude)) };
    return { isAvailable: false, nearestLocation, distance: minDistance };
  }, [availableLocations, calculateDistance]);
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left-long" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{route.params?.address ? 'Edit Address' : 'Add Address'}</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={onRegionChangeComplete}
          showsMyLocationButton={false}
          moveOnMarkerPress={false}
        />
        <View style={styles.markerOverlay}>
          <View style={styles.markerContainer}>
            <View style={styles.markerTextContainer}><Text style={styles.markerText}>Order will be delivered here</Text></View>
            <MaterialIcons name="location-on" size={40} color={colors.maintheme} />
          </View>
        </View>
        <TouchableOpacity style={[styles.currentLocationButton, isLoadingLocation && styles.currentLocationButtonLoading]} onPress={requestLocationPermission} disabled={isLoadingLocation}>
          {isLoadingLocation ? <ActivityIndicator color={colors.maintheme} size="small" /> : (<><MaterialIcons name="my-location" size={24} color={colors.maintheme} /><Text style={styles.currentLocationText}>use current location</Text></>)}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <AntDesign name="search1" size={20} color="#666" style={styles.searchIcon} />
          <TextInput placeholder="Search for Area/Location" style={styles.searchInput} value={searchQuery} onChangeText={handleSearch} />
          {searchQuery.length > 0 && (<TouchableOpacity style={styles.clearButton} onPress={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}><AntDesign name="close" size={20} color="#7A7A7A" /></TouchableOpacity>)}
        </View>
        {showResults && searchQuery.length > 2 && (
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <ActivityIndicator style={{marginTop: 20}} color={colors.maintheme} size="large" />
            ) : searchResults.length === 0 ? (
                <Text style={styles.noResultsText}>No results found</Text>
            ) : (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.place_id.toString()}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.searchResultItem} onPress={() => handlePlaceSelect(item)}>
                        <MaterialIcons name="location-on" size={20} color={colors.maintheme} />
                        <View style={styles.searchResultText}>
                            <Text style={styles.searchResultMain} numberOfLines={1}>{item.display_name.split(',')[0]}</Text>
                            <Text style={styles.searchResultSecondary} numberOfLines={2}>{item.display_name.split(',').slice(1).join(',').trim()}</Text>
                        </View>
                        </TouchableOpacity>
                    )}
                />
            )}
          </View>
        )}
      </View>

      {!isKeyboardVisible && (
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.locationInfo}>
            <View style={styles.locationIcon}><MaterialIcons name="location-on" size={24} color={colors.maintheme} /></View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationTitle} numberOfLines={1}>{city || 'Location'}</Text>
              <Text style={styles.locationSubtitle} numberOfLines={2}>{isFetchingAddress ? 'Fetching address...' : address || 'Move the map to select location'}</Text>
              {locationValidation && (
                <View style={styles.validationContainer}>
                  <MaterialIcons name={locationValidation.isAvailable ? "check-circle" : "error"} size={16} color={locationValidation.isAvailable ? "#4CAF50" : "#F44336"} />
                  <Text style={[styles.validationText, { color: locationValidation.isAvailable ? "#4CAF50" : "#F44336" }]}>
                    {locationValidation.isAvailable ? `Service available (${locationValidation.distance.toFixed(1)} km from ${locationValidation.nearestLocation.location_name})` : `Service not available (${locationValidation.distance.toFixed(1)} km from ${locationValidation.nearestLocation?.location_name || 'nearest area'})`}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity style={[styles.addButton, (isSaving || (locationValidation && !locationValidation.isAvailable) || !address) && styles.addButtonDisabled]} onPress={() => setModalVisible(true)} disabled={isSaving || (locationValidation && !locationValidation.isAvailable) || !address}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Add More Details</Text>}
          </TouchableOpacity>
        </View>
      )}
      
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{flex: 1}}
        >
            <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
                <Pressable style={styles.modalContentContainer}>
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <View style={styles.modalContent}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 16 }}>
                                <View style={{ width: '80%' }}><Text style={styles.modalTitle} numberOfLines={1}>{city || 'Location'}</Text><Text style={styles.modalSubtitle} numberOfLines={2}>{address || 'Loading address...'}</Text></View>
                                <TouchableOpacity onPress={toggleModal} style={{ padding: 10 }}><AntDesign name="close" size={20} color="#666" /></TouchableOpacity>
                            </View>
                            <View style={styles.typeButtons}>
                                <FlatList
                                    data={['Home', 'Office', 'Work', 'Other']}
                                    keyExtractor={item => item}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 12 }}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={[styles.typeButton, selectedType === item && styles.selectedTypeButton]} onPress={() => setSelectedType(item)}>
                                        <Text style={[styles.typeButtonText, selectedType === item && styles.selectedTypeButtonText]}>{item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                                <View><Text style={styles.label}>Name <Text style={styles.requiredAsterisk}>*</Text></Text></View>
                                <View style={[styles.inputContainer, inputErrors.name && { borderColor: 'red' }]}><TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} /></View>
                                <View><Text style={styles.label}>Contact number <Text style={styles.requiredAsterisk}>*</Text></Text></View>
                                <View style={[styles.inputContainer, inputErrors.contact && { borderColor: 'red' }]}><TextInput placeholder="Contact Number" style={styles.input} value={contact} onChangeText={setContact} keyboardType="phone-pad" maxLength={10} /></View>
                                <View><Text style={styles.label}>Door no/Flat no/Building <Text style={styles.requiredAsterisk}>*</Text></Text></View>
                                <View style={[styles.inputContainer, inputErrors.doorNo && { borderColor: 'red' }]}><TextInput placeholder="Enter address" style={styles.input} value={doorNo} onChangeText={setDoorNo} /></View>
                                <View><Text style={styles.label}>Pincode <Text style={styles.requiredAsterisk}>*</Text></Text></View>
                                <View style={[styles.inputContainer, inputErrors.pincode && { borderColor: 'red' }]}><TextInput placeholder="Enter pincode" style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="number-pad" maxLength={6} /></View>
                                <View><Text style={styles.label}>Nearby Landmark <Text style={styles.requiredAsterisk}>*</Text></Text></View>
                                <View style={[styles.inputContainer, inputErrors.landmark && { borderColor: 'red' }]}><TextInput placeholder="Enter landmark" style={styles.input} value={landmark} onChangeText={setLandmark} /></View>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Save Address</Text></TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <CustomModal visible={customModal.visible} title={customModal.title} message={customModal.message} onConfirm={() => { if (customModal.onConfirm) customModal.onConfirm(); hideCustomModal(); }} onCancel={() => { if (customModal.onCancel) customModal.onCancel(); hideCustomModal(); }} confirmText={customModal.confirmText} cancelText={customModal.cancelText} />
      <CustomModal visible={!areaAvailable} title={"Location is not available"} message={"The selected location is not available for delivery."} onConfirm={() => setAreaAvailable(true)} confirmText={"Okay"} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { backgroundColor: colors.maintheme, height: responsiveHeight(15), flexDirection: 'row', alignItems: 'flex-end', paddingBottom: responsiveHeight(3), paddingLeft: responsiveWidth(5), gap: responsiveWidth(3) },
    backButton: { width: responsiveWidth(7) },
    title: { fontSize: 16, fontWeight: '600', color: colors.white },
    mapContainer: { flex: 1, position: 'relative' },
    map: { flex: 1 },
    markerOverlay: { position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center', justifyContent: 'center', marginTop: -60 },
    markerContainer: { alignItems: 'center' },
    markerTextContainer: { backgroundColor: colors.maintheme, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 4, elevation: 5 },
    markerText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    searchContainer: { position: 'absolute', top: responsiveHeight(17), left: 0, right: 0, zIndex: 2, paddingHorizontal: responsiveWidth(5) },
    searchInputContainer: { backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: responsiveWidth(3), elevation: 4 },
    searchIcon: { marginRight: responsiveWidth(2) },
    searchInput: { flex: 1, paddingVertical: Platform.OS === 'ios' ? responsiveHeight(2) : responsiveHeight(1.5), fontSize: 14, color: '#000' },
    searchResultsContainer: { backgroundColor: '#fff', borderRadius: 8, marginTop: 8, maxHeight: responsiveHeight(30), elevation: 4, zIndex: 3 },
    bottomContainer: { backgroundColor: '#fff', padding: responsiveWidth(5), borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 4, zIndex: 1 },
    locationInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: responsiveHeight(2) },
    locationIcon: { marginRight: responsiveWidth(3), marginTop: 2 },
    locationDetails: { flex: 1 },
    locationTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
    locationSubtitle: { fontSize: 14, color: '#666', lineHeight: 20 },
    currentLocationButton: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, elevation: 4 },
    currentLocationButtonLoading: { opacity: 0.7 },
    currentLocationText: { color: '#333', fontSize: 14, fontWeight: '600', marginLeft: 8 },
    addButton: { backgroundColor: colors.maintheme, borderRadius: 8, paddingVertical: responsiveHeight(1.8), alignItems: 'center', justifyContent: 'center' },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContentContainer: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%' },
    modalContent: { },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    modalSubtitle: { fontSize: 13, color: '#666', marginTop: 4 },
    typeButtons: { marginBottom: 20 },
    typeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginHorizontal: 4 },
    selectedTypeButton: { backgroundColor: colors.maintheme, borderColor: colors.maintheme },
    typeButtonText: { color: '#333', fontWeight: '500', fontSize: 14 },
    selectedTypeButtonText: { color: '#fff' },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: "#525252" },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#f9f9f9' },
    input: { color: '#000', fontWeight: '500', flex: 1, paddingVertical: Platform.OS === 'ios' ? 12 : 8 },
    clearButton: { paddingLeft: 10 },
    saveButton: { backgroundColor: colors.maintheme, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    saveButtonText: { color: '#fff', fontSize:16, fontWeight: '600' },
    searchResultItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    searchResultText: { marginLeft: 12, flex: 1 },
    searchResultMain: { fontSize: 14, color: '#333', fontWeight: '500' },
    searchResultSecondary: { fontSize: 12, color: '#777', marginTop: 2 },
    requiredAsterisk: { color: 'red', marginLeft: 2 },
    validationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    validationText: { fontSize: 12, marginLeft: 5, fontWeight: '500' },
    addButtonDisabled: { backgroundColor: '#ccc' },
    noResultsText: { textAlign: 'center', padding: 20, color: '#666' },
});

export default AddAddressScreen;