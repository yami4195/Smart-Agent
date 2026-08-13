import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const forexStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Top Page Header Bar
  headerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  // 1. Ticker Tape & Compliance Bar
  tickerTapeContainer: {
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  tickerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  nbeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  nbeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tickerScrollView: {
    flexDirection: 'row',
  },
  tickerItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tickerPair: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  tickerRate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  changeTag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeTagPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34D399',
  },
  changeTagNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#F87171',
  },

  // 2. Currency Converter Card
  converterCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  converterTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
  },

  // Rate Type Segmented Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 3,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: COLORS.white,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.navy,
    fontWeight: '700',
  },

  // Input & Select Box
  inputGroup: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  inputGroupLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
    flex: 1,
    padding: 0,
  },
  currencyPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyFlagText: {
    fontSize: 18,
  },
  currencyCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },

  // Swap Button Divider
  swapContainer: {
    alignItems: 'center',
    marginVertical: -4,
    zIndex: 10,
  },
  swapButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Quick Amount Shortcuts
  shortcutContainer: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 14,
  },
  shortcutPill: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shortcutPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  shortcutTextActive: {
    color: COLORS.primary,
  },

  // Detailed Calculation Formula Breakdown Banner
  breakdownBanner: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 12,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: '700',
  },
  breakdownValueOrange: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  // Action Buttons Stack
  actionButtonsStack: {
    gap: 10,
  },
  bookTicketButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bookTicketText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  alertButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
  },
  alertButtonText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '700',
  },

  // 3. Exchange Directory Section & Table
  directoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.navy,
    marginLeft: 8,
  },

  // Filter Tabs
  filterTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },

  // Directory Rate Cards
  rateCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  rateCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },
  currencyInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flagEmojiLarge: {
    fontSize: 24,
  },
  currencyNameBold: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.navy,
  },
  currencyFullName: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  rateCardValuesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  rateValBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  rateValLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  rateValNum: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  convertMiniButton: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
  },
  convertMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // 4. AI Smart Agent Banner
  aiBannerContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  aiIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.aiPurpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
  },
  aiBannerBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // 5. Rate Alert Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
  },
  modalCloseButton: {
    padding: 4,
  },
});
