// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   ImageBackground,
//   TextInput,
//   TouchableOpacity,
//   Pressable,
//   Keyboard,
// } from 'react-native';
// import React, {useState} from 'react';
// import {
//   responsiveHeight,
//   responsiveWidth,
// } from 'react-native-responsive-dimensions';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import GoogleIcon from '../user/svgs/GoogleIcon';
// import { verifyCustomerMobile } from '../../redux/reducers/auth';
// import { useDispatch } from 'react-redux';

// export default function Login({navigation}) {
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const dispatch = useDispatch();
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [errors, setErrors] = useState({
//     phoneNumber: '',
//     password: '',
//   });

//   const validateForm = () => {
//     let newErrors = {
//       phoneNumber: '',
//       password: '',
//     };
//     let isValid = true;

//     // Phone number validation
//     if (!phoneNumber) {
//       newErrors.phoneNumber = 'Phone number is required';
//       isValid = false;
//     } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
//       newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
//       isValid = false;
//     }

//     // Password validation
//     if (!password) {
//       newErrors.password = 'Password is required';
//       isValid = false;
//     } else if (password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleLogin =async () => {
//     if (validateForm()) {
//       const response = await dispatch(verifyCustomerMobile({customer_mobile_number: phoneNumber}));
//       if(response.payload.data){
//         navigation.navigate("OTPVerification");
//       }
//     }
//   };

//   return (
//     <Pressable style={{flex:1}} onPress={()=>Keyboard.dismiss()} >
//     <View style={styles.main}>
//      <StatusBar backgroundColor={"transparent"} translucent />
//       <ImageBackground
//         source={require('./tabassets/authbg.png')}
//         resizeMode="stretch"
//         style={{
//           width: responsiveWidth(100),
//           height: responsiveHeight(30),
//           backgroundColor: '#065E2C',
//            justifyContent:"flex-end"
//         }}>
//         <Text
//           style={{
//             color: '#FFF',
//             fontSize: 32,
//             fontWeight: '700',
//             botttom: 0,
//             marginBottom: responsiveHeight(8),
//             marginLeft: responsiveWidth(10),
//           }}>
//           Log In
//         </Text>
//       </ImageBackground>
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: '#fff',
//           transform: [{translateY: -responsiveHeight(4.5)}],
//           borderTopLeftRadius: 24,
//           borderTopRightRadius: 24,
//           // justifyContent: 'space-evenly',
//           paddingHorizontal: responsiveWidth(5),
//         }}>
//         <View style={{marginTop: responsiveHeight(5),marginBottom:responsiveHeight(2)}}>
//           <Text style={styles.label}>Phone Number</Text>
//           <TextInput
//             style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
//             placeholder="Enter Phone Number"
//             placeholderTextColor={'#3D3D3D'}
//             keyboardType="phone-pad"
//             value={phoneNumber}
//             onChangeText={(text) => {
//               setPhoneNumber(text);
//               setErrors(prev => ({...prev, phoneNumber: ''}));
//             }}
//             maxLength={10}
//           />
//           {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
//         </View>

//         <View style={{marginBottom:responsiveHeight(2)}}>
//           <Text style={styles.label}>Password</Text>
//           <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
//             <TextInput
//               style={styles.passwordInput}
//               placeholder="Enter Password"
//               placeholderTextColor={'#3D3D3D'}
//               secureTextEntry={!passwordVisible}
//               value={password}
//               onChangeText={(text) => {
//                 setPassword(text);
//                 setErrors(prev => ({...prev, password: ''}));
//               }}
//             />
//             <TouchableOpacity
//               onPress={() => setPasswordVisible(!passwordVisible)}
//               style={styles.icon}>
//               <Icon
//                 name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
//                 size={20}
//                 color="gray"
//               />
//             </TouchableOpacity>
//           </View>
//           {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
//         </View>

//         <View style={styles.rememberContainer}>
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'flex-start',
//             }}>
//             <TouchableOpacity 
//               style={[styles.checkbox, rememberMe && styles.checkedBox]} 
//               onPress={() => setRememberMe(!rememberMe)}
//             >
//               {rememberMe && (
//                 <Icon name="check" size={16} color="#065E2C" />
//               )}
//             </TouchableOpacity>
//             <Text style={styles.rememberText}>Remember me</Text>
//           </View>
//           <TouchableOpacity>
//             <Text style={styles.forgotPassword}>Forgot Password</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
//           <Text style={styles.loginText}>Log In</Text>
//         </TouchableOpacity>

//             <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center",marginBottom:10}}>

//         <Text style={styles.signupText}>
//           Don't have an account?
//         </Text>
//         <TouchableOpacity style={{alignSelf:"flex-start"}} onPress={()=>navigation.navigate("Register")}> 
//           <Text style={styles.signupLink}> SIGN UP</Text>
//          </TouchableOpacity>
//             </View>


//         <Text style={styles.orText}>Or</Text>

//         <View style={styles.socialContainer}>
//           <TouchableOpacity style={styles.socialButton}>
//             <FontAwesome name="facebook" size={22} color="white" />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.socialButton, {backgroundColor: '#EDEDED'}]}>
//             <GoogleIcon />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.socialButton, {backgroundColor: '#1B1F2F'}]}>
//             <FontAwesome name="apple" size={22} color="white" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//     </Pressable>

//   );
// }

// const styles = StyleSheet.create({
//   main: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   label: {
//     fontSize: 17,
//     fontWeight: '500',
//     marginBottom: 5,
//   },
//   input: {
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#666',
//     color: '#000',
//     fontWeight: 'condensed',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#666',
//     marginBottom: 4,
//   },
//   passwordInput: {
//     flex: 1,
//     color: '#000',
//   },
//   icon: {
//     paddingHorizontal: 10,
//   },
//   rememberContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     // marginVertical: 10,
//   },
//   checkbox: {
//     width: 18,
//     height: 18,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 3,
//     marginRight: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkedBox: {
//     backgroundColor: '#fff',
//     borderColor: '#065E2C',
//   },
//   rememberText: {
//     fontSize: 13,
//     color: '#7E8A97',
//     fontWeight: '400',
//   },
//   forgotPassword: {
//     // marginLeft: "auto",
//     fontSize: 14,
//     color: '#065E2C',
//     fontWeight: '400',
//   },
//   loginButton: {
//     backgroundColor: '#065E2C',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginVertical:responsiveHeight(2)
//   },
//   loginText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   signupText: {
//     textAlign: 'center',
//     fontSize: 14,
//     color: '#646982',
//     fontWeight: '400',
//     textAlign:"left"
//   },
//   signupLink: {
//     color: '#065E2C',
//     fontWeight: 'bold',
//     fontSize: 14,
//     textAlign:"left"
//   },
//   orText: {
//     textAlign: 'center',
//     // marginVertical: 10,
//     fontSize: 16,
//     color: '#646982',
//   },
//   socialContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//   },
//   socialButton: {
//     backgroundColor: '#395998',
//     width: 62,
//     height: 62,
//     // padding: 12,
//     borderRadius: 50,
//     marginHorizontal: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   inputError: {
//     borderColor: '#FF0000',
//   },
//   errorText: {
//     color: '#FF0000',
//     fontSize: 12,
//     marginTop: 2,
//     marginLeft: 4,
//   },
// });


import { View, Text } from 'react-native'
import React from 'react'

export default function Login() {
  return (
    <View>
      <Text>Login</Text>
    </View>
  )
}