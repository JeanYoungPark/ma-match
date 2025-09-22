# Match-3 Puzzle Game (React Native)

React Native로 구현한 Match-3 퍼즐 게임입니다.

## 게임 방법

1. **타일 매칭**: 인접한 타일을 터치하여 교환하고, 같은 색깔 3개 이상을 일렬로 맞추세요
2. **점수 획득**: 매칭된 타일이 사라지고 점수를 얻습니다
3. **콤보**: 연속적인 매칭으로 콤보 배수를 늘려 더 높은 점수를 얻으세요
4. **이동 제한**: 30번의 이동 내에 최고 점수를 달성하세요

## 설치 및 실행

### 사전 요구사항
- Node.js 20+
- React Native development environment
- iOS: Xcode 12+
- Android: Android Studio

### 설치
```bash
# 의존성 설치
npm install

# iOS 의존성 설치 (Mac only)
cd ios && pod install && cd ..
```

### 실행
```bash
# iOS
npm run ios

# Android
npm run android

# Metro bundler (별도 터미널)
npm start
```

## 주요 기능

- 8x8 게임 보드
- 7가지 색상의 타일
- 부드러운 애니메이션
- 점수 시스템과 콤보 배수
- 터치 기반 인터랙션
- 게임 재시작 기능

## 프로젝트 구조

```
ma-match/
├── src/
│   ├── screens/        # 게임 화면
│   │   └── GameScreen.tsx
│   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── GameBoard.tsx
│   │   ├── GameHeader.tsx
│   │   └── Tile.tsx
│   ├── utils/          # 게임 로직
│   │   └── gameLogic.ts
│   └── types/          # TypeScript 타입 정의
│       └── index.ts
├── App.tsx             # 앱 진입점
├── android/            # Android 네이티브 코드
├── ios/                # iOS 네이티브 코드
└── package.json        # 프로젝트 설정

```

## 기술 스택

- **React Native**: 크로스 플랫폼 모바일 앱
- **TypeScript**: 타입 안정성
- **React Hooks**: 상태 관리
- **Animated API**: 애니메이션

## 향후 개선 사항

- [ ] 사운드 효과 추가
- [ ] 파워업 아이템
- [ ] 레벨 시스템
- [ ] 리더보드
- [ ] 소셜 기능

## 라이선스

MIT License