import { Dimensions, View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import React, { useCallback, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import data, { Card } from '../animation/data/data';
import { AntDesign } from "@expo/vector-icons";
import CardView from "@/components/CardView";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const CONTACT_URL = 'https://aakash-srinivasan.netlify.app/';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;
const RESET_DURATION = 300;

const Index = () => {
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<Card[]>(data);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const dummyTranslate = useSharedValue(0);
  const nextCardScale = useSharedValue(0.9);

  const handleReload = () => {
    setCards(data);
  };

  const resetPosition = useCallback(() => {
    translateX.value = withTiming(0, { duration: RESET_DURATION });
    translateY.value = withTiming(0, { duration: RESET_DURATION });
    nextCardScale.value = withTiming(0.9, { duration: RESET_DURATION });
  }, []);

  const onSwipeComplete = useCallback(() => {
    if (cards.length > 0) {
      setCards(prev => prev.slice(1));
      translateX.value = 0;
      translateY.value = 0;
      nextCardScale.value = 0.8;
      nextCardScale.value = withDelay(
        100,
        withTiming(0.9, { duration: 400, easing: Easing.exp })
      );
    } else {
      resetPosition();
    }
  }, [cards, resetPosition]);

  const forceSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const swipeConfig = {
      left: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      right: { x: SCREEN_WIDTH * 1.5, y: 0 },
      up: { x: 0, y: -SCREEN_HEIGHT * 1.5 },
      down: { x: 0, y: SCREEN_HEIGHT * 1.5 },
    };
    translateX.value = withTiming(swipeConfig[direction].x, {
      duration: SWIPE_OUT_DURATION,
    });
    translateY.value = withTiming(
      swipeConfig[direction].y,
      { duration: SWIPE_OUT_DURATION },
      () => runOnJS(onSwipeComplete)(),
    );
  }, [onSwipeComplete]);

  const handleLike = useCallback(() => forceSwipe('right'), [forceSwipe]);
  const handleDislike = useCallback(() => forceSwipe('left'), [forceSwipe]);

  // The drag itself is driven entirely on the UI thread: `onUpdate` mutates the
  // shared values directly (no bridge crossing per touch move), and `onEnd`
  // only hops back to the JS thread via `runOnJS` to kick off the release
  // animation / state update.
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          nextCardScale.value = withTiming(1, { duration: 150 });
        })
        .onUpdate((event) => {
          translateX.value = event.translationX;
          translateY.value = event.translationY;
          const dragDistance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
          const progress = Math.min(dragDistance / SCREEN_WIDTH, 1);
          nextCardScale.value = 0.9 + 0.1 * progress;
        })
        .onEnd((event) => {
          const absDx = Math.abs(event.translationX);
          const absDy = Math.abs(event.translationY);

          if (absDy > absDx) {
            if (event.translationY < -SWIPE_THRESHOLD) {
              runOnJS(forceSwipe)('up');
            } else if (event.translationY > SWIPE_THRESHOLD) {
              runOnJS(forceSwipe)('down');
            } else {
              runOnJS(resetPosition)();
            }
          } else {
            if (event.translationX > SWIPE_THRESHOLD) {
              runOnJS(forceSwipe)('right');
            } else if (event.translationX < -SWIPE_THRESHOLD) {
              runOnJS(forceSwipe)('left');
            } else {
              runOnJS(resetPosition)();
            }
          }
        }),
    [forceSwipe, resetPosition],
  );

  const renderCard = useCallback((card: Card, index: number) => (
    <CardView
      key={card.id}
      card={card}
      index={index}
      totalCards={cards.length}
      panGesture={index === 0 ? panGesture : undefined}
      nextCardScale={index === 1 ? nextCardScale : dummyTranslate}
      translateX={index === 0 ? translateX : dummyTranslate}
      translateY={index === 0 ? translateY : dummyTranslate}
    />
  ), [cards.length, panGesture, translateX, translateY, nextCardScale]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <AntDesign name="heart" size={16} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Swipes</Text>
        </View>
        <Text style={styles.versionTag}>v{APP_VERSION}</Text>
      </View>

      <View style={styles.cardArea}>
        {cards.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.title}>You're all caught up!</Text>
            <Text style={styles.subtitle}>Check back later for more recommendations.</Text>
            <TouchableOpacity style={styles.button} onPress={handleReload}>
              <Text style={styles.buttonText}>Start over</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cards.map(renderCard).reverse()}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.btn} onPress={handleDislike}>
                <AntDesign name="close" size={25} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleLike}>
                <AntDesign name="heart" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.footerText}>Built by Aakash Srinivasan</Text>
        <TouchableOpacity onPress={() => Linking.openURL(CONTACT_URL)}>
          <Text style={styles.footerLink}>Contact Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
    marginTop: 25,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: 'font',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#818181',
    fontFamily: 'font',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#17BB84',
    width: 248,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'font',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5864',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'font',
    color: '#222',
  },
  versionTag: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: '#f5f5f5',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  footerLink: {
    fontSize: 12,
    color: '#FF5864',
    fontWeight: '600',
    marginTop: 2,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    elevation: 5,
  },
});

export default Index;
