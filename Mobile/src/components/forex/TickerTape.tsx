import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { forexStyles } from '../../../assets/styles/forex.styles';

export interface TickerPair {
  pair: string;
  rate: string;
  change: string;
  isPositive: boolean;
}

const DEFAULT_TICKERS: TickerPair[] = [
  { pair: 'USD/ETB', rate: '125.40', change: '+0.35%', isPositive: true },
  { pair: 'EUR/ETB', rate: '136.10', change: '-0.12%', isPositive: false },
  { pair: 'GBP/ETB', rate: '160.25', change: '+0.48%', isPositive: true },
  { pair: 'AED/ETB', rate: '34.14', change: '+0.05%', isPositive: true },
  { pair: 'SAR/ETB', rate: '33.42', change: '-0.08%', isPositive: false },
];

export const TickerTape: React.FC = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    // Only start animating once I know the real widths
    if (contentWidth === 0 || containerWidth === 0) return;

    const scrollDistance = Math.max(contentWidth - containerWidth, 0);
    if (scrollDistance === 0) return; // content fits, nothing to scroll

    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -scrollDistance, // drift left until the last item is visible
          duration: scrollDistance * 25, // scale duration to distance so speed stays consistent
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0, // drift back right to the start
          duration: scrollDistance * 25,
          useNativeDriver: true,
        }),
      ])
    );

    loopAnim.start();

    return () => loopAnim.stop();
  }, [translateX, contentWidth, containerWidth]);

  return (
    <View style={forexStyles.tickerTapeContainer}>
      <View style={forexStyles.tickerTopRow}>
        <View style={forexStyles.nbeBadgeContainer}>
          <View style={forexStyles.pulsingDot} />
          <Text style={forexStyles.nbeBadgeText}>NBE Compliant Rates</Text>
        </View>
        <Text style={forexStyles.lastUpdatedText}>Last update 2 mins ago</Text>
      </View>

      {/* Outer view defines the visible "window" width */}
      <View
        style={forexStyles.tickerScrollView}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [{ translateX }],
            alignSelf: 'flex-start',
          }}
          onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        >
          {DEFAULT_TICKERS.map((item, index) => (
            <View key={index} style={forexStyles.tickerItem}>
              <Text style={forexStyles.tickerPair}>{item.pair}</Text>
              <Text style={forexStyles.tickerRate}>{item.rate}</Text>
              <Text
                style={[
                  forexStyles.changeTag,
                  item.isPositive ? forexStyles.changeTagPositive : forexStyles.changeTagNegative,
                ]}
              >
                {item.change}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};