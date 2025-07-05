import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import AudioManager from './utils/AudioManager';
import { designTokens } from './styles/designTokens';
import {
  PrimaryButton,
  PillButton,
  Card,
  Toggle,
  SectionHeader,
} from './components/UIComponents';

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
    // Removed unused variables
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedWhiteNoise = await AsyncStorage.getItem('whiteNoiseEnabled');
        const savedTimer = await AsyncStorage.getItem('sleepTimer');
        const savedPacks = await AsyncStorage.getItem('purchasedPacks');

        if (savedWhiteNoise !== null) {
          setWhiteNoiseEnabled(savedWhiteNoise === 'true');
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

    loadSettings();
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
    await AsyncStorage.getItem('sleepTimer').then((value) => {
      if (value) {
        setSleepTimer(parseInt(value) as SleepTimer);
      }
    }).catch((error) => {
      console.error('Failed to get sleep timer:', error);
    });
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
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Error', 'Failed to complete purchase. Please try again.');
    }
  };

  const handleChangeUnlock = () => {
    router.push('/onboarding?step=setup-sequence');
  };

  const renderSleepTimerSelector = () => (
    <Card style={styles.section}>
      <SectionHeader title="Sleep Timer" />
      <View style={styles.segmentedControl}>
        {[15, 30, 60].map((timer) => (
          <PillButton
            key={timer}
            title={`${timer}m`}
            onPress={() => handleSleepTimerChange(timer as SleepTimer)}
            active={sleepTimer === timer}
            style={styles.timerButton}
          />
        ))}
      </View>
    </Card>
  );

  const renderWhiteNoiseToggle = () => (
    <Card style={styles.section}>
      <Toggle
        value={whiteNoiseEnabled}
        onValueChange={handleWhiteNoiseToggle}
        label="White Noise"
      />
    </Card>
  );

  const renderAnimationPacks = () => (
    <Card style={styles.section}>
      <SectionHeader title="Animation Packs" />
      {animationPacks.map((pack) => (
        <Card key={pack.id} style={styles.packCard}>
          <View style={styles.packThumbnail}>
            <Ionicons name="play-circle-outline" size={32} color={designTokens.colors.primary} />
          </View>
          <View style={styles.packInfo}>
            <Text style={styles.packName}>{pack.name}</Text>
            {pack.price && <Text style={styles.packPrice}>{pack.price}</Text>}
          </View>
          {!pack.purchased ? (
            <PrimaryButton
              title="Download"
              onPress={() => handlePurchasePack(pack.id)}
              disabled={!pack.id.includes('default')}
              style={styles.downloadButton}
            />
          ) : (
            <View style={styles.purchasedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={designTokens.colors.success} />
            </View>
          )}
        </Card>
      ))}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/images/icons/splash-icon-light.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
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
    backgroundColor: designTokens.colors.aliceBlue,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: designTokens.spacing.lg,
    paddingBottom: designTokens.spacing.xl,
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
  logoImage: {
    width: 50,
    height: 50,
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
    backgroundColor: designTokens.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: designTokens.spacing.lg,
    borderRadius: designTokens.borderRadius.md,
    marginBottom: designTokens.spacing.xl,
    gap: designTokens.spacing.sm,
    ...designTokens.shadows.md,
  },
  playButtonText: {
    color: designTokens.colors.white,
    fontSize: designTokens.typography.sizes.lg,
    fontWeight: designTokens.typography.weights.semibold,
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
    backgroundColor: designTokens.colors.lightGray,
    borderRadius: designTokens.borderRadius.sm,
    padding: designTokens.spacing.xs,
    gap: designTokens.spacing.xs,
  },
  timerButton: {
    flex: 1,
  },
  downloadButton: {
    minWidth: 100,
    paddingHorizontal: designTokens.spacing.md,
    paddingVertical: designTokens.spacing.xs,
    height: 36,
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
    backgroundColor: designTokens.colors.offWhite,
    padding: designTokens.spacing.md,
    borderRadius: designTokens.borderRadius.md,
    marginBottom: designTokens.spacing.sm,
    ...designTokens.shadows.sm,
  },
  packThumbnail: {
    width: 48,
    height: 48,
    backgroundColor: designTokens.colors.mediumGray,
    borderRadius: designTokens.borderRadius.sm,
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
