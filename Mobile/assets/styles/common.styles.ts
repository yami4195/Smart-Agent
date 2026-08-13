import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const commonStyles = StyleSheet.create({
  // Container & Page Layouts
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Card Primitives (8-12px rounded corners)
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
    // Subtle shadow for clean depth
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Button Primitives (8-12px radius)
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: 24, // Pill or rounded button
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonSecondary: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // common.styles.ts

buttonOutline: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: COLORS.primary,
  backgroundColor: 'transparent',
},
buttonOutlineText: {
  color: COLORS.primary,
  fontSize: 15,
  fontWeight: '600',
},

buttonText: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 12,
  backgroundColor: 'transparent',
},
buttonTextOnly: {
  color: COLORS.primary,
  fontSize: 15,
  fontWeight: '600',
},

  // Input / TextField Primitives
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },

  // Badge Primitives
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeOpen: {
    backgroundColor: COLORS.badgeOrangeBg,
  },
  badgeOpenText: {
    color: COLORS.badgeOrangeText,
  },

  // Section Headers
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
});
