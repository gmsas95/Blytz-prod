import {useTranslation} from 'react-i18next';
import {useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  Image,
  ImageSourcePropType,
  ImageStyle,
  TextStyle,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../config/theme';

const {width} = Dimensions.get('window');

import onboarding_discover from '../../../assets/onboarding_discover.png';
import onboarding_bid from '../../../assets/onboarding_bid.png';
import onboarding_payment from '../../../assets/onboarding_payment.png';
import onboarding_start from '../../../assets/onboarding_start.png';

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

export default function OnboardingScreens({
  onComplete,
}: {
  onComplete?: () => Promise<void>;
}) {
  const {t} = useTranslation();
  const onboardingData: OnboardingItem[] = [
    {
      id: '1',
      title: t('welcome'),
      description: t('onboarding.discoverAuctions'),
      image: onboarding_discover,
    },
    {
      id: '2',
      title: t('onboarding.bidInRealTime'),
      description: t('onboarding.joinLiveStreams'),
      image: onboarding_bid,
    },
    {
      id: '3',
      title: t('onboarding.securePayments'),
      description: t('onboarding.multiplePaymentOptions'),
      image: onboarding_payment,
    },
    {
      id: '4',
      title: t('onboarding.readyToStart'),
      description: t('onboarding.createAccountToStart'),
      image: onboarding_start,
    },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingItem>>(null);
  const navigation = useNavigation();

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      if (onComplete) {
        await onComplete();
      } else {
        navigation.navigate('Login' as never);
      }
    }
  };

  const handleSkip = async () => {
    if (onComplete) {
      await onComplete();
    } else {
      navigation.navigate('Login' as never);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={({item}) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image as ImageStyle} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  index === currentIndex
                    ? theme.colors.primary
                    : theme.colors.surface,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button">
          <Text style={styles.skipButtonText}>SKIP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          accessibilityLabel={
            currentIndex === onboardingData.length - 1
              ? 'Get Started'
              : 'Next onboarding step'
          }
          accessibilityRole="button">
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1
              ? 'GET STARTED'
              : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 40, // space-5
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 20,
  },
  image: {
    width: 240,
    height: 240,
    resizeMode: 'contain' as const,
    marginBottom: 64,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.onBackground,
    marginBottom: 16, // space-2
    textAlign: 'center' as const,
    fontFamily: 'Inter',
  },
  description: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.body1.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.secondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    letterSpacing: theme.typography.body1.letterSpacing,
    fontFamily: 'Inter',
  },
  paginationContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    marginBottom: 32, // space-4
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24, // space-3
    marginBottom: 32, // space-4
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44, // minimum touch target
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.secondary,
    letterSpacing: theme.typography.button.letterSpacing,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 32, // space-4
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    minHeight: 44, // minimum touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight as TextStyle['fontWeight'],
    color: theme.colors.onPrimary,
    letterSpacing: theme.typography.button.letterSpacing,
    textTransform: 'uppercase',
    fontFamily: 'Inter',
  },
});
