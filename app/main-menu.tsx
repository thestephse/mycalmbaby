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
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AudioManager from './utils/AudioManager';

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
    { id: 'nature', name: 'Nature Patterns', price: '', purchased: false },
    { id: 'geometric', name: 'Geometric Flow', price: '', purchased: false },
    { id: 'organic', name: 'Organic Forms', price: '', purchased: false },
  ]);

  useEffect(() => {
    const loadAndApplySettings = async () => {
      try {
        const savedTimer = await AsyncStorage.getItem('sleepTimer');
        const savedWhiteNoise = await AsyncStorage.getItem('whiteNoiseEnabled');
        const savedPacks = await AsyncStorage.getItem('purchasedPacks');

        const isNoiseEnabled = savedWhiteNoise === null || savedWhiteNoise === 'true';
        setWhiteNoiseEnabled(isNoiseEnabled);

        if (isNoiseEnabled) {
          AudioManager.play();
        } else {
          AudioManager.stop();
        }

        if (savedTimer) {
          setSleepTimer(parseInt(savedTimer) as SleepTimer);
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

    loadAndApplySettings();
  }, []);

  const handlePlay = () => {
    router.push('/animation');
  };

  const handleSleepTimerChange = (timer: SleepTimer) => {
    setSleepTimer(timer);
    AsyncStorage.setItem('sleepTimer', timer.toString());
  };

  const handleWhiteNoiseToggle = async (value: boolean) => {
    setWhiteNoiseEnabled(value);
    await AsyncStorage.setItem('whiteNoiseEnabled', value.toString());
    if (value) {
      AudioManager.play();
    } else {
      AudioManager.stop();
    }
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
    } catch (_) {
      Alert.alert('Error', 'Failed to complete purchase. Please try again.');
    }
  };

  const handleChangeUnlock = () => {
    router.push('/onboarding?step=setup-sequence');
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
            {pack.price && <Text style={styles.packPrice}>{pack.price}</Text>}
          </View>
          {!pack.purchased ? (
            <TouchableOpacity
              style={[styles.purchaseButton, !pack.id.includes('default') && styles.disabledButton]}
              onPress={() => handlePurchasePack(pack.id)}
              disabled={!pack.id.includes('default')}
            >
              <Text style={styles.purchaseButtonText}>Download</Text>
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
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <View style={styles.logoCircle}>
                {/* Small circles representing the SVG pattern */}
                <View style={[styles.smallCircle, styles.smallCircleTop]} />
                <View style={[styles.smallCircle, styles.smallCircleRight]} />
                <View style={[styles.smallCircle, styles.smallCircleBottom]} />
                <View style={[styles.smallCircle, styles.smallCircleLeft]} />
              </View>
            </View>
          </View>
          <Text style={styles.title}>My Calm Baby</Text>
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  logoBackground: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#A8D5BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  smallCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A8D5BA',
    position: 'absolute',
  },
  smallCircleTop: {
    top: 0,
    left: '50%',
    marginLeft: -4,
  },
  smallCircleRight: {
    right: 0,
    top: '50%',
    marginTop: -4,
  },
  smallCircleBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -4,
  },
  smallCircleLeft: {
    left: 0,
    top: '50%',
    marginTop: -4,
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
  disabledButton: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
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
