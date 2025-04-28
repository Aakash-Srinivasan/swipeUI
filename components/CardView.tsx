import { View, Text, Dimensions, StyleSheet, Image, ImageBackground } from 'react-native'
import React, { FC, memo, useEffect } from 'react'
import { Card } from '@/animation/data/data'
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

interface CardProps {
    card: Card;
    index: number;
    totalCards: number;
    panHandlers: any;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
    nextCardScale: SharedValue<number>;
}
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ROTATION_RANGE = 15;
const CardView: FC<CardProps> = ({ card, index, totalCards, panHandlers, translateX, translateY, nextCardScale }) => {
    const isTopCard = index === 0;
    const isSecondCard = index === 1;
    const leftOffset = useSharedValue(0);
    const cardScale = useSharedValue(isTopCard ? 1 : isSecondCard ? 0.9 : 0.8)
    const cardOpacity = useSharedValue(isTopCard ? 1 : isSecondCard ? 0.9 : 0.8)

    useEffect(() => {
        const targetOffset = isTopCard ? 10 : -25;
        leftOffset.value = withTiming(targetOffset, {
            duration: 300,
            easing: Easing.out(Easing.quad),
        });
    }, [index, isTopCard])
    useEffect(() => {
        const targetScale = isTopCard ? 1 : isSecondCard ? 0.8 : 0.;
        cardScale.value = withTiming(targetScale, {
            duration: 300,
            easing: Easing.out(Easing.quad),
        });
        const targetOpacity = isTopCard ? 1 : isSecondCard ? 0.9 : 0.;
        cardOpacity.value = withTiming(targetOpacity, {
            duration: 300,
            easing: Easing.out(Easing.quad),
        });
    }, [index, isTopCard, isSecondCard]);

    const animationStyle = useAnimatedStyle(() => {
        const currentX = isTopCard ? translateX.value : 0;
        const currentY = isTopCard ? translateY.value : 0;

        const rotate = interpolate(
            currentX,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-ROTATION_RANGE, 0, ROTATION_RANGE],
            Extrapolation.CLAMP,
        );
        const opacity = interpolate(
            Math.sqrt(currentX ** 2 + currentY ** 2),
            [0, SCREEN_WIDTH * 0.5],
            [1, 0],
            Extrapolation.CLAMP,
        );

        const scale = isTopCard ? 1 : isSecondCard ? nextCardScale.value : 0.8
        return {
            transform: [
                { translateX: currentX + leftOffset.value },
                { translateY: currentY },
                { rotate: `${rotate}deg` },
                { scale }
            ],
            opacity: isTopCard ? opacity : cardOpacity.value,
            zIndex: totalCards - index,
        }
    })
    return (
        <Animated.View style={[styles.card, animationStyle]} {...panHandlers}>
            <ImageBackground source={{ uri: card.image }} style={styles.image} resizeMode="cover">
                <View style={styles.footer}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardAge}>{card.age} years old</Text>
                    <Text style={styles.cardBio}>{card.bio}</Text>
                </View>
            </ImageBackground>
        </Animated.View>
    )
}

export default memo(CardView)
const styles = StyleSheet.create({
    card: {
        width: SCREEN_WIDTH * 0.8,
        height: SCREEN_HEIGHT * 0.7,
        backgroundColor: 'white',
        borderRadius: 15,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: 0.25,
        elevation: 5,
        overflow: 'hidden',
        justifyContent:'center',
        alignItems:'center',
    },
    
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        // justifyContent: 'center', // <-- add this
        // alignItems: 'center',     // <-- add this
    },
    footer: {
        // backgroundColor:'red',
        padding: 20,
        alignSelf:'center',
    },
    cardName: {
        fontSize: 24,
        fontFamily: 'font',
        color: 'white',
    },
    cardAge: {
        fontFamily: 'font',
        color: '#fff',
        marginBottom: 5,
    },
    cardBio: {
        color: '#fff',
        fontFamily: 'font',
        fontSize: 14,
    },
})
