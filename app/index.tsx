import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

// process.env를 타이핑하면 EXPO_PUBLIC_AIR_QUALITY_API_KEY가 자동 완성됩니다.
const API_KEY = process.env.EXPO_PUBLIC_AIR_QUALITY_API_KEY;
const API_URL = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty";

if (!API_KEY) {
  console.warn("⚠️ [경고] EXPO_PUBLIC_AIR_QUALITY_API_KEY 환경변수가 정의되지 않았습니다.");
}

interface AirKoreaV15Item {
  stationName: string;
  sidoName: string;
  dataTime: string;
  khaiValue: string;
  khaiGrade: string;
  pm25Value: string;
  pm10Value: string;
  coValue: string;
  o3Value: string;
  no2Value: string;
  so2Value: string;
  
  // 등급별 판단 플래그 예외 처리를 위한 필드 추가
  pm10Grade1h: string;
  pm25Grade1h: string;
}

const extractXmlTagValue = (xmlString: string, tagName: string): string => {
  const regex = new RegExp(`<${tagName}>([^<]*)</${tagName}>`);
  const match = xmlString.match(regex);
  return match && match[1] ? match[1].trim() : '-';
};

export default function AirQualityDashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [airData, setAirData] = useState<AirKoreaV15Item | null>(null);

  const { t } = useTranslation();

  // 대기질 상태 텍스트를 다국어 파일 매핑용 키로 변환하는 예시 함수
  const getStatusTranslationKey = (status: string) => {
    if (status === '보통') return 'status_normal';
    if (status === '좋음') return 'status_good';
    return 'status_bad';
  };

  // 1. 등급값(1, 2, 3, 4)에 따른 색상 및 메세지 마스터 매핑
  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case '1':
        return { label: '좋음', color: '#2ecc71', bg: 'bg-green-50', text: 'text-green-700', rec: '대기질이 양호합니다. 마음껏 실외 활동을 즐기세요.' };
      case '2':
        return { label: '보통', color: '#f1c40f', bg: 'bg-[#f9f3e3]', text: 'text-[#3a3126]', rec: '민감군은 장시간 야외활동을 줄이세요.' };
      case '3':
        return { label: '나쁨', color: '#e67e22', bg: 'bg-orange-50', text: 'text-orange-700', rec: '무리한 실외 활동을 피하고 마스크를 착용하세요.' };
      case '4':
        return { label: '매우나쁨', color: '#e74c3c', bg: 'bg-red-50', text: 'text-red-700', rec: '실외 활동을 금지하고 실내에 머무르세요.' };
      default:
        return { label: '점검중', color: '#aeaea3', bg: 'bg-gray-100', text: 'text-gray-600', rec: '측정소 기기 점검 또는 통신 장애 상태입니다.' };
    }
  };

  // 2. 데이터가 점검중('-')이거나 공백일 때 안전하게 받아주는 값 헬퍼
  const renderValue = (value: string, unit: string) => {
    if (!value || value === '-' || isNaN(Number(value))) {
      return '점검중';
    }
    return `${value} ${unit}`;
  };

  const fetchLiveAirData = async () => {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      Alert.alert("환경 변수 누락", ".env 파일의 API 키 설정을 확인해주세요.");
      return;
    }

    setLoading(true);
    const queryParams = new URLSearchParams({
      sidoName: '서울',
      pageNo: '1',
      numOfRows: '10',
      returnType: 'xml',
      serviceKey: API_KEY,
      ver: '1.5' 
    });

    try {
      const response = await fetch(`${API_URL}?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);

      const responseText = await response.text();
      const resultCode = extractXmlTagValue(responseText, 'resultCode');

      if (resultCode !== '00') {
        throw new Error(`API 에러 코드: ${resultCode}`);
      }

      const itemMatch = responseText.match(/<item>([\s\S]*?)<\/item>/);
      if (!itemMatch) throw new Error("데이터 항목이 없습니다.");
      
      const firstItemXml = itemMatch[1];

      setAirData({
        stationName: extractXmlTagValue(firstItemXml, 'stationName'),
        sidoName: extractXmlTagValue(firstItemXml, 'sidoName'),
        dataTime: extractXmlTagValue(firstItemXml, 'dataTime'),
        khaiValue: extractXmlTagValue(firstItemXml, 'khaiValue'),
        khaiGrade: extractXmlTagValue(firstItemXml, 'khaiGrade'),
        pm25Value: extractXmlTagValue(firstItemXml, 'pm25Value'),
        pm10Value: extractXmlTagValue(firstItemXml, 'pm10Value'),
        coValue: extractXmlTagValue(firstItemXml, 'coValue'),
        o3Value: extractXmlTagValue(firstItemXml, 'o3Value'),
        no2Value: extractXmlTagValue(firstItemXml, 'no2Value'),
        so2Value: extractXmlTagValue(firstItemXml, 'so2Value'),
        pm10Grade1h: extractXmlTagValue(firstItemXml, 'pm10Grade1h'),
        pm25Grade1h: extractXmlTagValue(firstItemXml, 'pm25Grade1h'),
      });

    } catch (error: any) {
      console.error(error);
      Alert.alert("조회 실패", error.message || "네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAirData();
  }, []);

  if (loading && !airData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#f1c40f" />
        <Text className="text-gray-400 text-[13px] mt-3">실시간 대기질 수신 중...</Text>
      </View>
    );
  }

  // 디폴트 데이터 구조 가드
  const rawData = airData || {
    stationName: '-', sidoName: '-', dataTime: '-',
    khaiValue: '-', khaiGrade: '-', pm25Value: '-', pm10Value: '-',
    coValue: '-', o3Value: '-', no2Value: '-', so2Value: '-',
    pm10Grade1h: '-', pm25Grade1h: '-'
  };

  // 대기환경지수 상태에 따른 스타일 정의 적용
  const mainStyle = getGradeStyle(rawData.khaiGrade);
  const pm10Style = getGradeStyle(rawData.pm10Grade1h);
  const pm25Style = getGradeStyle(rawData.pm25Grade1h);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. 언어 선택 메뉴 컴포넌트 추가 */}
      <LanguageSelector />

      {/* 2. 고정 문자열을 t('키값') 형태로 교체 */}
      <Text style={styles.title}>{t('title')}</Text>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} className="bg-gray-50 p-5">
        <View className="w-full max-w-[390px] rounded-[24px] bg-white p-6 shadow-sm flex flex-col">
          
          {/* 상단 헤더 (실제 측정소 정보 바인딩) */}
          <View className="mb-6">
            <Text className="text-[18px] font-bold text-gray-900 tracking-tight">
              {rawData.sidoName ? `${rawData.sidoName} ${rawData.stationName}` : '측정소 연결 대기'}
            </Text>
            <Text className="text-[12px] text-gray-400 mt-0.5">발표 시각: {rawData.dataTime}</Text>
          </View>

          {/* 중앙 통합대기지수 (KhaiValue) 서클 인디케이터 */}
          <View className="flex flex-col items-center mb-6">
            <View style={{ backgroundColor: mainStyle.color }} className="w-[180px] h-[180px] rounded-full flex flex-col justify-center items-center shadow-md z-10">
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  {/* 점검중일 경우 대시(-) 혹은 상태 문자 표출 */}
                  <Text className="text-[54px] font-extrabold text-white leading-none mb-1">
                    {rawData.khaiValue === '-' ? '점검' : rawData.khaiValue}
                  </Text>
                  <Text className="text-[16px] font-semibold text-white opacity-90">{mainStyle.label}</Text>
                </>
              )}
            </View>
            <View className="-mt-7 bg-white rounded-full p-2 z-20 flex items-center justify-center" style={{ shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
              <Ionicons name="location" size={24} color={mainStyle.color} />
            </View>
          </View>

          {/* PM2.5 / PM10 그리드 컴포넌트 (개별 등급 색상 배지 추가) */}
          <View className="flex flex-row gap-4 mb-4">
            {/* PM2.5 카드 */}
            <View className="flex-1 border border-gray-100 rounded-[16px] p-4 items-center bg-white relative overflow-hidden">
              <View className="flex-row items-center gap-1.5 mb-2">
                <Text className="text-[13px] font-medium text-gray-400">PM2.5</Text>
                {rawData.pm25Grade1h !== '-' && (
                  <View style={{ backgroundColor: pm25Style.color }} className="px-1.5 py-0.5 rounded-full">
                    <Text className="text-[9px] font-bold text-white">{pm25Style.label}</Text>
                  </View>
                )}
              </View>
              <Text className="text-[24px] font-bold text-gray-900 mb-1">
                {rawData.pm25Value === '-' ? '점검중' : rawData.pm25Value}
              </Text>
              <Text className="text-[11px] text-gray-400">㎍/微</Text>
            </View>

            {/* PM10 카드 */}
            <View className="flex-1 border border-gray-100 rounded-[16px] p-4 items-center bg-white relative overflow-hidden">
              <View className="flex-row items-center gap-1.5 mb-2">
                <Text className="text-[13px] font-medium text-gray-400">{t('PM10')}</Text>
                {rawData.pm10Grade1h !== '-' && (
                  <View style={{ backgroundColor: pm10Style.color }} className="px-1.5 py-0.5 rounded-full">
                    <Text className="text-[9px] font-bold text-white">{t(getStatusTranslationKey('{pm10Style.label}'))}</Text>
                  </View>
                )}
              </View>
              <Text className="text-[24px] font-bold text-gray-900 mb-1">
                {rawData.pm10Value === '-' ? '점검중' : rawData.pm10Value}
              </Text>
              <Text className="text-[11px] text-gray-400">㎍/微</Text>
            </View>
          </View>

          {/* ver 1.5 가스성분 데이터 매핑 (소수점 자릿수 유지 안전 렌더링) */}
          <View className="border border-gray-100 rounded-[16px] p-4 mb-5 bg-gray-50/50">
            <Text className="text-[12px] font-bold text-gray-500 mb-3">기타 대기 오염 물질 (ver 1.5 실시간)</Text>
            <View className="flex flex-row flex-wrap justify-between gap-y-3">
              <View className="w-[48%] flex-row justify-between border-b border-gray-100/70 pb-1">
                <Text className="text-[12px] text-gray-400">오존(O₃)</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{renderValue(rawData.o3Value, 'ppm')}</Text>
              </View>
              <View className="w-[48%] flex-row justify-between border-b border-gray-100/70 pb-1">
                <Text className="text-[12px] text-gray-400">이산화질소</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{renderValue(rawData.no2Value, 'ppm')}</Text>
              </View>
              <View className="w-[48%] flex-row justify-between">
                <Text className="text-[12px] text-gray-400">일산화탄소</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{renderValue(rawData.coValue, 'ppm')}</Text>
              </View>
              <View className="w-[48%] flex-row justify-between">
                <Text className="text-[12px] text-gray-400">아황산가스</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{renderValue(rawData.so2Value, 'ppm')}</Text>
              </View>
            </View>
          </View>

          {/* 건강 권고사항 안내 영역 (오타 수정됨) */}
          <View className={`rounded-[16px] p-5 mb-6 ${mainStyle.bg}`}>
            <Text className={`text-[14px] font-bold mb-2 ${mainStyle.text}`}>건강 권고사항</Text>
            <Text className="text-[13px] text-gray-700 leading-relaxed">{mainStyle.rec}</Text>
          </View>

          {/* 푸터 */}
          <View className="flex flex-row justify-between items-center mt-auto">
            <Text className="text-[11px] text-gray-400">데이터 출처 : 환경부 에어코리아</Text>
            <TouchableOpacity onPress={fetchLiveAirData} disabled={loading} activeOpacity={0.7} className="flex flex-row items-center gap-1.5 border border-gray-200 rounded-[12px] px-3.5 py-2 active:bg-gray-100">
              <Ionicons name="refresh" size={12} color="#48484a" />
              <Text className="text-[12px] font-semibold text-gray-600">새로고침</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  card: { padding: 16, backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 8 }
});