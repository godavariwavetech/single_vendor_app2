import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BiryaniCategory from './tabassets/BiryaniCategory';
import HeaderPick1 from './tabassets/HeaderPick1';
import HeaderPick2 from './tabassets/HeaderPick2';
import HeaderPick3 from './tabassets/HeaderPick3';
import Seller from './tabassets/Seller';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import Entypo from "react-native-vector-icons/Entypo"
import { useDispatch, useSelector } from 'react-redux';
import { getRestaurants } from '../../redux/reducers/daddy';
import { useFocusEffect } from '@react-navigation/native';

const restaurants = [
  {
    id: '1',
    name: 'Vantalakka Biriyani',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_cR_lCMXmgj2I9k807VNZxLN4xLmUFknXZA&s', // Replace with real image URL
    rating: '4.5 (26k+)',
    time: '20-30 mins',
    type: 'Street Food, Shake, Beverages',
    location: 'Tilak Road • 3.0 km',
    offer: '',
  },
  {
    id: '2',
    name: 'Naidu Gari Kunda Biryani',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh4heBKn8mMJz00VVuP1hl2Qd7IVegxGisJw&s',
    rating: '4.5 (26k+)',
    time: '20-30 mins',
    type: 'Fried Rice, Chinese, Italian',
    location: 'Tilak Road • 3.0 km',
    offer: 'EXTRA 10% off & FREE DELIVERY',
  },
  {
    id: '3',
    name: 'Helapuri Restaurant-Diamond ...',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7XSuh-M_6J74T6jsGBGGwfPrIIoMPe-cFaw&s',
    rating: '4.5 (26k+)',
    time: '20-30 mins',
    type: 'North Indian, Chinese, Biry...',
    location: 'Tilak Road • 3.0 km',
    offer: '',
  },
  {
    id: '4',
    name: 'Real Deepa Punjabi Dhaba',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFP_eRBTJIPb2PdOV89xZy6A_3nEGTIIFn2w&s',
    rating: '4.5 (26k+)',
    time: '20-30 mins',
    type: 'North Indian, South Indian...',
    location: 'Tilak Road • 3.0 km',
    offer: 'EXTRA 10% off & FREE DELIVERY',
  },
  {
    id: '5',
    name: 'Helapuri Restaurant-Diamond ...',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7XSuh-M_6J74T6jsGBGGwfPrIIoMPe-cFaw&s',
    rating: '4.5 (26k+)',
    time: '20-30 mins',
    type: 'North Indian, Chinese, Biry...',
    location: 'Tilak Road • 3.0 km',
    offer: '',
  },
  {
    id: '6',
    name: 'Real Deepa Punjabi Dhaba',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFP_eRBTJIPb2PdOV89xZy6A_3nEGTIIFn2w&s',
    rating: '4.5 (26k+)',
    time: '20-30 mins',
    type: 'North Indian, South Indian...',
    location: 'Tilak Road • 3.0 km',
    offer: 'EXTRA 10% off & FREE DELIVERY',
  },
];

const headerBar = [
  {
    id: 1,
    name: 'Filter',
    icon: HeaderPick1,
  },
  {
    id: 2,
    name: 'Veg',
    icon: HeaderPick2,
  },
  {
    id: 3,
    name: 'Non-Veg',
    icon: HeaderPick2,
  },
  {
    id: 4,
    name: 'Best Seller',
    icon: Seller,
  },
  {
    id: 5,
    name: '+Rating',
    icon: HeaderPick3,
  },
];

