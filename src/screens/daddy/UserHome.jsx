import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Octicons from 'react-native-vector-icons/Octicons';
import {
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import ReviewStar from './tabassets/ReviewStar';
import DeliveryVehicle from './tabassets/DeliveryVehicle';
import Clock from './tabassets/Clock';
import {Shadow} from 'react-native-shadow-2';
import ShopSection from './builder/ShopSection';
import {useDispatch, useSelector} from 'react-redux';
import {
  getBanners,
  getCategories,
  getRestaurants,
  getSubCategories,
  setActiveCategoryIndex,
  setsubCategory,
  getAddressList,
  setAddressList,
  updateUserAddress,
  checkServiceAvailability,
  checkAddressExistence,
} from '../../redux/reducers/daddy';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { setLocation, setLocationId, setLocationName, setOrderOfferAmount } from '../../redux/reducers/auth';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import ServiceUnavailableScreen from './ServiceUnavailableScreen';
// import {GOOGLE_MAPS_API_KEY} from '@env';

export default function UserHome({navigation}) {
  const {categories, subCategories, banners, restaurants, activeCategoryIndex, loading, addressList,userAddress, serviceAvailable} =
    useSelector(state => state.Dashboard);
    const {customerId,locationName,orderOfferAmount} =
    useSelector(state => state.Auth);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const authLocation = useSelector(state => state.Auth.location);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(true);
  const isFocused = useIsFocused();

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${"YOUR_GOOGLE_MAPS_API_KEY"}`,
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return 'Address not found';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Error getting address';
    }
  };

  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true);
    Geolocation.setRNConfiguration({
      enableHighAccuracy: false,
      timeout: 2000,
      maximumAge: 1000,
    });

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const address = await getAddressFromCoordinates(latitude, longitude);
        
        // Update both auth and address list
        dispatch(setLocation({ latitude, longitude }));
        
        const currentLocationAddress = {
          address_type: userAddress?.address_type || 'Home',
          full_address: address,
          customer_latitude: latitude.toString(),
          customer_longitude: longitude.toString(),
          name: userAddress?.name || '',
          contact: userAddress?.contact || '',
        };

        dispatch(updateUserAddress(currentLocationAddress));
        setSelectedAddress(currentLocationAddress);
        setIsLoadingLocation(false);
      },
      error => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 1000,
      }
    );
  }, [dispatch, userAddress]);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      getCurrentLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to provide delivery services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }, [getCurrentLocation]);

  const getCategoreis = async () => {
     dispatch(getCategories());
     dispatch(getSubCategories({categoryId: activeCategoryIndex}));
    dispatch(getBanners());
    if (!restaurants || restaurants.length === 0) {
      dispatch(getRestaurants({categoryId: activeCategoryIndex}));
    }
  };

  useEffect(() => {
    const initializeLocation = async () => {
      if (authLocation) {
        const address = await getAddressFromCoordinates(authLocation.latitude, authLocation.longitude);
        const currentAddress = {
          address_type:locationName ,
          full_address: address,
          customer_latitude: authLocation.latitude.toString(),
          customer_longitude: authLocation.longitude.toString(),
        };
        setSelectedAddress(currentAddress);
      } else if (userAddress) {
        setSelectedAddress(userAddress);
      } else {
        requestLocationPermission();
      }
    };
    
    initializeLocation();
  }, [userAddress, authLocation, requestLocationPermission]);

  useFocusEffect(
    useCallback(() => {
      dispatch(getAddressList());
    }, [activeCategoryIndex]),
  );

  useFocusEffect(
    useCallback(() => {
      const checkOnFocus = async () => {
        if (authLocation) {
          await checkServiceAvailability();
        }
      };
      checkOnFocus();
    }, [authLocation])
  );

  // useEffect(() => {
  //   const checkAvailability = async () => {
  //     if (selectedAddress) {
  //       const result = await dispatch(checkServiceAvailability({
  //         lat: selectedAddress.customer_latitude,
  //         lng: selectedAddress.customer_longitude
  //       }));
        
  //       if (!result.payload?.available) {
  //         navigation.navigate('ServiceUnavailable');
  //       }
  //     }
  //   };

  //   checkAvailability();
  // }, [selectedAddress, dispatch, navigation]);

  const handleSubCategories = category => {
    dispatch(setActiveCategoryIndex(category.id));
    dispatch(getSubCategories({categoryId: category.id}));
    dispatch(getRestaurants({categoryId: category.id}));
    dispatch(setOrderOfferAmount(category.order_offer_amount));
  };

  useFocusEffect(
    useCallback(() => {
      let intervalId;
      if (isFocused && banners?.length > 0) {
        intervalId = setInterval(() => {
          const newIndex = currentIndex < banners.length - 1 ? currentIndex + 1 : 0;
          flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
          setCurrentIndex(newIndex);
        }, 3000);
      }
      return () => {
        clearInterval(intervalId);
      };
    }, [currentIndex, banners, isFocused])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getCategoreis();
    setRefreshing(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants?.filter(restaurant =>
      restaurant.shop_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [restaurants, searchQuery]);

  const checkServiceAvailability = async () => {
    const abortController = new AbortController();
    
    const checkAvailability = async () => {
      if (!authLocation || !mounted) return;
      
      try {
        const response = await dispatch(checkAddressExistence({
          latitude: authLocation.latitude,
          longitude: authLocation.longitude
        })).unwrap();

        if (mounted) {
          await dispatch(setLocationName(response.data[0].location_name));
          await dispatch(setLocationId(response.data[0].id));
          if (response.data.length > 0) {
            // Load essential data after service check
            const result = await dispatch(getCategories());
            dispatch(setOrderOfferAmount(result.payload?.data[0]?.order_offer_amount));
            dispatch(getBanners());
            if (!restaurants || restaurants.length === 0) {
              dispatch(getRestaurants({categoryId: activeCategoryIndex}));
            }
            dispatch(getSubCategories({categoryId: activeCategoryIndex}));
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError' && mounted) {
          console.error('Service check failed:', error);
        }
      }
    };

    checkAvailability();
    return () => {
      abortController.abort();
      setMounted(false);
    };
  };

  useEffect(() => {
    if (authLocation) {
      checkServiceAvailability();
    }
  }, [authLocation,serviceAvailable]);

  // useFocusEffect(
  //   useCallback(() => {
  //     if (authLocation && serviceAvailable) {
  //       checkServiceAvailability();
  //     }
  //   }, [authLocation, serviceAvailable])
  // );

  // Update the combined loading state
  const isLoading = loading.addressCheck || isLoadingLocation || loading.categories || loading.banners || serviceAvailable === null;

  const calculateDeliveryTime = (distance) => {
    if (distance < 3) {
      return '15-20 mins';
    } else if (distance < 5) {
      return '20-30 mins';
    } else {
      return '30-45 mins';
    }
  };

  const updateRestaurantsData = async () => {
    setIsUpdating(true);
    // await dispatch(getRestaurants({ categoryId: activeCategoryIndex }));
    setIsUpdating(false);
  };

  useFocusEffect(
    useCallback(() => {
      updateRestaurantsData();
    }, [activeCategoryIndex])
  );

  const updateOrderOfferAmount =  (amount) => {
    dispatch(setOrderOfferAmount(amount));
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={'transparent'} translucent />
      {isLoading ? (
        <SkeletonPlaceholder>
          {/* Location Skeleton */}
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" padding={15}>
            <SkeletonPlaceholder.Item width={30} height={30} borderRadius={15} />
            <SkeletonPlaceholder.Item marginLeft={10}>
              <SkeletonPlaceholder.Item width={200} height={20} />
              <SkeletonPlaceholder.Item marginTop={6} width={150} height={16} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>

          {/* Search Bar Skeleton */}
          <SkeletonPlaceholder.Item 
            height={50} 
            borderRadius={8} 
            marginHorizontal={15}
            marginBottom={20}
          />

          {/* Banners Skeleton */}
          <SkeletonPlaceholder.Item
            height={120}
            borderRadius={8}
            marginHorizontal={15}
            marginBottom={20}
          />

          {/* Categories Skeleton */}
          <SkeletonPlaceholder.Item
            flexDirection="row"
            justifyContent="space-between"
            paddingHorizontal={15}
            marginBottom={20}
          >
            {[1,2,3,4].map((_, i) => (
              <SkeletonPlaceholder.Item
                key={i}
                width={70}
                height={70}
                borderRadius={35}
              />
            ))}
          </SkeletonPlaceholder.Item>

          {/* Restaurants Skeleton */}
          <SkeletonPlaceholder.Item paddingHorizontal={15}>
            {[1,2,3].map((_, i) => (
              <SkeletonPlaceholder.Item
                key={i}
                height={160}
                borderRadius={8}
                marginBottom={20}
              />
            ))}
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      ) : serviceAvailable ? (
        <>
          <LinearGradient colors={['#065E2C', '#F7F2F2']} style={styles.gradientContainer}>
            <View style={styles.headerContainer}>
              <View>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("SelectServiceFromLocation")} 
                  style={styles.locationContainer}
                >
                  <Octicons name="location" color="#fff" size={25} />
                  <View>
                    <Text style={styles.locationTitle}>
                      {isLoadingLocation ? 'Getting location...' : (selectedAddress?.address_type || 'Current Location')}
                    </Text>
                    <Text style={styles.locationAddress} numberOfLines={1}>
                      {isLoadingLocation ? 'Please wait...' : (selectedAddress?.full_address || 'Add your delivery address')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Support')} style={styles.supportButton}>
                <Icon name="support-agent" size={30} color="grey" />
              </TouchableOpacity>
            </View>

            {loading.addressCheck || isLoadingLocation  ? (
              <SkeletonPlaceholder borderRadius={4}>
                {/* Location Skeleton */}
                <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" padding={15}>
                  <SkeletonPlaceholder.Item width={30} height={30} borderRadius={15} />
                  <SkeletonPlaceholder.Item marginLeft={10}>
                    <SkeletonPlaceholder.Item width={200} height={20} />
                    <SkeletonPlaceholder.Item marginTop={6} width={150} height={16} />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>

                {/* Search Bar Skeleton */}
                <SkeletonPlaceholder.Item 
                  height={50} 
                  borderRadius={8} 
                  marginHorizontal={15}
                  marginBottom={20}
                />

                {/* Banners Skeleton */}
                <SkeletonPlaceholder.Item
                  height={120}
                  borderRadius={8}
                  marginHorizontal={15}
                  marginBottom={20}
                />

                {/* Categories Skeleton */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  justifyContent="space-between"
                  paddingHorizontal={15}
                  marginBottom={20}
                >
                  {[1,2,3,4].map((_, i) => (
                    <SkeletonPlaceholder.Item
                      key={i}
                      width={70}
                      height={70}
                      borderRadius={35}
                    />
                  ))}
                </SkeletonPlaceholder.Item>

                {/* Restaurants Skeleton */}
                <SkeletonPlaceholder.Item paddingHorizontal={15}>
                  {[1,2,3].map((_, i) => (
                    <SkeletonPlaceholder.Item
                      key={i}
                      height={160}
                      borderRadius={8}
                      marginBottom={20}
                    />
                  ))}
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            ) : (
              <>
                <View style={styles.searchContainer}>
                  <TextInput
                    placeholderTextColor={'#666666'}
                    placeholder="Search for your favorites"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  <Icon name="search" size={24} color="gray" />
                </View>

                { categories && (
                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    style={styles.categoriesList}
                    horizontal
                    key={item => item.id}
                    renderItem={({item}) => {
                      return item.id == activeCategoryIndex ? (
                        <LinearGradient
                          style={styles.activeItemTab}
                          colors={[
                            'rgba(255, 204, 0, 0.5)',
                            'rgba(255, 255, 255, 0.5)',
                          ]}>
                          <TouchableOpacity
                            style={styles.activeItemTab}
                            onPress={() => handleSubCategories(item)}>
                            <Image
                              source={{uri: item.category_image}}
                              resizeMode="contain"
                              style={styles.categoryImage}
                            />
                            <Text numberOfLines={1} style={styles.activeCategoryText}>
                              {item.category_name}
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      ) : (
                        <TouchableOpacity onPress={() => handleSubCategories(item)}>
                          <View style={styles.activeItemTab}>
                            <Image
                              source={{uri: item.category_image}}
                              resizeMode="contain"
                              style={styles.categoryImage}
                            />
                            <Text numberOfLines={1} style={styles.inactiveCategoryText}>
                              {item.category_name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </>
            )}
          </LinearGradient>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#065E2C']}
              />
            }
            style={styles.container}
          >
            <View>
              {loading.subCategories ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#065E2C" />
                </View>
              ) : (
                <FlatList
                  data={subCategories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                  renderItem={({item}) => (
                    <Shadow
                      distance={15}
                      offset={[15, 17]}
                      startColor="rgba(128, 128, 128, 0.07)"
                      style={styles.subCategoryShadow}>
                      <TouchableOpacity
                        onPress={() => {
                          dispatch(setsubCategory(item));
                          navigation.navigate('CategorieItems');
                        }}
                        style={styles.subCategoryButton}>
                        <Shadow
                          distance={15}
                          shadowOpacity={0.2}
                          offset={[0, 0]}
                          startColor="rgba(246, 195, 174, 0.3)">
                          <View style={styles.subCategoryImageContainer}>
                            <Image
                              source={{uri: item.sub_category_image}}
                              style={styles.subCategoryImage}
                            />
                          </View>
                        </Shadow>
                        <Text style={styles.categoryText}>
                          {item.sub_category_name}
                        </Text>
                      </TouchableOpacity>
                    </Shadow>
                  )}
                />
              )}
            </View>

            {loading.banners ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#065E2C" />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={banners}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <View style={styles.bannerContainer}>
                    <Image
                      source={{uri: item.banner_image}}
                      style={styles.bannerImage}
                    />
                  </View>
                )}
              />
            )}

            {activeCategoryIndex === 1 ? (
              <View>
                <Text style={styles.sectionTitle}>Restaurants Near You</Text>

                {/* {loading.restaurants ? (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#065E2C" />
                  </View>
                ) : 
                ( */}
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={filteredRestaurants}
                    keyExtractor={item => item.shop_id}
                    renderItem={({item}) => {
                      const distance = item.distance;
                      return (
                      <TouchableOpacity
                        style={styles.restaurantCard}
                        onPress={() =>
                          navigation.navigate('RestaurantScreen', {
                            shopId: item.shop_id,
                            shopItem: item.shop_items_tb_nm,
                            item,
                          })
                        }>
                        <Image
                          source={{uri: item.shop_image}}
                          style={styles.restaurantImage}
                        />
                        <View style={styles.restaurantInfo}>
                          <Text style={styles.restaurantName}>
                            {item.shop_name}
                          </Text>
                          <Text style={styles.restaurantType}>
                            {item.shop_address}
                          </Text>
                          <View style={styles.restaurantStats}>
                            <View style={styles.statItem}>
                              <ReviewStar />
                              <Text style={styles.statText}>{item.shop_rating}</Text>
                            </View>

                            <View style={styles.statItem}>
                              <DeliveryVehicle />
                              <Text style={styles.statText}>{distance < 3 ? 'Free' : 'Paid'}</Text>
                            </View>

                            <View style={styles.statItem}>
                              <Clock />
                              <Text style={styles.statText}>{calculateDeliveryTime(distance)}</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}}
                  />
                {/* )} */}
              </View>
            ) : (
              loading.restaurants ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#065E2C" />
                </View>
              ) : (
                <ShopSection shops={restaurants} />
              )
            )}
          </ScrollView>
        </>
      ) : (
        <ServiceUnavailableScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 85 : 60,
  },
  gradientContainer: {
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(3),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  locationAddress: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
    width: responsiveWidth(50),
  },
  supportButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 10,
    marginHorizontal: responsiveWidth(3),
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  categoriesList: {
    marginTop: 20,
  },
  activeItemTab: {
    width: responsiveWidth(25),
    height: 69,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 49,
    height: 48,
  },
  activeCategoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065E2C',
  },
  inactiveCategoryText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#525252',
  },
  subCategoryShadow: {
    marginHorizontal: 5,
    marginVertical: 10,
  },
  subCategoryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    paddingRight: 15,
    borderRadius: 50,
  },
  subCategoryImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#F6C3AE',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subCategoryImage: {
    width: 38,
    height: 38,
    borderRadius: 100,
  },
  bannerContainer: {
    width: responsiveWidth(100),
    alignItems: 'center',
    marginVertical: 10,
  },
  bannerImage: {
    width: responsiveWidth(90),
    height: 123,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 15,
    color: '#065E2C',
  },
  restaurantCard: {
    margin: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 137,
    borderRadius: 15,
  },
  restaurantInfo: {
    padding: 10,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '400',
    color: '#3D3D3D',
  },
  restaurantType: {
    color: '#7A7A7A',
    fontSize: 14,
    fontWeight: '400',
  },
  restaurantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  statText: {
    color: '#3D3D3D',
    fontSize: 14,
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  categoryText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
