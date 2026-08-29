import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { branchesStyles } from '../../../assets/styles/branches.styles';
import { BranchData } from './BranchCard';
import { COLORS } from '../../../constants/colors';
import { isBranchOpenNow } from '../../utils/openingHours';

interface BranchMapPreviewProps {
  branches: BranchData[];
  selectedBranch?: BranchData | null;
  onSelectBranch?: (branch: BranchData) => void;
  onJoinQueue: (branch: BranchData) => void;
  onViewDetails?: (branch: BranchData) => void;
}

const DEFAULT_COORDS = [
  { latitude: 8.9950, longitude: 38.7850 }, // Bole
  { latitude: 9.0185, longitude: 38.7680 }, // Kazanchis
  { latitude: 9.0350, longitude: 38.7520 }, // Piazza
  { latitude: 9.0108, longitude: 38.7447 }, // Mexico
  { latitude: 9.0280, longitude: 38.7620 }, // Arat Kilo
  { latitude: 9.0200, longitude: 38.8010 }, // Megenagna
  { latitude: 9.0300, longitude: 38.7380 }, // Merkato
  { latitude: 8.9600, longitude: 38.7600 }, // Saris
];

const getBranchCoords = (branch: BranchData, index: number) => {
  if (branch.latitude && branch.longitude) {
    return { latitude: branch.latitude, longitude: branch.longitude };
  }
  return DEFAULT_COORDS[index % DEFAULT_COORDS.length];
};

  export const BranchMapPreview: React.FC<BranchMapPreviewProps> = ({
  branches,
  selectedBranch: propSelectedBranch,
  onSelectBranch,
  onJoinQueue,
  onViewDetails,
}) => {
  const [activeBranch, setActiveBranch] = useState<BranchData | null>(
    propSelectedBranch || (branches.length > 0 ? branches[0] : null)
  );

  useEffect(() => {
    if (propSelectedBranch) {
      setActiveBranch(propSelectedBranch);
    } else if (!activeBranch && branches.length > 0) {
      setActiveBranch(branches[0]);
    }
  }, [propSelectedBranch, branches]);

  const handleMarkerPress = (branch: BranchData) => {
    setActiveBranch(branch);
    if (onSelectBranch) {
      onSelectBranch(branch);
    }
  };

  const initialRegion = {
    latitude: 9.0105,
    longitude: 38.7612,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={branchesStyles.mapWrapper}>
      {/* react-native-maps MapView with OpenStreetMap UrlTile */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={branchesStyles.map}
        initialRegion={initialRegion}
        mapType="none"
        minZoomLevel={4}
        maxZoomLevel={19}
        showsCompass={false}
        toolbarEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor={COLORS.primary}
        loadingBackgroundColor="#E8ECEF"
      >
        {/* OpenStreetMap-based CartoDB Voyager Tile Layer */}
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          minimumZ={1}
          maximumZ={19}
          tileSize={256}
          flipY={false}
          zIndex={-1}
        />

        {/* Branch Markers */}
        {branches.map((branch, index) => {
          const coords = getBranchCoords(branch, index);
          const isSelected = activeBranch?.id === branch.id;

          return (
            <Marker
              key={branch.id}
              coordinate={coords}
              title={branch.name}
              onPress={() => handleMarkerPress(branch)}
            >
              <View
                style={[
                  branchesStyles.customMarkerPin,
                  isSelected && branchesStyles.customMarkerPinActive,
                ]}
              >
                <FontAwesome5
                  name="university"
                  size={12}
                  color={isSelected ? COLORS.white : COLORS.primary}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Top Map Badge Indicator */}
      <View style={branchesStyles.mapOverlayHeader}>
        <View style={branchesStyles.mapBadge}>
          <FontAwesome5 name="map-marked-alt" size={12} color={COLORS.white} />
          <Text style={branchesStyles.mapBadgeText}>
            {branches.length} {branches.length === 1 ? 'Location' : 'Locations'}
          </Text>
        </View>
      </View>

      {/* Floating Active Branch Popup Overlay Card */}
      {activeBranch && (
        <View style={branchesStyles.mapCardOverlay}>
          {/* Card Title & Close Button */}
          <View style={branchesStyles.mapCardHeader}>
            <Text style={branchesStyles.mapCardTitle} numberOfLines={1}>
              {activeBranch.name}
            </Text>
            <TouchableOpacity
              onPress={() => setActiveBranch(null)}
              style={branchesStyles.mapCardCloseBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Status & Distance Row */}
          {(() => {
            const isOpen = isBranchOpenNow(activeBranch.isOpen, activeBranch.hours);
            return (
              <View style={branchesStyles.mapCardStatusRow}>
                <View
                  style={[
                    branchesStyles.mapCardStatusDot,
                    { backgroundColor: isOpen ? COLORS.success : COLORS.danger },
                  ]}
                />
                <Text
                  style={[
                    branchesStyles.mapCardStatusText,
                    { color: isOpen ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {isOpen ? 'Open' : 'Closed'}
                </Text>
                <Text style={branchesStyles.mapCardDotSeparator}>•</Text>
                <Text style={branchesStyles.mapCardDistanceText}>
                  {activeBranch.distance || '0.8km away'}
                </Text>
              </View>
            );
          })()}

          {/* Queue and Wait Time Metrics */}
          <View style={branchesStyles.mapCardStatsBox}>
            <View style={branchesStyles.mapCardStatCol}>
              <Text style={branchesStyles.mapCardStatLabel}>Queue</Text>
              <Text style={branchesStyles.mapCardStatVal}>
                {activeBranch.waitingCount} waiting
              </Text>
            </View>
            <View style={branchesStyles.mapCardStatDivider} />
            <View style={branchesStyles.mapCardStatCol}>
              <Text style={branchesStyles.mapCardStatLabel}>Est. Wait</Text>
              <Text style={branchesStyles.mapCardStatVal}>
                {activeBranch.estimatedWaitMins} min
              </Text>
            </View>
          </View>

          {/* Action Buttons: Details and Join Queue */}
          <View style={branchesStyles.mapCardActionsRow}>
            <TouchableOpacity
              style={branchesStyles.mapCardDetailsBtn}
              onPress={() =>
                onViewDetails ? onViewDetails(activeBranch) : onJoinQueue(activeBranch)
              }
            >
              <Text style={branchesStyles.mapCardDetailsBtnText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={branchesStyles.mapCardJoinBtn}
              onPress={() => onJoinQueue(activeBranch)}
            >
              <Text style={branchesStyles.mapCardJoinBtnText}>Join Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};