import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Animated } from 'react-native';
import { forexStyles } from '../../../assets/styles/forex.styles';
import { ForexRate } from '../../api/forexApi';

export interface TickerPair {
  pair: string;
  rate: string;
  change: string;
  isPositive: boolean;
}

interface TickerTapeProps {
  rates?: ForexRate[];
  lastUpdated?: string | Date;
}

function formatRelativeTime(dateInput?: string | Date): string {
  if (!dateInput) return 'Updated live';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Guard against slight negative diff due to client-server clock drift
    if (diffMs <= 0) return 'Updated just now';

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Updated just now';
    if (diffMins === 1) return 'Updated 1 min ago';
    if (diffMins < 60) return `Updated ${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Updated 1 hour ago';
    if (diffHours < 24) return `Updated ${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Updated 1 day ago';
    return `Updated ${diffDays} days ago`;
  } catch {
    return 'Updated live';
  }
}

export const TickerTape: React.FC<TickerTapeProps> = ({ rates = [], lastUpdated }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const tickers: TickerPair[] = useMemo(() => {
    if (!rates || rates.length === 0) return [];
    // Prioritize major currencies or show all
    const list = rates.filter((r) => r.isMajor).length > 0 ? rates.filter((r) => r.isMajor) : rates;
    return list.map((item) => ({
      pair: `${item.currencyCode}/ETB`,
      rate: item.cashBuy,
      change: item.change24h,
      isPositive: item.isPositive,
    }));
  }, [rates]);

  useEffect(() => {
    // Only start animating once width is known
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
  }, [translateX, contentWidth, containerWidth, tickers]);

  const timeText = useMemo(() => formatRelativeTime(lastUpdated), [lastUpdated]);

  return (
    <View style={forexStyles.tickerTapeContainer}>
      <View style={forexStyles.tickerTopRow}>
        <View style={forexStyles.nbeBadgeContainer}>
          <View style={forexStyles.pulsingDot} />
          <Text style={forexStyles.nbeBadgeText}>NBE Compliant Rates</Text>
        </View>
        <Text style={forexStyles.lastUpdatedText}>{timeText}</Text>
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
          {tickers.length === 0 ? (
            <View style={forexStyles.tickerItem}>
              <Text style={forexStyles.tickerPair}>Connecting live market...</Text>
            </View>
          ) : (
            tickers.map((item, index) => (
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
            ))
          )}
        </Animated.View>
      </View>
    </View>
  );
};