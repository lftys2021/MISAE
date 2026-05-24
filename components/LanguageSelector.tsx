import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentLanguage.startsWith('ko') && styles.activeButton]}
        onPress={() => changeLanguage('ko')}
      >
        <Text style={[styles.buttonText, currentLanguage.startsWith('ko') && styles.activeText]}>
          KO
        </Text>
      </TouchableOpacity>
      
      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.button, currentLanguage.startsWith('en') && styles.activeButton]}
        onPress={() => changeLanguage('en')}
      >
        <Text style={[styles.buttonText, currentLanguage.startsWith('en') && styles.activeText]}>
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 4,
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeButton: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeText: {
    color: '#000',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
});