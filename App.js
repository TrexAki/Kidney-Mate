import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ToastAndroid,
  BackHandler,
  FlatList,
  Image,
  Linking,
} from 'react-native';
import { auth } from './firebaseConfig';
import MedicationReminders from './MedicationReminders';
import FluidDietTracking from './FluidDietTracking';
import DialysisScheduling from './DialysisScheduling';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

import PhoneLoginScreen from './PhoneLoginScreen';  // <-- Import your phone login screen here
import AnimatedButton from './components/AnimatedButton';


// ---------------- Healthcare Schemes Screen ----------------
function HealthcareSchemes() {
  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  return (
    <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Government Healthcare Schemes for Dialysis Patients (India)</Text>

        <View style={styles.schemeCard}>
          <Text style={styles.schemeTitle}>1. Pradhan Mantri National Dialysis Programme (PMNDP)</Text>
          <Text style={styles.schemeText}>
            Free dialysis for Below Poverty Line (BPL) patients at government hospitals.
          </Text>
          <Text style={styles.linkText} onPress={() => openLink('https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=830&lid=220')}>
            Visit NHM Site
          </Text>
        </View>

        <View style={styles.schemeCard}>
          <Text style={styles.schemeTitle}>2. Ayushman Bharat – PMJAY</Text>
          <Text style={styles.schemeText}>
            Eligible patients get cashless dialysis at empanelled hospitals.
          </Text>
          <Text style={styles.linkText} onPress={() => openLink('https://pmjay.gov.in')}>
            Visit PMJAY Site
          </Text>
        </View>

        <View style={styles.schemeCard}>
          <Text style={styles.schemeTitle}>3. State-level Dialysis Schemes</Text>
          <Text style={styles.schemeText}>
            Many states like Maharashtra, Tamil Nadu, Karnataka run free/subsidized dialysis programs.
          </Text>
        </View>

        <View style={styles.schemeCard}>
          <Text style={styles.schemeTitle}>4. CGHS - Central Government Health Scheme</Text>
          <Text style={styles.schemeText}>
            CGHS beneficiaries (govt employees/pensioners) can avail dialysis at CGHS centers.
          </Text>
          <Text style={styles.linkText} onPress={() => openLink('https://cghs.gov.in')}>
            Visit CGHS Site
          </Text>
        </View>

        <Text style={styles.note}>
          *Please contact your nearest government hospital for detailed eligibility and process.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

// ---------------- Reports Screen ----------------
function ReportsScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [images, setImages] = useState([]);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const reportsDir = FileSystem.documentDirectory + 'KidneyMateReports/';

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === 'granted');
      const dirInfo = await FileSystem.getInfoAsync(reportsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(reportsDir, { intermediates: true });
      }
      loadImages();
    })();
  }, []);

  const loadImages = async () => {
    const files = await FileSystem.readDirectoryAsync(reportsDir);
    setImages(files.map(name => reportsDir + name));
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      const filename = `report_${Date.now()}.jpg`;
      const destPath = reportsDir + filename;
      await FileSystem.moveAsync({ from: photo.uri, to: destPath });
      if (hasMediaLibraryPermission) await MediaLibrary.saveToLibraryAsync(destPath);
      setIsCameraVisible(false);
      loadImages();
      Alert.alert('Success', 'Image saved locally.');
    }
  };

  const shareImage = async (uri) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'Sharing not available on this device');
      return;
    }
    await Sharing.shareAsync(uri);
  };

  if (isCameraVisible) {
    return (
      <Camera.Camera style={{ flex: 1 }} ref={ref => setCameraRef(ref)}>
        <View style={styles.cameraButtonContainer}>
          <AnimatedButton
            title="Capture"
            style={styles.captureButton}
            textStyle={styles.captureButtonText}
            onPress={takePicture}
          />
          <AnimatedButton
            title="Cancel"
            style={[styles.captureButton, { backgroundColor: '#b71c1c', marginLeft: 20 }]}
            textStyle={styles.captureButtonText}
            onPress={() => setIsCameraVisible(false)}
          />
        </View>
      </Camera.Camera>
    );
  }

  return (
    <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.gradientContainer}>
      <View style={styles.scrollContainer}>
        <Text style={styles.heading}>Reports</Text>
        <AnimatedButton
          title="Take Picture"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => setIsCameraVisible(true)}
        />

        {images.length === 0 ? (
          <Text style={styles.noImageText}>No reports yet.</Text>
        ) : (
          <FlatList
            data={images}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item }} style={styles.image} />
                <AnimatedButton
                  title="Share"
                  style={styles.shareButton}
                  textStyle={styles.shareButtonText}
                  onPress={() => shareImage(item)}
                />
              </View>
            )}
          />
        )}
      </View>
    </LinearGradient>
  );
}

