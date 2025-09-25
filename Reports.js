import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  Platform,
} from 'react-native';

import * as Camera from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

export default function Reports() {
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

      // Create directory if not exists
      const dirInfo = await FileSystem.getInfoAsync(reportsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(reportsDir, { intermediates: true });
      }
      loadImages();
    })();
  }, []);

  const loadImages = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(reportsDir);
      // files is array of file names, build full URI list
      setImages(files.map(name => reportsDir + name));
    } catch (error) {
      console.log('Error loading images', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      const filename = `report_${Date.now()}.jpg`;
      const destPath = reportsDir + filename;

      await FileSystem.moveAsync({
        from: photo.uri,
        to: destPath,
      });

      // Optional: Save to gallery as well
      if (hasMediaLibraryPermission) {
        await MediaLibrary.saveToLibraryAsync(destPath);
      }

      setIsCameraVisible(false);
      loadImages();
      Alert.alert('Success', 'Image saved locally.');
    }
  };

  const shareImage = async (uri) => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Error', 'Sharing is not available on this platform');
      return;
    }
    await Sharing.shareAsync(uri);
  };

  if (hasCameraPermission === null) {
    return <View><Text>Requesting camera permission...</Text></View>;
  }
  if (hasCameraPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  if (isCameraVisible) {
    return (
      <Camera.Camera style={{ flex: 1 }} ref={ref => setCameraRef(ref)}>
        <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20 }}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}>
            <Text style={styles.captureButtonText}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.captureButton, { backgroundColor: '#b71c1c', marginLeft: 20 }]}
            onPress={() => setIsCameraVisible(false)}>
            <Text style={styles.captureButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Camera.Camera>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>

      <TouchableOpacity style={styles.button} onPress={() => setIsCameraVisible(true)}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>

      {images.length === 0 ? (
        <Text style={styles.noImageText}>No reports available. Take pictures to save.</Text>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item }} style={styles.image} />
              <TouchableOpacity style={styles.shareButton} onPress={() => shareImage(item)}>
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e6f2ff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  noImageText: {
    textAlign: 'center',
    color: '#555',
    marginTop: 50,
    fontSize: 16,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#1a237e',
    borderWidth: 1,
    width: 320,
    alignItems: 'center',
  },
  image: {
    width: 320,
    height: 250,
  },
  shareButton: {
    backgroundColor: '#3949ab',
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  captureButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