export default function CategorieItems({navigation,route}) {
  const dispatch = useDispatch()
  const {restaurants,activeCategoryIndex,activeSubCategory} = useSelector(state=>state.Dashboard)
  const [filterData,setFilterData] = useState([]);
  const [activeFilter,setActiveFilter] = useState(0)
  const [isLoading, setIsLoading] = useState(true);

  const handleFilter = (selsected) =>{
      setActiveFilter(selsected.filter_id)
  }

  const getFilters = async () =>{
    try {
      setIsLoading(true);
      const getResponse = await dispatch(getRestaurants({categoryId:activeCategoryIndex,subCatergoryId:activeSubCategory.sub_category_id}))
      setFilterData(getResponse.payload.data[1])
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(useCallback(()=>{
    getFilters()
  },[activeSubCategory]))

  useEffect(()=>{
    if(activeSubCategory) {
      getFilters()
    }
  },[activeSubCategory])

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#065E2C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (!restaurants || restaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data found</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={restaurants}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          return (
            <TouchableOpacity onPress={()=>navigation.navigate("RestaurantScreen",{shopId:item.shop_id,shopItem:item.shop_items_tb_nm,item})} >
              <View style={styles.card}>
                <View>
                  <Image source={{uri: item.shop_image}} style={styles.image} />

                  {/* <TouchableOpacity
                    style={styles.heartButton}>
                    <EvilIcons name="heart" color={'#EC0000'} size={10} />
                  </TouchableOpacity> */}
                </View>
                <View style={styles.details}>
                  <Text style={styles.name}>{item.shop_name}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialCommunityIcons name="star-circle" color="#07772F" />
                    <Text style={styles.rating}> {item.shop_rating}</Text>
                    <Text style={styles.rating}>
                      {'\u25CF'} {item.time}
                    </Text>
                  </View>
                  <Text style={styles.location}>{item.shop_address}</Text>
                  {item.special_offer_name !== '' && (
                    <View style={styles.offerContainer}>
                      <Text style={styles.offer}>{item.special_offer_name}</Text>
                    </View>
                  )}
                </View>
                {/* <TouchableOpacity style={styles.moreButton}>
                  <Entypo name="dots-three-vertical" color="#313131" size={7} />
                </TouchableOpacity> */}
              </View>

              <View style={styles.dottedLineContainer}>
                {Array(20)
                  .fill(0)
                  .map((_, index) => (
                    <View key={index} style={styles.dot} />
                  ))}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <View style={styles.main}>
      <StatusBar backgroundColor={"transparent"} translucent barStyle={"light-content"} />
      <LinearGradient
        colors={['#FFCC00', '#F7F2F2']}
        style={styles.gradientContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={()=>navigation.goBack()}>
              <Feather
                name="arrow-left"
                color={'#000'}
                size={20}
                style={styles.backButton}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {activeSubCategory?.sub_category_name}
            </Text>
            {/* <Text style={styles.headerSubtitle}>
              Where Briyani fall in love!
            </Text> */}
          </View>
          <Image 
            source={{uri:activeSubCategory?.sub_category_image}} 
            resizeMode='contain' 
            style={styles.headerImage} 
          />
        </View>
      </LinearGradient>
{/* 
      <View>
        <FlatList
          data={filterData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.filter_id}
          style={styles.filterList}
          renderItem={({item,index}) => {
            return (
              <TouchableOpacity
                onPress={()=>navigation.navigate("RestaurantScreen",{shopId:item.shop_id,shopItem:item.shop_items_tb_nm,item})}
                style={styles.filterButton}>
                <HeaderPick2 color={item.filter_name==="Veg"?"#0EAF50":"#CD2A2A"} />
                <Text style={styles.filterText}>
                  {item.filter_name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View> */}

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradientContainer: {
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    paddingLeft: 20,
  },
  backButton: {
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D3D3D',
  },
  headerImage: {
    width: 191,
    height: 131,
  },
  filterList: {
    marginTop: 5,
    paddingHorizontal: 15,
  },
  filterButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#8F8F8F',
    borderRadius: 6,
    marginHorizontal: 3,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filterText: {
    color: '#313131',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    width: responsiveWidth(100),
    height: responsiveHeight(50),
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#065E2C",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    width: responsiveWidth(100),
    height: responsiveHeight(50),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "700",
    fontSize: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1),
    marginVertical: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  heartButton: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    right: 5,
    top: 5,
  },
  details: {
    marginLeft: 10,
    width: responsiveWidth(55),
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#313131',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 3,
  },
  rating: {
    fontSize: 14,
    color: '#050505',
    fontWeight: '500',
  },
  location: {
    fontSize: 12,
    color: '#828282',
    fontWeight: '500',
  },
  offerContainer: {
    backgroundColor: '#ECFFF3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    borderRadius: 5,
    marginTop: 5,
  },
  offer: {
    color: '#07772F',
    fontSize: 10,
    fontWeight: '700',
  },
  moreButton: {
    width: 20,
    height: 20,
    borderRadius: 19,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  dottedLineContainer: {
    flexDirection: 'row',
    marginTop: 5,
    alignSelf: 'center',
  },
  dot: {
    width: 7,
    height: 2,
    backgroundColor: '#D8D8D8',
    borderRadius: 5,
    marginHorizontal: 5,
  },
});
