import { Dimensions, View, Text, StyleSheet, TouchableOpacity, PanResponder, TextInput, Linking } from "react-native";
import React, { useCallback, useRef, useState } from 'react';
import data, { Card } from '../../animation/data/data';
import { AntDesign } from "@expo/vector-icons";
import CardView from "@/components/CardView";
import { runOnJS, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";
import axios from "axios";
import Toast from "react-native-toast-message";
import { supabase } from "@/supabaseClient";
import LottieView from "lottie-react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;
const RESET_DuraTION = 300;

const index = () => {
  const [cards, setCards] = useState<Card[]>(data);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const dummyTranslate = useSharedValue(0);
  const nextCardScale = useSharedValue(0.9);
  const [isFeedback, SetIsFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const telegramBotToken = process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.EXPO_PUBLIC_TELEGRAM_CHAT_ID;
  const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const [rating, setRating] = useState<number>(0);
  const animationSources: Record<string, any> = {
    success: require("@/animation/assets/success.json"),
  };

  const handreload = () => {
    setCards(data);
    SetIsFeedback(false);
    setFeedback("");
  }
  const resetPostion = useCallback(() => {
    translateX.value = withTiming(0, { duration: RESET_DuraTION })
    translateY.value = withTiming(0, { duration: RESET_DuraTION })
    nextCardScale.value = withTiming(0.9, { duration: RESET_DuraTION })

  }, [])


  const onSwipeComplete = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const action = direction === 'left' ? 'dislike' : 'like';
    const currentCard = cards[0]; // <<-- grab the top card once.

    if (cards.length > 0) {
      setCards(pre => pre.slice(1));
      translateX.value = 0;
      translateY.value = 0;
      nextCardScale.value = 0.8;
      nextCardScale.value = withDelay(
        100,
        withTiming(0.9, { duration: 400, easing: Easing.exp })
      );
    } else {
      resetPostion();
    }
  }, [cards, resetPostion]);

  const forceSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const swipeConfig = {
      left: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      right: { x: SCREEN_WIDTH * 1.5, y: 0 },
      up: { x: 0, y: -SCREEN_HEIGHT * 1.5 },
      down: { x: 0, y: SCREEN_HEIGHT * 1.5 },
    };
    translateX.value = withTiming(swipeConfig[direction].x, {
      duration: SWIPE_OUT_DURATION
    });
    translateY.value = withTiming(swipeConfig[direction].y, {
      duration: SWIPE_OUT_DURATION
    }, () => runOnJS(onSwipeComplete)(direction),
    );

  }, [],);

  const handleLike = useCallback(() => forceSwipe('right'), [forceSwipe]);
  const handleDisLike = useCallback(() => forceSwipe('left'), [forceSwipe]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateX.value = gesture.dx;
        translateY.value = gesture.dy;
        const dragDistance = Math.sqrt(gesture.dx ** 2 + gesture.dy ** 2);
        const progress = Math.min(dragDistance / SCREEN_WIDTH, 1);
        nextCardScale.value = 0.9 + 0.1 * progress;
      },
      onPanResponderRelease: (_, gesture) => {
        const adsDx = Math.abs(gesture.dx);
        const absDy = Math.abs(gesture.dy);
        if (absDy > adsDx) {
          if (gesture.dy < -SWIPE_THRESHOLD) {
            forceSwipe('up');
          }
          else if (gesture.dy > SWIPE_THRESHOLD) {
            forceSwipe('down');
          } else {
            resetPostion();

          }
        } else {
          if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          }
          else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else {
            resetPostion();
          }
        }

      },
      onPanResponderGrant: () => {
        translateX.value = withTiming(0, { duration: 0 })
        translateY.value = withTiming(0, { duration: 0 })
        nextCardScale.value = withTiming(1, { duration: 0 })
      },
    })
  ).current

  const renderCard = useCallback((card: Card, index: number) => (
    <CardView
      key={card.id}
      card={card}
      index={index}
      totalCards={cards.length}
      panHandlers={index === 0 ? panResponder.panHandlers : {}} // pan
      nextCardScale={index === 1 ? nextCardScale : dummyTranslate}
      translateX={index === 0 ? translateX : dummyTranslate}
      translateY={index === 0 ? translateY : dummyTranslate}
    />
  ), [cards.length, panResponder.panHandlers, translateX, translateY, nextCardScale]);
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("feedback")
        .insert([{ feedback_text: "Swiper" + feedback + rating }]);

      if (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
        return;
      }

      const response = await axios.post(telegramUrl, {
        chat_id: telegramChatId,
        text: `New Feedback:Swiper App Rating ${rating} ${feedback}`,
      });

      if (response.status === 200) {
        setRating(0);
        setFeedback("");
        SetIsFeedback(false), setFeedback("");
        handreload();
        Toast.show({
          type: "success",
          text1: "Feedback Sent!",
          text2: "Thanks for your thoughts 🙌",
          position: "top",
        });


      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (index: number) => {
    setRating(index + 1);
  };
  return (
    <View style={styles.container}>
      {cards.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <LottieView
                source={animationSources.success}
                autoPlay
                style={styles.lottieAnimation}
              />
              <Text style={styles.title}>Sending feedback...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.modaltitle}>Rate your experience</Text>
              <View style={styles.starsContainer}>
                {[...Array(5)].map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handlePress(index)}
                  >
                    <Text
                      style={[
                        styles.star,
                        rating > index && styles.filledStar,
                      ]}
                    >
                      {rating > index ? '⭐️' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.feedbackText}>Why is the reason for your rating?</Text>

              <TextInput
                placeholder="Add your feedback here..."
                multiline
                value={feedback}
                onChangeText={setFeedback}
                style={styles.textInput}
              />

              <Text style={styles.footerText}>Did you enjoy my Swipe UI ?</Text>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!feedback.trim()}
                style={[styles.button, { opacity: feedback.trim() ? 1 : 0.5 }]}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.linkedin.com/in/aakash-srinivasan-9258b2257')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#0077B5', // LinkedIn Blue
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  gap: 8,
                  marginTop: 20,
                }}
              >
                <AntDesign name="linkedin-square" size={24} color="white" />
                <Text style={{
                  color: 'white',
                  fontFamily: 'font', // Your custom font
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Connect with me
                </Text>
              </TouchableOpacity>


            </>
          )}
        </View>
      ) : (
        <>
          {cards.map(renderCard).reverse()}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.btn} onPress={handleDisLike}>
              <AntDesign name="close" size={25} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleLike}>
              <AntDesign name="heart" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontFamily: 'font',
    marginTop: 20,
  },
  modaltitle: {
    fontSize: 20,
    fontFamily: 'font',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  star: {
    fontSize: 30,
    marginHorizontal: 5,
    color: '#ccc',
  },
  filledStar: {
    color: '#FFD700',
  },
  feedbackText: {
    fontSize: 14,
    fontFamily: 'font',
    marginBottom: 20,
  },
  textInput: {
    height: 100,
    width: '100%',
    textAlignVertical: 'top',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fafafa',
    fontSize: 16,
    fontFamily: 'font',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#818181',
    fontFamily: 'font',
  },
  button: {
    backgroundColor: '#17BB84',
    width: 248,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'font',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 20,
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
  filledBtn: {
    backgroundColor: '#FF6F61',
  },
});

export default index;