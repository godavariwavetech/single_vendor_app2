import React, { useEffect, useState } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import AppNavigation from './src/navigation/AppNavigation';
import SplashScreen from 'react-native-splash-screen'
import { getFCMToken } from './src/services/NotificationsService';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { requestNotificationPermission, setupNotificationHandlers } from './src/services/NotificationsService';
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { checkNotifications, requestNotifications } from 'react-native-permissions';
import VersionCheck from 'react-native-version-check'; 
import CustomAlert from './src/components/CustomAlert';
import CustomModal from './src/components/CustomModal';

const App = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

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


  const checkForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate();
      if (res.isNeeded) {
        console.log("first")
        setShowUpdateModal(true);
      }else{
        console.log("second")
        setShowUpdateModal(false);
      }
    } catch (error) {
      console.log("Error checking for updates:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await Linking.openURL("https://play.google.com/store/apps/details?id=com.localdaddy");
    } catch (error) {
      console.log("Play Store link error:", error);
    } finally {
      setShowUpdateModal(false);
    }
  };

  console.log(showUpdateModal,"+++++++++++++++++showUpdateModal")

  useEffect(() => {
    checkForUpdate();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigation />

        <CustomModal
        visible={showUpdateModal}
       title="Update Available"
       message="A new version of the app is available. Please update to continue using all features."
       confirmText="Update Now"
       onConfirm={handleUpdate}
      //  showCancel={false}
       cancelText=''
      />
        
        {/* <CustomAlert
          visible={showUpdateModal}
          title="Update Available"
          message="A new version of the app is available. Please update to continue using all features."
          confirmText="Update Now"
          onConfirm={handleUpdate}
          showCancel={false}
        /> */}
      </NavigationContainer>
    </Provider>
  );
};

export default App;
