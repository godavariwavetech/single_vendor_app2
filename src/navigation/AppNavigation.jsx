import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import RentalNavigation from './RentalNavigation';
import Login from '../screens/daddy/Login';
import Register from '../screens/daddy/Register';
import OTPVerification from '../screens/daddy/OTPVerification';
import ServiceLocationsScreen from '../screens/daddy/ServiceLocationsScreen';
import OnboardingScreen from '../screens/daddy/OnboardingScreen';
import ServicesAvailableScreen from '../screens/daddy/ServicesAvailableScreen';
import ServiceUnavailableScreen from '../screens/daddy/ServiceUnavailableScreen';
import SplashScreen from '../screens/user/SplashScreen';
const Stack = createStackNavigator();

const AuthNavigation = () => {
  const {isLogged} = useSelector(state => state.Auth);
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={'Splashscreen'}>
         <Stack.Screen name="Splashscreen" component={SplashScreen}  />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} />
      <Stack.Screen
        name="ServiceLocations"
        component={ServiceLocationsScreen}
      />
      <Stack.Screen
        name="ServicesAvailable"
        component={ServicesAvailableScreen}
      />
      <Stack.Screen
        name="ServiceUnavailable"
        component={ServiceUnavailableScreen}
      />
    </Stack.Navigator>
  );
};

const MainNavigation = ({userRole}) => {
  console.log('CALLING MAIN NAVIGATION');
  {
    switch (userRole) {
      case 2:
        return <RentalNavigation />;
      default:
        return <></>;
    }
  }
};

const AppNavigation = () => {
  const {token, userRole} = useSelector(state => state.Auth);
  return token ? <MainNavigation userRole={2} /> : <AuthNavigation />;
};

export default AppNavigation;
