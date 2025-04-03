import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import AppNavigation from './src/navigation/AppNavigation';
import SplashScreen from 'react-native-splash-screen'
import { getFCMToken } from './src/services/NotificationsService';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { requestNotificationPermission, setupNotificationHandlers } from './src/services/NotificationsService';
import { PermissionsAndroid, Platform } from 'react-native';
import { checkNotifications, requestNotifications } from 'react-native-permissions';

const App = () => {

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted');
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        // For iOS
        const { status } = await checkNotifications();
        if (status !== 'granted') {
          const { status: newStatus } = await requestNotifications(['alert', 'sound']);
          console.log('Notification permission status:', newStatus);
        }
      }
    };

    checkAndRequestPermissions();
  }, []);

  const getToken = async () => { 
    await getFCMToken()
  }

  useEffect(()=>{
    SplashScreen.hide();
    getToken()
  },[])
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigation />
      </NavigationContainer>
    </Provider>
  );
};

export default App;
