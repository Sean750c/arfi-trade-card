import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Search, Filter, Star, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import Card from '@/components/UI/Card';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';

// Sample gift card rates data
const ratesData = [
  {
    id: '1',
    name: 'iTunes US',
    category: 'Apple',
    denominations: '$50-$100',
    rate: '₦610/$1',
    isPromoted: true,
  },
  {
    id: '2',
    name: 'Amazon US',
    category: 'Amazon',
    denominations: '$25-$500',
    rate: '₦605/$1',
    isPromoted: false,
  },
  {
    id: '3',
    name: 'Steam',
    category: 'Gaming',
    denominations: '$20-$100',
    rate: '₦620/$1',
    isPromoted: true,
  },
  {
    id: '4',
    name: 'Google Play US',
    category: 'Google',
    denominations: '$10-$200',
    rate: '₦590/$1',
    isPromoted: false,
  },
  {
    id: '5',
    name: 'Sephora',
    category: 'Retail',
    denominations: '$25-$100',
    rate: '₦580/$1',
    isPromoted: false,
  },
];

// Categories for filter
const categories = [
  'All',
  'Apple',
  'Amazon',
  'Gaming',
  'Google',
  'Retail',
];

export default function RatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredRates, setFilteredRates] = useState(ratesData);
  
  useEffect(() => {
    let result = ratesData;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.rate.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter((item) => item.category === selectedCategory);
    }
    
    setFilteredRates(result);
  }, [searchQuery, selectedCategory]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Exchange Rates</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Current gift card rates
          </Text>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' },
          ]}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search gift cards"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colorScheme === 'dark' ? colors.card : '#F9FAFB' },
          ]}
        >
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryItem,
                {
                  backgroundColor:
                    selectedCategory === item
                      ? colors.primary
                      : colorScheme === 'dark'
                      ? colors.card
                      : '#F9FAFB',
                },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: selectedCategory === item ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      <FlatList
        data={filteredRates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.rateCard}>
            <View style={styles.rateCardHeader}>
              <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
              {item.isPromoted && (
                <View style={[styles.promotedBadge, { backgroundColor: Colors[colorScheme].secondary }]}>
                  <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.promotedText}>Best Rate</Text>
                </View>
              )}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.rateDetails}>
              <View style={styles.rateDetailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Category
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {item.category}
                </Text>
              </View>
              <View style={styles.rateDetailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Denominations
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {item.denominations}
                </Text>
              </View>
              <View style={styles.rateDetailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Rate
                </Text>
                <Text
                  style={[
                    styles.rateValue,
                    {
                      color: item.isPromoted ? colors.primary : colors.text,
                      fontFamily: item.isPromoted ? 'Inter-Bold' : 'Inter-SemiBold',
                    },
                  ]}
                >
                  {item.rate}
                </Text>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.ratesList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: Spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: Spacing.sm,
    height: '100%',
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  categoriesContainer: {
    marginBottom: Spacing.md,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
  },
  categoryItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  ratesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  rateCard: {
    marginBottom: Spacing.md,
  },
  rateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promotedText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
    marginLeft: 2,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.sm,
  },
  rateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateDetailItem: {},
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  rateValue: {
    fontSize: 14,
  },
});