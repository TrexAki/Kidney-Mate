import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import { firestore, auth } from './firebaseConfig';

export default function FluidDietTracking() {
  // Form states
  const [dryWeight, setDryWeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [dialysisGoal, setDialysisGoal] = useState('');
  const [bpBefore, setBpBefore] = useState('');
  const [bpAfter, setBpAfter] = useState('');
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [other, setOther] = useState('');
  const [fluidIntake, setFluidIntake] = useState('');

  // History list states
  const [history, setHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const userId = auth.currentUser.uid;

  // Load today's data on mount
  useEffect(() => {
    const todayId = new Date().toISOString().split('T')[0];
    firestore
      .collection('users')
      .doc(userId)
      .collection('fluid_diet_tracking')
      .doc(todayId)
      .get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          setDryWeight(data.dryWeight || '');
          setCurrentWeight(data.currentWeight || '');
          setDialysisGoal(data.dialysisGoal || '');
          setBpBefore(data.bpBefore || '');
          setBpAfter(data.bpAfter || '');
          setBreakfast(data.breakfast || '');
          setLunch(data.lunch || '');
          setDinner(data.dinner || '');
          setOther(data.other || '');
          setFluidIntake(data.fluidIntake || '');
        }
      })
      .catch(error => {
        console.log('Error loading today\'s tracking:', error);
      });
  }, []);

  // Load last 30 entries from Firestore
  useEffect(() => {
    const unsubscribe = firestore
      .collection('users')
      .doc(userId)
      .collection('fluid_diet_tracking')
      .orderBy('updatedAt', 'desc')
      .limit(30)
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistory(data);
      }, error => {
        console.log('Error fetching history:', error);
      });

    return () => unsubscribe();
  }, []);

  const saveTracking = () => {
    if (!currentWeight || !dryWeight) {
      Alert.alert('Please fill both Dry Weight and Current Weight');
      return;
    }

    const weightGain = parseFloat(currentWeight) - parseFloat(dryWeight);
    const todayId = new Date().toISOString().split('T')[0];

    firestore
      .collection('users')
      .doc(userId)
      .collection('fluid_diet_tracking')
      .doc(todayId)
      .set(
        {
          dryWeight,
          currentWeight,
          weightGain: weightGain.toFixed(2),
          dialysisGoal,
          bpBefore,
          bpAfter,
          breakfast,
          lunch,
          dinner,
          other,
          fluidIntake,
          updatedAt: new Date(),
        },
        { merge: true }
      )
      .then(() => {
        Alert.alert('Success', 'Tracking saved for today!');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  const openEntry = entry => {
    setSelectedEntry(entry);
    setModalVisible(true);
  };

  const renderHistoryItem = ({ item }) => {
    const displayDate = new Date(item.id).toDateString();
    return (
      <TouchableOpacity style={styles.historyItem} onPress={() => openEntry(item)}>
        <Text style={styles.historyDate}>{displayDate}</Text>
        <Text numberOfLines={1} style={styles.historySummary}>
          {item.breakfast || item.lunch || item.dinner || item.other || 'No diet notes'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Fluid & Diet Tracking</Text>

        <Text style={styles.sectionHeading}>🧂 Fluid Balance</Text>
        <TextInput
          style={styles.input}
          placeholder="Dry Weight (kg)"
          value={dryWeight}
          onChangeText={setDryWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Current Weight (kg)"
          value={currentWeight}
          onChangeText={setCurrentWeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Dialysis Weight Goal (litres)"
          value={dialysisGoal}
          onChangeText={setDialysisGoal}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="BP Before Dialysis (e.g., 120/80)"
          value={bpBefore}
          onChangeText={setBpBefore}
        />
        <TextInput
          style={styles.input}
          placeholder="BP After Dialysis (e.g., 110/70)"
          value={bpAfter}
          onChangeText={setBpAfter}
        />

        <Text style={styles.sectionHeading}>🥗 Diet Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Breakfast details"
          value={breakfast}
          onChangeText={setBreakfast}
          multiline
        />
        <TextInput
          style={styles.textArea}
          placeholder="Lunch details"
          value={lunch}
          onChangeText={setLunch}
          multiline
        />
        <TextInput
          style={styles.textArea}
          placeholder="Dinner details"
          value={dinner}
          onChangeText={setDinner}
          multiline
        />
        <TextInput
          style={styles.textArea}
          placeholder="Other diet notes"
          value={other}
          onChangeText={setOther}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Fluid Intake (litres)"
          value={fluidIntake}
          onChangeText={setFluidIntake}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveTracking}>
          <Text style={styles.buttonText}>Save Tracking</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionHeading, { marginTop: 30 }]}>📅 Past Month Entries</Text>
        {history.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 10 }}>No entries for this month.</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={renderHistoryItem}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Modal to show full details */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={{ fontSize: 18, color: '#1b5e20' }}>Close</Text>
          </TouchableOpacity>

          {selectedEntry ? (
            <>
              <Text style={styles.heading}>Details for {new Date(selectedEntry.id).toDateString()}</Text>

              <Text style={styles.sectionHeading}>🧂 Fluid Balance</Text>
              <Text>Dry Weight: {selectedEntry.dryWeight || '-'}</Text>
              <Text>Current Weight: {selectedEntry.currentWeight || '-'}</Text>
              <Text>Weight Gain: {selectedEntry.weightGain || '-'}</Text>
              <Text>Dialysis Goal: {selectedEntry.dialysisGoal || '-'}</Text>
              <Text>BP Before Dialysis: {selectedEntry.bpBefore || '-'}</Text>
              <Text>BP After Dialysis: {selectedEntry.bpAfter || '-'}</Text>

              <Text style={styles.sectionHeading}>🥗 Diet Notes</Text>
              <Text>Breakfast: {selectedEntry.breakfast || '-'}</Text>
              <Text>Lunch: {selectedEntry.lunch || '-'}</Text>
              <Text>Dinner: {selectedEntry.dinner || '-'}</Text>
              <Text>Other: {selectedEntry.other || '-'}</Text>

              <Text>Fluid Intake: {selectedEntry.fluidIntake || '-'}</Text>
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f5e9',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#2e7d32',
  },
  input: {
    borderColor: '#1b5e20',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    borderColor: '#1b5e20',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1b5e20',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderColor: '#1b5e20',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  historyDate: {
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  historySummary: {
    marginTop: 4,
    color: '#4a4a4a',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e8f5e9',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
});
