import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { getAuth, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedButton from './components/AnimatedButton';


export default function PhoneLoginScreen({ navigation }) {
  const recaptchaVerifier = useRef(null);
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [otp, setOtp] = useState('');

  const sendVerification = async () => {
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const id = await phoneProvider.verifyPhoneNumber(phone, recaptchaVerifier.current);
      setVerificationId(id);
      Alert.alert('OTP Sent', 'Check your phone for the verification code.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const confirmCode = async () => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      await signInWithCredential(auth, credential);
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (err) {
      Alert.alert('Invalid Code', err.message);
    }
  };

  return (
    <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.gradientContainer}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={auth.app.options}
        attemptInvisibleVerification={true}
      />

      <View style={styles.container}>
        <Text style={styles.heading}>Phone Login</Text>

        <TextInput
          style={styles.input}
          placeholder="+91XXXXXXXXXX"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {verificationId ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <AnimatedButton
              title="Verify OTP"
              onPress={confirmCode}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </>
        ) : (
          <AnimatedButton
            title="Send OTP"
            onPress={sendVerification}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1976D2',
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
