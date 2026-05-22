import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; 

// 1. 버전 1.5 응답 스펙(소수점 확대 및 가스류 추가)을 반영한 인터페이스
interface AirKoreaVersion15Item {
  stationName: string;
  sidoName: string;
  dataTime: string;
  khaiValue: string;
  khaiGrade: string;
  pm25Value: string;
  pm10Value: string;
  // 버전 1.5 핵심: 소수점 자리가 확대된 가스류 항목들 (string 타입으로 수신 후 표출)
  coValue: string;   // 일산화탄소 (소수점 2자리)
  o3Value: string;   // 오존 (소수점 4자리)
  no2Value: string;  // 이산화질소 (소수점 4자리)
  so2Value: string;  // 아황산가스 (소수점 4자리)
  
  // UI 바인딩용 확장 필드
  aqiLabel: string;
  aqiColor: string;
  recommendation: string;
}

export default function AirQualityDashboard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [airData, setAirData] = useState<AirKoreaVersion15Item>({
    stationName: '금천구',
    sidoName: '서울',
    dataTime: '2020-11-25 11:00',
    khaiValue: '78',
    khaiGrade: '2',
    pm25Value: '42',
    pm10Value: '60',
    coValue: '0.80',      // 버전 1.5 기준 (소수점 2자리)
    o3Value: '0.0062',    // 버전 1.5 기준 (소수점 4자리)
    no2Value: '0.0471',   // 버전 1.5 기준 (소수점 4자리)
    so2Value: '0.0054',   // 버전 1.5 기준 (소수점 4자리)
    aqiLabel: '보통',
    aqiColor: '#f1c40f',
    recommendation: '민감군은 장시간 야외활동을 줄이세요.'
  });

  // 등급 파싱 함수 (1:좋음, 2:보통, 3:나쁨, 4:매우나쁨)
  const parseGrade = (grade: string) => {
    switch (grade) {
      case '1':
        return { label: '좋음', color: '#2ecc71', rec: '대기질이 양호합니다. 마음껏 실외 활동을 즐기세요.' };
      case '2':
        return { label: '보통', color: '#f1c40f', rec: '민감군은 장시간 야외활동을 줄이세요.' };
      case '3':
        return { label: '나쁨', color: '#e67e22', rec: '무리한 실외 활동을 피하고 마스크를 착용하세요.' };
      case '4':
        return { label: '매우나쁨', color: '#e74c3c', rec: '실외 활동을 금지하고 실내 머무름을 권장합니다.' };
      default:
        return { label: '점검중', color: '#aeaea3', rec: '측정소 장비 점검 중입니다.' };
    }
  };

  // 데이터 가져오기 시뮬레이션 (버전 1.5 스펙 데이터 반영)
  const fetchAirKoreaV15Data = () => {
    setLoading(true);
    setTimeout(() => {
      const mockV15Item = {
        stationName: '금천구',
        sidoName: '서울',
        dataTime: '2020-11-25 11:00',
        khaiValue: '78',
        khaiGrade: '2',
        pm25Value: '42',
        pm10Value: '60',
        coValue: '0.82',      // 소수점 2자리 확대 변경 적용
        o3Value: '0.0058',    // 소수점 4자리 확대 변경 적용
        no2Value: '0.0469',   // 소수점 4자리 확대 변경 적용
        so2Value: '0.0044',   // 소수점 4자리 확대 변경 적용
      };

      const status = parseGrade(mockV15Item.khaiGrade);

      setAirData({
        ...mockV15Item,
        aqiLabel: status.label,
        aqiColor: status.color,
        recommendation: status.rec
      });
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchAirKoreaV15Data();
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        className="bg-gray-50 p-5"
      >
        {/* 메인 카드 컨테이너 */}
        <View className="w-full max-w-[390px] rounded-[24px] bg-white p-6 shadow-sm flex flex-col">
          
          {/* 헤더 영역 */}
          <View className="mb-6">
            <Text className="text-[18px] font-bold text-gray-900 tracking-tight">
              {airData.sidoName} {airData.stationName}
            </Text>
            <Text className="text-[12px] text-gray-400 mt-0.5">
              측정일시: {airData.dataTime} (ver 1.5)
            </Text>
          </View>

          {loading ? (
            <View className="h-[236px] justify-center items-center">
              <ActivityIndicator size="large" color="#f1c40f" />
              <Text className="text-gray-400 text-[13px] mt-2">v1.5 고정밀 데이터 분석 중...</Text>
            </View>
          ) : (
            /* 중앙 서클 인디케이터 */
            <View className="flex flex-col items-center mb-6">
              <View 
                style={{ backgroundColor: airData.aqiColor }}
                className="w-[180px] h-[180px] rounded-full flex flex-col justify-center items-center shadow-md z-10"
              >
                <Text className="text-[54px] font-extrabold text-white leading-none mb-1">
                  {airData.khaiValue}
                </Text>
                <Text className="text-[16px] font-semibold text-white opacity-90">
                  {airData.aqiLabel}
                </Text>
              </View>
              
              {/* 위치 핀 배치 */}
              <View 
                className="-mt-7 bg-white rounded-full p-2 z-20 flex items-center justify-center"
                style={{
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="location" size={24} color={airData.aqiColor} />
              </View>
            </View>
          )}

          {/* 메인 미세먼지 격자 배열 (PM2.5 / PM10) */}
          <View className="flex flex-row gap-4 mb-4">
            <View className="flex-1 border border-gray-100 rounded-[16px] p-4 items-center bg-white">
              <Text className="text-[13px] font-medium text-gray-400 mb-2">PM2.5</Text>
              <Text className="text-[24px] font-bold text-gray-900 mb-1">{airData.pm25Value}</Text>
              <Text className="text-[11px] text-gray-400">㎍/㎥</Text>
            </View>
            
            <View className="flex-1 border border-gray-100 rounded-[16px] p-4 items-center bg-white">
              <Text className="text-[13px] font-medium text-gray-400 mb-2">PM10</Text>
              <Text className="text-[24px] font-bold text-gray-900 mb-1">{airData.pm10Value}</Text>
              <Text className="text-[11px] text-gray-400">㎍/㎥</Text>
            </View>
          </View>

          {/* 🌟 가스 오염물질 상세 정보 그리드 영역 (버전 1.5 컴포넌트 추가 확장) */}
          <View className="border border-gray-100 rounded-[16px] p-4 mb-5 bg-gray-50/50">
            <Text className="text-[12px] font-bold text-gray-500 mb-3">기타 대기 오염 물질 (ver 1.5 고정밀)</Text>
            <View className="grid flex-row flex-wrap justify-between gap-y-3">
              <View className="w-[48%] flex-row justify-between border-b border-gray-100/70 pb-1">
                <Text className="text-[12px] text-gray-400">오존(O₃)</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{airData.o3Value} ppm</Text>
              </View>
              <View className="w-[48%] flex-row justify-between border-b border-gray-100/70 pb-1">
                <Text className="text-[12px] text-gray-400">이산화질소</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{airData.no2Value} ppm</Text>
              </View>
              <View className="w-[48%] flex-row justify-between">
                <Text className="text-[12px] text-gray-400">일산화탄소</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{airData.coValue} ppm</Text>
              </View>
              <View className="w-[48%] flex-row justify-between">
                <Text className="text-[12px] text-gray-400">아황산가스</Text>
                <Text className="text-[12px] font-semibold text-gray-700">{airData.so2Value} ppm</Text>
              </View>
            </View>
          </View>

          {/* 건강 권고사항 안내 영역 */}
          <View className="bg-[#f9f3e3] rounded-[16px] p-5 mb-6">
            <Text className="text-[14px] font-bold text-[#3a3126] mb-2">건강 권고사항</Text>
            <Text className="text-[13px] text-[#4a3f31] leading-relaxed">
              {airData.recommendation}
            </Text>
          </View>

          {/* 하단 푸터 영역 */}
          <View className="flex flex-row justify-between items-center mt-auto">
            <Text className="text-[11px] text-gray-400">
              비상업 연구용 프로토타입
            </Text>
            
            <TouchableOpacity 
              onPress={fetchAirKoreaV15Data}
              activeOpacity={0.7}
              className="flex flex-row items-center gap-1.5 border border-gray-200 rounded-[12px] px-3.5 py-2"
            >
              <Ionicons name="refresh" size={12} color="#48484a" />
              <Text className="text-[12px] font-semibold text-gray-600">
                새로고침
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </>
  );
}