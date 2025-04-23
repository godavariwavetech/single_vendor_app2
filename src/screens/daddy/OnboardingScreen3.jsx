
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView ,StatusBar} from 'react-native';
import  AntDesign  from 'react-native-vector-icons/AntDesign'; 
import  Ionicons  from 'react-native-vector-icons/Ionicons';
import commonStyles from '../../commonstyles/CommonStyles';
import OnboardingLogo from './svg/OnboardingLogo';
import { useNavigation } from '@react-navigation/native';
import { responsiveHeight ,responsiveWidth } from 'react-native-responsive-dimensions';
import OnboardingLogo1 from './tabassets/OnboardingLogo1';
import OnboardingLogo2 from './tabassets/OnboardingLogo2';

const OnboardingScreen3 = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
       <StatusBar barStyle="dark-content" backgroundColor={commonStyles.bgColor} />
      {/* <TouchableOpacity style={styles.skipButton} onPress={() =>navigation.replace('OnboardingScreen2')}>
        <Text style={styles.skipText}>Skip</Text>
        <Ionicons name="arrow-forward-circle" size={24} color="#FF9800" />
      </TouchableOpacity> */}

      {/* <View style={{alignItems:"center",justifyContent:"center",flex:1}}> */}
      <View style={styles.imgContainer}>
        
      </View>
      <Image source={require('../daddy/svg/deliveryBoy.png')} style={styles.image} resizeMode='contain'/>
      {/* <Image
        source={require('./tabassets/onBoard1.png')} // Replace with your actual image
        style={styles.image}
        resizeMode="contain"
      /> */}
      {/* <View style={styles.imgContainer}>
        <OnboardingLogo2 />
      </View> */}
     

      <View style={styles.textContainer}>
        <Text style={styles.title}>Buy Groceries Easily with Us</Text>
        <Text style={styles.description}>
          It is a long established fact that a reader will be distracted by the readable.
        </Text>

        {/* Pagination dots */}
        {/* <View style={styles.pagination}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View> */}

        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.replace('Register')}> 
          <AntDesign name="arrowright" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* </View> */}
    </SafeAreaView>
  );
};

export default OnboardingScreen3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: commonStyles.bgColor,
    alignItems: 'center',justifyContent:'center'
    // paddingTop: 20,
  },
  image: {
    width: 270,height:405
    // height: 300,
    // marginTop: 100,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  imgContainer:{
    // marginTop: responsiveHeight(4),
    justifyContent: 'center',
    alignItems: 'center'
  },
  textContainer: {
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    // paddingHorizontal: 20,
    width:'82%',
    borderWidth:0.3,
    borderColor:commonStyles.btn2Color,
    paddingHorizontal:responsiveWidth(4),
    paddingVertical:responsiveHeight(2),
    // borderRadius:40
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    borderBottomLeftRadius:50,
    // borderBottomRightRadius:100
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    // color:'#101811'
    color:commonStyles.btn2Color
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#101811',
    marginBottom: 20,
    fontWeight:'400'
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: commonStyles.arrowBtnColor,
    padding: 16,
    borderRadius: 50,
    marginTop:responsiveHeight(0.3),
    // width:58,height:58,
    // alignItems:'center',justifyContent:'center',
  },
});
