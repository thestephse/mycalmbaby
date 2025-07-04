import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  BackHandler,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type SleepTimer = 15 | 30 | 60;

interface AnimationPack {
  id: string;
  name: string;
  price: string;
  purchased: boolean;
  thumbnail?: string;
}

export default function MainMenuScreen() {
  const [sleepTimer, setSleepTimer] = useState<SleepTimer>(30);
  const [whiteNoiseEnabled, setWhiteNoiseEnabled] = useState(true);
  const [animationPacks, setAnimationPacks] = useState<AnimationPack[]>([
    { id: 'default', name: 'Basic Shapes', price: 'Free', purchased: true },
    { id: 'nature', name: 'Nature Patterns', price: '€0.99', purchased: false },
    { id: 'geometric', name: 'Geometric Flow', price: '€0.99', purchased: false },
    { id: 'organic', name: 'Organic Forms', price: '€0.99', purchased: false },
  ]);

  useEffect(() => {
    loadSettings();
    
    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExitApp();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTimer = await AsyncStorage.getItem('sleepTimer');
      const savedWhiteNoise = await AsyncStorage.getItem('whiteNoiseEnabled');
      const savedPacks = await AsyncStorage.getItem('purchasedPacks');

      if (savedTimer) {
        setSleepTimer(parseInt(savedTimer) as SleepTimer);
      }
      if (savedWhiteNoise !== null) {
        setWhiteNoiseEnabled(savedWhiteNoise === 'true');
      }
      if (savedPacks) {
        const purchasedIds = JSON.parse(savedPacks);
        setAnimationPacks(prev => 
          prev.map(pack => ({
            ...pack,
            purchased: pack.id === 'default' || purchasedIds.includes(pack.id)
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('sleepTimer', sleepTimer.toString());
      await AsyncStorage.setItem('whiteNoiseEnabled', whiteNoiseEnabled.toString());
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handlePlay = () => {
    saveSettings();
    router.push('/animation');
  };

  const handleSleepTimerChange = (timer: SleepTimer) => {
    setSleepTimer(timer);
  };

  const handleWhiteNoiseToggle = (value: boolean) => {
    setWhiteNoiseEnabled(value);
  };

  const handlePurchasePack = (packId: string) => {
    // TODO: Implement actual IAP logic
    Alert.alert(
      'Purchase Animation Pack',
      'In-app purchase functionality will be implemented here.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Simulate Purchase', 
          onPress: () => simulatePurchase(packId)
        }
      ]
    );
  };

  const simulatePurchase = async (packId: string) => {
    try {
      const purchasedPacks = await AsyncStorage.getItem('purchasedPacks');
      const currentPacks = purchasedPacks ? JSON.parse(purchasedPacks) : [];
      
      if (!currentPacks.includes(packId)) {
        currentPacks.push(packId);
        await AsyncStorage.setItem('purchasedPacks', JSON.stringify(currentPacks));
        
        setAnimationPacks(prev => 
          prev.map(pack => 
            pack.id === packId ? { ...pack, purchased: true } : pack
          )
        );
        
        Alert.alert('Success', 'Animation pack purchased successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete purchase. Please try again.');
    }
  };

  const handleChangeUnlock = () => {
    router.push('/onboarding?step=setup-sequence');
  };

  const handleExitApp = () => {
    Alert.alert(
      'Exit CalmBaby',
      'Are you sure you want to exit the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => BackHandler.exitApp() }
      ]
    );
  };

  const renderSleepTimerSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sleep Timer</Text>
      <View style={styles.segmentedControl}>
        {[15, 30, 60].map((timer) => (
          <TouchableOpacity
            key={timer}
            style={[
              styles.segmentButton,
              sleepTimer === timer && styles.segmentButtonActive
            ]}
            onPress={() => handleSleepTimerChange(timer as SleepTimer)}
          >
            <Text style={[
              styles.segmentButtonText,
              sleepTimer === timer && styles.segmentButtonTextActive
            ]}>
              {timer}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWhiteNoiseToggle = () => (
    <View style={styles.section}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>White Noise</Text>
        <Switch
          value={whiteNoiseEnabled}
          onValueChange={handleWhiteNoiseToggle}
          trackColor={{ false: '#E0E0E0', true: '#00BFA6' }}
          thumbColor={whiteNoiseEnabled ? '#FFFFFF' : '#BDBDBD'}
        />
      </View>
    </View>
  );

  const renderAnimationPacks = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Animation Packs</Text>
      {animationPacks.map((pack) => (
        <View key={pack.id} style={styles.packCard}>
          <View style={styles.packThumbnail}>
            <Ionicons name="play-circle-outline" size={32} color="#606060" />
          </View>
          <View style={styles.packInfo}>
            <Text style={styles.packName}>{pack.name}</Text>
            <Text style={styles.packPrice}>{pack.price}</Text>
          </View>
          {!pack.purchased ? (
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => handlePurchasePack(pack.id)}
            >
              <Text style={styles.purchaseButtonText}>Buy</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.purchasedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#00BFA6" />
            </View>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CalmBaby</Text>
        </View>

        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Ionicons name="play" size={32} color="#FFFFFF" />
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>

        {renderSleepTimerSelector()}
        {renderWhiteNoiseToggle()}
        {renderAnimationPacks()}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.textButton} onPress={handleChangeUnlock}>
            <Text style={styles.textButtonText}>Change Unlock Sequence</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exitButton} onPress={handleExitApp}>
            <Text style={styles.exitButtonText}>Exit App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  playButton: {
    backgroundColor: '#00BFA6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 32,
    gap: 12,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#00BFA6',
  },
  segmentButtonText: {
    fontSize: 16,
    color: '#606060',
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  packThumbnail: {
    width: 48,
    height: 48,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  packInfo: {
    flex: 1,
  },
  packName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  packPrice: {
    fontSize: 14,
    color: '#606060',
  },
  purchaseButton: {
    backgroundColor: '#00BFA6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  purchasedBadge: {
    padding: 8,
  },
  bottomActions: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  textButton: {
    paddingVertical: 12,
  },
  textButtonText: {
    fontSize: 16,
    color: '#00BFA6',
    fontWeight: '500',
  },
  exitButton: {
    paddingVertical: 8,
  },
  exitButtonText: {
    fontSize: 14,
    color: '#BDBDBD',
  },
});
