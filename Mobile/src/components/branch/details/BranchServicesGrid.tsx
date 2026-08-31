import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branchDetailsStyles } from '../../../../assets/styles/branch-details.styles';
import { COLORS } from '../../../../constants/colors';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface BranchServicesGridProps {
  services?: string[];
  selectedService?: string | null;
  onSelectService?: (serviceName: string) => void;
}

/**
 * Maps raw service strings from the database to styled service cards with tailored icons and descriptions
 */
const mapDbServiceToCard = (serviceName: string, index: number): ServiceItem => {
  const lower = serviceName.toLowerCase();

  // 1. VIP & Private Banking
  if (lower.includes('vip') || lower.includes('private') || lower.includes('priority')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Dedicated relationship manager & private lounge',
      icon: <MaterialCommunityIcons name="crown-outline" size={20} color="#D97706" />,
    };
  }

  // 2. Letters of Credit & Trade Finance
  if (lower.includes('letter of credit') || lower.includes('lc') || lower.includes('trade')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Import/export trade finance & commercial L/C',
      icon: <MaterialCommunityIcons name="file-document-edit-outline" size={20} color="#0284C7" />,
    };
  }

  // 3. Bank Guarantees & Bonds
  if (lower.includes('guarantee') || lower.includes('bond') || lower.includes('bid')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Performance bonds, bid bonds & payment guarantees',
      icon: <MaterialCommunityIcons name="shield-check-outline" size={20} color="#059669" />,
    };
  }

  // 4. Forex & Remittance
  if (lower.includes('forex') || lower.includes('exchange') || lower.includes('currency') || lower.includes('retention')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Foreign currency spot buy/sell & diaspora retention',
      icon: <MaterialCommunityIcons name="currency-usd" size={20} color="#0284C7" />,
    };
  }
  if (lower.includes('remittance') || lower.includes('western') || lower.includes('ria') || lower.includes('moneygram')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Western Union, MoneyGram, Ria & Remitly payouts',
      icon: <MaterialCommunityIcons name="send-circle-outline" size={20} color="#0284C7" />,
    };
  }
  if (lower.includes('swift') || lower.includes('wire') || lower.includes('transfer')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Telegraphic wire transfers for imports & education',
      icon: <Ionicons name="globe-outline" size={20} color="#0284C7" />,
    };
  }

  // 5. Cards & Terminals
  if (lower.includes('atm') || lower.includes('debit') || lower.includes('card') || lower.includes('visa') || lower.includes('mastercard')) {
    if (lower.includes('pin') || lower.includes('unblock') || lower.includes('reset')) {
      return {
        id: `service-${index}`,
        title: serviceName,
        description: 'Instant PIN regeneration & credential unlock',
        icon: <MaterialCommunityIcons name="form-textbox-password" size={20} color="#0284C7" />,
      };
    }
    if (lower.includes('pos') || lower.includes('terminal') || lower.includes('merchant')) {
      return {
        id: `service-${index}`,
        title: serviceName,
        description: 'Point of Sale acquiring & machine deployment',
        icon: <MaterialCommunityIcons name="point-of-sale" size={20} color="#0284C7" />,
      };
    }
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Contactless debit card issuance & replacements',
      icon: <MaterialCommunityIcons name="credit-card-plus-outline" size={20} color="#0284C7" />,
    };
  }

  // 6. Cash & Teller
  if (lower.includes('deposit') || lower.includes('fast teller')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'High-speed cash depositing & counter receipts',
      icon: <MaterialCommunityIcons name="cash-fast" size={20} color="#059669" />,
    };
  }
  if (lower.includes('withdrawal') || lower.includes('cash')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Counter cash withdrawals & cheque encashment',
      icon: <MaterialCommunityIcons name="cash-multiple" size={20} color="#0284C7" />,
    };
  }
  if (lower.includes('cheque') || lower.includes('cpo')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Certified payment orders (CPO) & clearing',
      icon: <MaterialCommunityIcons name="checkbook" size={20} color="#0284C7" />,
    };
  }
  if (lower.includes('bill') || lower.includes('tax') || lower.includes('utility')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Electricity, water, ERCA & customs bill payment',
      icon: <MaterialCommunityIcons name="receipt-text-outline" size={20} color="#0284C7" />,
    };
  }
  if (lower.includes('school') || lower.includes('university') || lower.includes('fee')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Tuition deposits & institutional student payments',
      icon: <Ionicons name="school-outline" size={20} color="#0284C7" />,
    };
  }

  // 7. Accounts & Deposits
  if (lower.includes('saving') || lower.includes('account') || lower.includes('opening') || lower.includes('checking') || lower.includes('current')) {
    if (lower.includes('fixed') || lower.includes('term')) {
      return {
        id: `service-${index}`,
        title: serviceName,
        description: 'High-yield term deposit investment contracts',
        icon: <MaterialCommunityIcons name="piggy-bank-outline" size={20} color="#059669" />,
      };
    }
    if (lower.includes('interest-free') || lower.includes('amana') || lower.includes('islamic')) {
      return {
        id: `service-${index}`,
        title: serviceName,
        description: 'Sharia-compliant ethical Islamic banking',
        icon: <MaterialCommunityIcons name="hand-heart-outline" size={20} color="#059669" />,
      };
    }
    if (lower.includes('salary') || lower.includes('payroll')) {
      return {
        id: `service-${index}`,
        title: serviceName,
        description: 'Corporate employee accounts & payroll setup',
        icon: <MaterialCommunityIcons name="badge-account-outline" size={20} color="#0284C7" />,
      };
    }
    if (lower.includes('student') || lower.includes('youth')) {
      return {
        id: `service-${index}`,
        title: serviceName,
        description: 'Subsidized youth & student banking perks',
        icon: <Ionicons name="person-add-outline" size={20} color="#0284C7" />,
      };
    }
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'New Savings, Current Account & KYC onboarding',
      icon: <FontAwesome5 name="university" size={17} color="#0284C7" />,
    };
  }

  // 8. Loans & Financing
  if (lower.includes('mortgage') || lower.includes('home')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Residential property & construction financing',
      icon: <MaterialCommunityIcons name="home-city-outline" size={20} color="#0284C7" />,
    };
  }
  if (lower.includes('vehicle') || lower.includes('auto') || lower.includes('asset')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Automobile & commercial vehicle leasing',
      icon: <MaterialCommunityIcons name="car-outline" size={20} color="#0284C7" />,
    };
  }
  if (lower.includes('loan') || lower.includes('credit') || lower.includes('sme') || lower.includes('agriculture') || lower.includes('advance')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'Personal, SME, trade & agricultural credit lines',
      icon: <MaterialCommunityIcons name="handshake-outline" size={20} color="#0284C7" />,
    };
  }

  // 9. Digital Banking & Tech
  if (lower.includes('digital') || lower.includes('mobile') || lower.includes('app') || lower.includes('internet') || lower.includes('telebirr') || lower.includes('wallet') || lower.includes('gateway') || lower.includes('sms') || lower.includes('alert') || lower.includes('e-commerce')) {
    return {
      id: `service-${index}`,
      title: serviceName,
      description: 'App setup, wallet linkage & digital services',
      icon: <MaterialCommunityIcons name="cellphone-cog" size={20} color="#0284C7" />,
    };
  }

  // 10. Default fallback
  return {
    id: `service-${index}`,
    title: serviceName,
    description: 'Available at branch counter & customer desk',
    icon: <Ionicons name="checkmark-circle-outline" size={20} color="#0284C7" />,
  };
};


