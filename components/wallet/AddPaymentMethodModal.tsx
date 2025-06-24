import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, ChevronDown, Check } from 'lucide-react-native';
import Button from '@/components/UI/Button';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { useAuthStore } from '@/stores/useAuthStore';
import { PaymentService } from '@/services/payment';
import type { AvailablePaymentMethod, Bank, FormField, CoinNetwork } from '@/types';

interface AddPaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availablePaymentMethods: AvailablePaymentMethod[];
  walletType: '1' | '2';
}

export default function AddPaymentMethodModal({
  visible,
  onClose,
  onSuccess,
  availablePaymentMethods,
  walletType,
}: AddPaymentMethodModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuthStore();

  const [selectedMethod, setSelectedMethod] = useState<AvailablePaymentMethod | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [coinList, setCoinList] = useState<CoinNetwork[]>([]);
  const [showCoinPicker, setShowCoinPicker] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinNetwork | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setSelectedMethod(null);
      setFormData({});
      setSelectedBank(null);
      setBanks([]);
      setCoinList([]);
      setSelectedCoin(null);
    }
  }, [visible]);

  useEffect(() => {
    if (selectedMethod && selectedMethod.code === 'BANK' && user?.country_id) {
      fetchBanks();
    }
    if (selectedMethod && selectedMethod.code === 'USDT' && user?.token) {
      fetchCoinList();
    }
  }, [selectedMethod, user?.country_id, user?.token]);

  const fetchBanks = async () => {
    if (!user?.token || !user?.country_id) return;

    setIsLoadingBanks(true);
    try {
      const bankList = await PaymentService.getBankList({
        token: user.token,
        country_id: user.country_id,
      });
      setBanks(bankList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load banks');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const fetchCoinList = async () => {
    if (!user?.token) return;
    try {
      const coins = await PaymentService.getCoinList(user.token);
      setCoinList(coins);
    } catch (error) {
      Alert.alert('Error', 'Failed to load coin list');
    }
  };

  const handleMethodSelect = (method: AvailablePaymentMethod) => {
    setSelectedMethod(method);
    setFormData({});
    setSelectedBank(null);
    setSelectedCoin(null);
  };

  const handleInputChange = (fieldCode: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldCode]: value,
    }));
  };

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setFormData(prev => ({
      ...prev,
      bank_id: bank.bank_id.toString(),
    }));
    setShowBankPicker(false);
  };

  const handleCoinSelect = (coin: CoinNetwork) => {
    setSelectedCoin(coin);
    setFormData(prev => ({
      ...prev,
      coin_id: coin.bank_id.toString(),
    }));
    setShowCoinPicker(false);
  };

  const validateForm = () => {
    if (!selectedMethod) return false;

    for (const field of selectedMethod.form_list) {
      if (field.code === 'bank_id' && selectedMethod.code === 'BANK') {
        if (!selectedBank) return false;
      } else {
        if (!formData[field.code]?.trim()) return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.token) return;

    setIsLoading(true);
    try {
      // Here you would call the API to add the payment method
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Success',
        'Payment method added successfully',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormField = (field: FormField) => {
    if (field.code === 'bank_id' && selectedMethod?.code === 'USDT') {
      return (
        <View key={field.code} style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {field.name}
          </Text>
          <TouchableOpacity
            style={[
              styles.bankSelector,
              {
                backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowCoinPicker(true)}
          >
            {selectedCoin ? (
              <View style={styles.selectedBankContainer}>
                <Text style={[styles.selectedBankText, { color: colors.text }]}>
                  {selectedCoin.name}
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                {field.placeholder}
              </Text>
            )}
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      );
    }

    if (field.code === 'bank_id' && selectedMethod?.code === 'BANK') {
      return (
        <View key={field.code} style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {field.name}
          </Text>
          <TouchableOpacity
            style={[
              styles.bankSelector,
              {
                backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowBankPicker(true)}
          >
            {selectedBank ? (
              <View style={styles.selectedBankContainer}>
                <Image
                  source={{ uri: selectedBank.bank_logo_image }}
                  style={styles.bankLogo}
                  resizeMode="contain"
                />
                <Text style={[styles.selectedBankText, { color: colors.text }]}>
                  {selectedBank.bank_name}
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                {field.placeholder}
              </Text>
            )}
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={field.code} style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          {field.name}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.text,
              backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB',
              borderColor: colors.border,
            },
          ]}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textSecondary}
          value={formData[field.code] || ''}
          onChangeText={(value) => handleInputChange(field.code, value)}
          keyboardType={field.type === 4 ? 'phone-pad' : 'default'}
          maxLength={field.len}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Withdrawal Method
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {!selectedMethod ? (
              // Method Selection
              <View style={styles.methodSelection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Choose Payment Method
                </Text>
                {availablePaymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.payment_id}
                    style={[
                      styles.methodOption,
                      {
                        backgroundColor: method.background_color,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleMethodSelect(method)}
                  >
                    <Image
                      source={{ uri: method.logo_image }}
                      style={styles.methodLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.methodName}>{method.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Form
              <View style={styles.formContainer}>
                <View style={styles.selectedMethodHeader}>
                  <Image
                    source={{ uri: selectedMethod.logo_image }}
                    style={styles.selectedMethodLogo}
                    resizeMode="contain"
                  />
                  <Text style={[styles.selectedMethodName, { color: colors.text }]}>
                    {selectedMethod.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedMethod(null)}
                    style={styles.changeMethodButton}
                  >
                    <Text style={[styles.changeMethodText, { color: colors.primary }]}>
                      Change
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedMethod.form_list
                  .filter(field => !(selectedMethod.code === 'USDT' && field.code === 'account_name'))
                  .sort((a, b) => a.seq - b.seq)
                  .map(renderFormField)}

                <Button
                  title="Add Payment Method"
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={!validateForm()}
                  style={styles.submitButton}
                  fullWidth
                />
              </View>
            )}
          </ScrollView>

          {/* Bank Picker Modal */}
          <Modal
            visible={showBankPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowBankPicker(false)}
          >
            <View style={styles.pickerOverlay}>
              <View style={[styles.pickerContent, { backgroundColor: colors.card }]}>
                <View style={styles.pickerHeader}>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>
                    Select Bank
                  </Text>
                  <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                    <X size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {isLoadingBanks ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Loading banks...
                    </Text>
                  </View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {banks.map((bank) => (
                      <TouchableOpacity
                        key={bank.bank_id}
                        style={[
                          styles.bankOption,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => handleBankSelect(bank)}
                      >
                        <Image
                          source={{ uri: bank.bank_logo_image }}
                          style={styles.bankOptionLogo}
                          resizeMode="contain"
                        />
                        <Text style={[styles.bankOptionName, { color: colors.text }]}>
                          {bank.bank_name}
                        </Text>
                        {selectedBank?.bank_id === bank.bank_id && (
                          <Check size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>

          {/* Coin Picker Modal */}
          <Modal
            visible={showCoinPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCoinPicker(false)}
          >
            <View style={styles.pickerOverlay}>
              <View style={[styles.pickerContent, { backgroundColor: colors.card }]}>
                <View style={styles.pickerHeader}>
                  <Text style={[styles.pickerTitle, { color: colors.text }]}>
                    Select Coin
                  </Text>
                  <TouchableOpacity onPress={() => setShowCoinPicker(false)}>
                    <X size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {coinList.map((coin) => (
                    <TouchableOpacity
                      key={coin.bank_id}
                      style={[styles.bankOption, { borderBottomColor: colors.border }]}
                      onPress={() => handleCoinSelect(coin)}
                    >
                      <Text style={[styles.bankOptionName, { color: colors.text }]}>
                        {coin.name}
                      </Text>
                      {selectedCoin?.bank_id === coin.bank_id && (
                        <Check size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  methodSelection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: Spacing.sm,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.md,
  },
  methodLogo: {
    width: 32,
    height: 32,
  },
  methodName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  formContainer: {
    gap: Spacing.md,
  },
  selectedMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(0, 135, 81, 0.1)',
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  selectedMethodLogo: {
    width: 24,
    height: 24,
    marginRight: Spacing.sm,
  },
  selectedMethodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  changeMethodButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  changeMethodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: Spacing.xs,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
  },
  selectedBankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankLogo: {
    width: 24,
    height: 24,
    marginRight: Spacing.sm,
  },
  selectedBankText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  pickerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  bankOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  bankOptionLogo: {
    width: 32,
    height: 32,
  },
  bankOptionName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
});