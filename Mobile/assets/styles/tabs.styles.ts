import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white, // Requirement I: White tab bar to match screen
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
