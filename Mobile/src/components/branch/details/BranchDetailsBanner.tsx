import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  Animated,
  Modal,
  StatusBar,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { branchDetailsStyles } from '../../../../assets/styles/branch-details.styles';

const PLACEHOLDER_BANNER = 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?q=80&w=1200&auto=format&fit=crop';

interface BranchDetailsBannerProps {
  imageSource?: ImageSourcePropType | string;
  scrollY?: Animated.Value;
  expandBadgeTop?: number;
}

export const BranchDetailsBanner: React.FC<BranchDetailsBannerProps> = ({
  imageSource,
  scrollY,
  expandBadgeTop = 50,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const source = typeof imageSource === 'string'
    ? { uri: imageSource }
    : imageSource || { uri: PLACEHOLDER_BANNER };

  // Smooth stretchy expansion when user scrolls/pulls down (scrollY < 0)
  const scale = scrollY
    ? scrollY.interpolate({
        inputRange: [-200, 0],
        outputRange: [2, 1],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
      })
    : 1;

  const translateY = scrollY
    ? scrollY.interpolate({
        inputRange: [-200, 0],
        outputRange: [-100, 0],
        extrapolate: 'clamp',
      })
    : 0;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setModalVisible(true)}
        style={branchDetailsStyles.bannerContainer}
      >
        <Animated.Image
          source={source}
          style={[
            branchDetailsStyles.bannerImage,
            {
              transform: [{ translateY }, { scale }],
            },
          ]}
          resizeMode="cover"
        />
        <View style={branchDetailsStyles.bannerOverlay} />

        {/* View Full Photo Floating Badge */}
        <View style={[branchDetailsStyles.expandBadge, { top: expandBadgeTop }]}>
          <Ionicons name="expand-outline" size={13} color="#FFFFFF" />
          <Text style={branchDetailsStyles.expandBadgeText}>Full Photo</Text>
        </View>
      </TouchableOpacity>

      {/* Full-Screen Uncropped Photo Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={branchDetailsStyles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          <TouchableOpacity
            style={branchDetailsStyles.modalCloseBtn}
            onPress={() => setModalVisible(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Image
            source={source}
            style={branchDetailsStyles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </>
  );
};
