import { Dimensions, View, Text, StyleSheet, TouchableOpacity, PanResponder } from "react-native";
import React, { useCallback, useRef, useState } from 'react';
import data, { Card } from '../../animation/data/data';
import { AntDesign } from "@expo/vector-icons";
import CardView from "@/components/CardView";
import { runOnJS, useSharedValue, withDelay, withTiming,Easing } from "react-native-reanimated";
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

  const resetPostion = useCallback(() => {
    translateX.value = withTiming(0, { duration: RESET_DuraTION })
    translateY.value = withTiming(0, { duration: RESET_DuraTION })
    nextCardScale.value = withTiming(0.9, { duration: RESET_DuraTION })

  }, [])
  const onSwipeComplete = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    const action = direction === 'left' ? 'dislike' : 'like';
    console.log(`Swiped ${action}`,action,cards[0].name);

    if(cards.length >0) {
      setCards(pre => pre.slice(1));
      translateX.value=0;
      translateY.value=0;
      nextCardScale.value=0.8;
      nextCardScale.value=withDelay(
        100, 
        withTiming(0.9, { duration: 400,easing: Easing.exp })
      );

    }else
    resetPostion();
  },
    [cards, resetPostion]
  );
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

  const handleLike = useCallback(()=>forceSwipe('right'),[forceSwipe]);
  const handleDisLike = useCallback(()=>forceSwipe('left'),[forceSwipe]);

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

  return (
    <View style={styles.container}>
      {cards.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.text}>No more cards</Text>
        </View>
      ) : (
        <>
          {cards.map(renderCard).reverse()}
          <View style={styles.buttoncontainer}>
            <TouchableOpacity style={styles.btn} onPress={handleDisLike}
            >
              <AntDesign name="close" size={25} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleLike}
            >
              <AntDesign name="heart" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
};
export default index;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttoncontainer: {
    position: 'absolute',
    bottom: 50,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    elevation: 5,
    backgroundColor: 'white',
  }

}
)

// import { Dimensions, View, Text, StyleSheet, TouchableOpacity, PanResponder } from "react-native";
// import React, { useCallback, useRef, useState, useEffect } from 'react';
// import axios from 'axios';  // Import axios for making HTTP requests
// import { AntDesign } from "@expo/vector-icons";
// import CardView from "@/components/CardView";
// import { runOnJS, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";
// import { Card } from "@/animation/data/data";

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
// const SWIPE_OUT_DURATION = 250;
// const RESET_DuraTION = 300;

// // Create a type for the quote data
// interface Quote {
//   id: number;
//   text: string;
//   author: string;
//   color: string;
//   image: string;
// }

// const index = () => {
//   const [cards, setCards] = useState<Quote[]>([]);  // State to store the fetched quotes
//   const translateX = useSharedValue(0);
//   const translateY = useSharedValue(0);
//   const dummyTranslate = useSharedValue(0);
//   const nextCardScale = useSharedValue(0.9);

//   // Function to reset the position of the card
//   const resetPostion = useCallback(() => {
//     translateX.value = withTiming(0, { duration: RESET_DuraTION });
//     translateY.value = withTiming(0, { duration: RESET_DuraTION });
//     nextCardScale.value = withTiming(0.9, { duration: RESET_DuraTION });
//   }, []);

//   // Fetch quotes from the API when the component mounts
//   useEffect(() => {
//     const fetchQuotes = async () => {
//       try {
//         // Make an API call to fetch quotes
//         const response = await axios.get('https://qapi.vercel.app/api/quotes');
//         const quotes = response.data;

//         // Map the fetched data into the structure used in your component
//         const formattedQuotes = quotes.map((quote: any, index: number) => ({
//           id: quote.id,
//           text: quote.quote,
//           author: quote.author,
//           color: '#FF7F50', // Set any color you prefer or randomize
//           image: 'https://via.placeholder.com/150', // Set any image URL or use default image
//         }));

//         // Update the state with the formatted quotes
//         setCards(formattedQuotes);
//       } catch (error) {
//         console.error("Error fetching quotes:", error);
//       }
//     };

//     fetchQuotes();
//   }, []);

