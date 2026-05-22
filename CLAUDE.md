# MISAE Project

## Build and Run Commands
* Run Metro Bundler: \
px expo start --offline\`n* Run Android: Press \\ after start

## Code Style Guidelines
* Framework: React Native with Expo
* Layout: Tailwind CSS (NativeWind)
* Language: TypeScript (.tsx)
* Architecture: Separation of concerns (AI logic / UI components)

모바일 앱 UI 개발하기

1. 핵심로직 -> UI
2. UI -> 핵심 로직

UI 개발의 전체적인 흐름

1. 기획서를 기반으로 UI 생성 프롬프트를 생성한다.
2. UI 생성 프롬프트를 v0 -> UI 프로토타입 생성
3. 2번에서 만든 UI 프로토타입을 기반으로 클로드코드와 함께 UI를 개발


미세먼지 공공 API를 통해 실시간 데이터 가져오기

API란 Application Programming Interface
인터페이스 = 연결부
클라이언트가 서버에 데이터를 요청하기 위한 연결부

이 연결부에 맞게 Request(요청) 하면 원하는 데이터를 얻을 수 있음.

공공 API란?
공공기관이 보유한 데이터를 쉽게 활용할 수 있도록 공개한 API

공공 API의 연결부에 맞게 데이터를 요청하면
공공기관이 제공하는 데이터를 얻을 수 있음.