// ---------------- Home Screen ----------------
function HomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Welcome to KidneyMate</Text>
        <AnimatedButton
          title="Login"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => navigation.navigate('Login')}
        />
        <AnimatedButton
          title="Sign Up"
          style={styles.buttonOutline}
          textStyle={styles.buttonOutlineText}
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>
    </LinearGradient>
  );
}

// ---------------- Login Screen ----------------
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] }))
      .catch(error => Alert.alert('Login Error', error.message));
  };

  return (
    <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AnimatedButton
          title="Login"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={handleLogin}
        />
        <Text style={styles.linkText} onPress={() => navigation.navigate('SignUp')}>
          Don't have an account? Sign Up
        </Text>
      </View>
    </LinearGradient>
  );
}

// ---------------- Sign Up Screen ----------------
function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const animationRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignUp = () => {
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        setShowSuccess(true);
        if (animationRef.current) animationRef.current.play();
        setTimeout(() => {
          setShowSuccess(false);
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        }, 2500);
      })
      .catch(error => Alert.alert('Sign Up Error', error.message));
  };

  return (
    <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Sign Up</Text>
        {showSuccess ? (
          <LottieView
            ref={animationRef}
            source={require('./animations/success.json')}
            autoPlay
            loop={false}
            style={{ width: 150, height: 150, alignSelf: 'center', marginBottom: 20 }}
          />
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <AnimatedButton
              title="Sign Up"
              style={styles.button}
              textStyle={styles.buttonText}
              onPress={handleSignUp}
            />
            <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
              Already have an account? Login
            </Text>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

// ---------------- Dashboard Screen ----------------
function DashboardScreen({ navigation }) {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUserEmail(user.email);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        ToastAndroid.show('Press Logout to exit', ToastAndroid.SHORT);
        return true; // prevent going back
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const features = [
    { name: 'Medication Reminders', screen: 'MedicationReminders' },
    { name: 'Fluid & Diet Tracking', screen: 'FluidDietTracking' },
    { name: 'Dialysis Scheduling', screen: 'DialysisScheduling' },
    { name: 'Reports Upload & Access', screen: 'Reports' },
    { name: 'Healthcare Schemes Info', screen: 'HealthcareSchemes' },
  ];

  return (
    <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.gradientContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Dashboard</Text>
        <Text style={styles.subText}>Welcome, {userEmail}</Text>

        {features.map(feature => (
          <AnimatedButton
            key={feature.screen}
            style={styles.featureCard}
            textStyle={styles.featureCardText}
            title={feature.name}
            onPress={() => navigation.navigate(feature.screen)}
          />
        ))}

        <AnimatedButton
          title="Logout"
          style={[styles.button, { backgroundColor: '#b71c1c' }]}
          textStyle={styles.buttonText}
          onPress={() => {
            auth.signOut().then(() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }));
          }}
        />
      </ScrollView>
    </LinearGradient>
  );
}

// ---------------- Navigation Setup ----------------
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        {/* Use PhoneLoginScreen instead of old LoginScreen */}
        <Stack.Screen name="Login" component={PhoneLoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="MedicationReminders" component={MedicationReminders} />
        <Stack.Screen name="FluidDietTracking" component={FluidDietTracking} />
        <Stack.Screen name="DialysisScheduling" component={DialysisScheduling} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="HealthcareSchemes" component={HealthcareSchemes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subText: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonOutline: {
    borderColor: '#bbdefb',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#bbdefb',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkText: {
    color: '#bbdefb',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  input: {
    width: '90%',
    borderColor: '#bbdefb',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    color: '#000',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: 'center',
  },
  featureCardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  noImageText: {
    fontSize: 18,
    color: '#e0e0e0',
    marginTop: 20,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 320,
    height: 240,
    borderRadius: 10,
    marginBottom: 10,
  },
  shareButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    elevation: 3,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  captureButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  schemeCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    marginVertical: 10,
    borderRadius: 15,
    width: '100%',
  },
  schemeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1565c0',
  },
  schemeText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
});
