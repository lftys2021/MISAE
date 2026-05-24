import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import '../locales/i18n'; // 👈 다국어 설정 파일 임포트 (초기화 트리거)

// 스플래시 스크린이 자동으로 숨겨지는 것을 방지합니다.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 여기서 API 키 로딩이나 폰트 로딩 등 필요한 준비 작업을 수행할 수 있습니다.
        // 3초(3000ms) 동안 강제로 대기합니다.
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        // 준비가 완료됨을 표시합니다.
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // 앱이 준비되면 스플래시 스크린을 숨깁니다.
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // 준비가 되지 않았다면 아무것도 렌더링하지 않거나 null을 반환하여 
  // 스플래시 화면이 계속 유지되도록 합니다.
  if (!appIsReady) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}