//   const onSwipeComplete = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
//     const action = direction === 'left' ? 'dislike' : 'like';
//     console.log(cards); 
//     console.log(`Swiped ${action}`,action,cards[0].text);

//     if(cards.length >0) {
//       setCards(pre => pre.slice(1));
//       translateX.value=0;
//       translateY.value=0;
//       nextCardScale.value=0.8;
//       nextCardScale.value=withDelay(
//         100, 
//         withTiming(0.9, { duration: 400,easing: Easing.exp })
//       );

//     }else
//     resetPostion();
//   },
//     [cards, resetPostion]
//   );
//   const forceSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
//     const swipeConfig = {
//       left: { x: -SCREEN_WIDTH * 1.5, y: 0 },
//       right: { x: SCREEN_WIDTH * 1.5, y: 0 },
//       up: { x: 0, y: -SCREEN_HEIGHT * 1.5 },
//       down: { x: 0, y: SCREEN_HEIGHT * 1.5 },
//     };
//     translateX.value = withTiming(swipeConfig[direction].x, {
//       duration: SWIPE_OUT_DURATION
//     });
//     translateY.value = withTiming(swipeConfig[direction].y, {
//       duration: SWIPE_OUT_DURATION
//     }, () => runOnJS(onSwipeComplete)(direction),
//     );

//   }, [],);

//   const handleLike = useCallback(()=>forceSwipe('right'),[forceSwipe]);
//   const handleDisLike = useCallback(()=>forceSwipe('left'),[forceSwipe]);

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: (_, gesture) => {
//         translateX.value = gesture.dx;
//         translateY.value = gesture.dy;
//         const dragDistance = Math.sqrt(gesture.dx ** 2 + gesture.dy ** 2);
//         const progress = Math.min(dragDistance / SCREEN_WIDTH, 1);
//         nextCardScale.value = 0.9 + 0.1 * progress;
//       },
//       onPanResponderRelease: (_, gesture) => {
//         const adsDx = Math.abs(gesture.dx);
//         const absDy = Math.abs(gesture.dy);
//         if (absDy > adsDx) {
//           if (gesture.dy < -SWIPE_THRESHOLD) {
//             forceSwipe('up');
//           }
//           else if (gesture.dy > SWIPE_THRESHOLD) {
//             forceSwipe('down');
//           } else {
//             resetPostion();

//           }
//         } else {
//           if (gesture.dx > SWIPE_THRESHOLD) {
//             forceSwipe('right');
//           }
//           else if (gesture.dx < -SWIPE_THRESHOLD) {
//             forceSwipe('left');
//           } else {
//             resetPostion();
//           }
//         }

//       },
//       onPanResponderGrant: () => {
//         translateX.value = withTiming(0, { duration: 0 })
//         translateY.value = withTiming(0, { duration: 0 })
//         nextCardScale.value = withTiming(1, { duration: 0 })
//       },
//     })
//   ).current

//   const renderCard = useCallback((card: Card, index: number) => (
//     <CardView
//       key={card.id}
//       card={card}
//       index={index}
//       totalCards={cards.length}
//       panHandlers={index === 0 ? panResponder.panHandlers : {}} // pan
//       nextCardScale={index === 1 ? nextCardScale : dummyTranslate}
//       translateX={index === 0 ? translateX : dummyTranslate}
//       translateY={index === 0 ? translateY : dummyTranslate}
//     />
//   ), [cards.length, panResponder.panHandlers, translateX, translateY, nextCardScale]);
//   return (
//     <View style={styles.container}>
//         <>
//           {cards.map(renderCard).reverse()}
//           <View style={styles.buttoncontainer}>
//             <TouchableOpacity style={styles.btn} onPress={handleDisLike}
//             >
//               <AntDesign name="close" size={25} color="black" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.btn} onPress={handleLike}
//             >
//               <AntDesign name="heart" size={24} color="red" />
//             </TouchableOpacity>
//           </View>
//         </>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttoncontainer: {
//     position: 'absolute',
//     bottom: 50,
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     flexDirection: 'row',
//     width: '100%',
//   },
//   btn: {
//     width: 60,
//     height: 60,
//     borderRadius: 60,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     shadowOpacity: 0.3,
//     elevation: 5,
//     backgroundColor: 'white',
//   }
// });

// export default index;