const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'default-1',
    title: 'Account Opening',
    description: 'New Savings, Current Account & KYC',
    icon: <FontAwesome5 name="university" size={17} color="#0284C7" />,
  },
  {
    id: 'default-2',
    title: 'ATM Card Request',
    description: 'New ATM Card, PIN Reset & Replacement',
    icon: <MaterialCommunityIcons name="credit-card-plus-outline" size={20} color="#0284C7" />,
  },
  {
    id: 'default-3',
    title: 'Cash Services',
    description: 'Cash Deposit, Withdrawal & Cashier Desk',
    icon: <MaterialCommunityIcons name="cash-multiple" size={20} color="#0284C7" />,
  },
  {
    id: 'default-4',
    title: 'Loan Consultation',
    description: 'Personal Loan, Business & SME Credit',
    icon: <MaterialCommunityIcons name="handshake-outline" size={20} color="#0284C7" />,
  },
  {
    id: 'default-5',
    title: 'Forex Exchange',
    description: 'Foreign Currency Buy/Sell & Remittance',
    icon: <MaterialCommunityIcons name="currency-usd" size={20} color="#0284C7" />,
  },
  {
    id: 'default-6',
    title: 'Digital Banking',
    description: 'App Activation, Telebirr & Internet Banking',
    icon: <MaterialCommunityIcons name="cellphone-cog" size={20} color="#0284C7" />,
  },
];

export const BranchServicesGrid: React.FC<BranchServicesGridProps> = ({
  services,
  selectedService,
  onSelectService,
}) => {
  const serviceCards: ServiceItem[] =
    services && services.length > 0
      ? services.map((s, idx) => mapDbServiceToCard(s, idx))
      : DEFAULT_SERVICES;

  return (
    <View style={branchDetailsStyles.servicesGrid}>
      {serviceCards.map((service) => {
        const isSelected = selectedService === service.title;

        return (
          <TouchableOpacity
            key={service.id}
            style={[
              branchDetailsStyles.serviceCard,
              isSelected && {
                borderColor: '#0A2540',
                borderWidth: 2,
                backgroundColor: '#F0F7FF',
              },
            ]}
            onPress={() => onSelectService && onSelectService(service.title)}
            activeOpacity={0.75}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View
                style={[
                  branchDetailsStyles.serviceIconWrap,
                  isSelected && { backgroundColor: '#DBEAFE' },
                ]}
              >
                {service.icon}
              </View>

              {isSelected && (
                <View
                  style={{
                    backgroundColor: '#0A2540',
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text
              style={[
                branchDetailsStyles.serviceTitle,
                isSelected && { color: '#0A2540', fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {service.title}
            </Text>
            <Text style={branchDetailsStyles.serviceDescription} numberOfLines={2}>
              {service.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BranchServicesGrid;
