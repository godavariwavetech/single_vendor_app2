import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  Alert,
  PanResponder,
} from 'react-native';
import { responsiveFontSize, responsiveHeight } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useDispatch } from 'react-redux';
import { setLocation } from '../../redux/reducers/auth'; // Update with your actual path
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('./tabassets/onBoard1.png'),
    title: 'Buy Groceries Easily\nwith Us',
    description: 'It is a long established fact that a reader\nwill be distracted by the readable.',
  },
  {
    id: 2,
    image: require('./tabassets/onBoard2.png'),
    title: 'Buy Groceries Easily\nwith Us',
    description: 'It is a long established fact that a reader\nwill be distracted by the readable.',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  const dispatch = useDispatch();

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await check(permission);

      if (result === RESULTS.GRANTED) {
        getLocation();
      } else {
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          getLocation();
        } else {
        //  console
        }
      }
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log(latitude,longitude)
        dispatch(setLocation({ latitude, longitude }));
      },
      error => {
        console.warn(error);
        Alert.alert('Error', 'Unable to fetch location.');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(prev => {
        const newIndex = prev + 1;
        currentIndexRef.current = newIndex;
        return newIndex;
      });
    } else {
      navigation.replace('Register');
    }
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, gestureState) => {
        const { dx } = gestureState;
        const latestIndex = currentIndexRef.current;
        console.log("Current index:", latestIndex);
        
        if (Math.abs(dx) > 50) {
          if (dx > 50) { // Right swipe
            if (latestIndex > 0) {
              setCurrentIndex(prev => {
                const newIndex = prev - 1;
                currentIndexRef.current = newIndex;
                return newIndex;
              });
            }
          } else { // Left swipe
            if (latestIndex < onboardingData.length - 1) {
              setCurrentIndex(prev => {
                const newIndex = prev + 1;
                currentIndexRef.current = newIndex;
                return newIndex;
              });
            } else {
              navigation.replace('Register');
            }
          }
        }
      }
    })
  ).current;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View 
      style={styles.container}
      {...panResponder.panHandlers}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => navigation.replace('Register')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <View style={styles.contentContainer}>
        <Image
         source={onboardingData[currentIndex]?.image}
          style={[styles.image,{marginBottom:responsiveHeight(currentIndex===0? 13 :17)}]}
          resizeMode="contain"
        />

        <ImageBackground
        source={require('./tabassets/onboardngView.png')}
        style={[styles.image,{alignItems:"center",justifyContent:"center",alignSelf:"center"},{position:"absolute",bottom:responsiveHeight(0)}]}
        resizeMode="contain"
        >
 <Text style={styles.title}>
            {onboardingData[currentIndex]?.title}  
          </Text>
          <Text style={styles.description}>
            {onboardingData[currentIndex]?.description}
          </Text>
          <TouchableOpacity 
            style={[styles.nextButton,{}]}
            onPress={handleNext}
          >
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </ImageBackground>
      </View>
{/*       
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => (
          <View 
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.activeDot
            ]}
          />
        ))}
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#065E2C20',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  skipText: {
    fontSize: 16,
    color: '#065E2C',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 20,
  },
  title: {
    fontSize: responsiveFontSize(2.8),
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  description: {
    fontSize: responsiveFontSize(2,2),
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#065E2C',
    alignItems: 'center',
    justifyContent: 'center',
    bottom:responsiveHeight(6),
    position: 'absolute',
  },
  pagination: {
    position: 'absolute',
    bottom: responsiveHeight(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#065E2C',
  },
});

export default OnboardingScreen;