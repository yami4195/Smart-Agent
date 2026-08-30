import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Image,
  FlatList,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { homeStyles } from '../../../assets/styles/home.styles';

export interface SlideItem {
  id: string;
  image: any;
  onPress?: () => void;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    image: require('../../../assets/images/Home1.jpeg'),
  },
  {
    id: '2',
    image: require('../../../assets/images/Home2.jpeg'),
  },
  {
    id: '3',
    image: require('../../../assets/images/Home3.png'),
  },
];

interface HomeImageSliderProps {
  onSlidePress?: (index: number) => void;
  autoPlayInterval?: number;
}

export const HomeImageSlider: React.FC<HomeImageSliderProps> = ({
  onSlidePress,
  autoPlayInterval = 6000,
}) => {
  const { width } = useWindowDimensions();
  // 40 = 20px padding left + 20px padding right in scrollContent
  const slideWidth = width - 40;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);
  const isInteractingRef = useRef<boolean>(false);

  // Handle scroll events to update pagination dots
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / slideWidth);
      if (index >= 0 && index < SLIDES.length && index !== activeIndex) {
        setActiveIndex(index);
      }
    },
    [slideWidth, activeIndex]
  );

  // Auto-advance slides periodically
  useEffect(() => {
    if (SLIDES.length <= 1) return;

    const timer = setInterval(() => {
      if (isInteractingRef.current) return;

      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SLIDES.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * slideWidth,
          animated: true,
        });
        return nextIndex;
      });
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slideWidth, autoPlayInterval]);

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToOffset({
      offset: index * slideWidth,
      animated: true,
    });
  };

  const renderItem = ({ item, index }: { item: SlideItem; index: number }) => (
    <TouchableOpacity
      style={[homeStyles.sliderImageWrapper, { width: slideWidth }]}
      onPress={() => onSlidePress?.(index)}
      activeOpacity={0.9}
    >
      <Image source={item.image} style={homeStyles.sliderImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  return (
    <View style={homeStyles.sliderContainer}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={() => {
          isInteractingRef.current = true;
        }}
        onTouchEnd={() => {
          isInteractingRef.current = false;
        }}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      <View style={homeStyles.paginationContainer}>
        {SLIDES.map((_, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={index}
              onPress={() => handleDotPress(index)}
              hitSlop={8}
              style={[
                homeStyles.paginationDot,
                isActive && homeStyles.paginationDotActive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

export default HomeImageSlider;
