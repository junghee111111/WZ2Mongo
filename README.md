# WZ to MongoDB 변환기

MapleStory WZ 파일의 JSON 데이터를 MongoDB로 변환하는 TypeScript 프로젝트입니다.

## 필요한 패키지

이 프로젝트는 다음 npm 패키지들을 사용합니다:

### 메인 의존성

- `mongodb`: MongoDB 클라이언트 라이브러리
- `fs-extra`: 확장된 파일 시스템 유틸리티

### 개발 의존성

- `typescript`: TypeScript 컴파일러
- `@types/node`: Node.js 타입 정의
- `@types/fs-extra`: fs-extra 타입 정의

## 설치

```bash
npm install
```

## 사용법

### 1. MongoDB 서버 실행

먼저 MongoDB 서버가 실행 중인지 확인하세요:

```bash
mongod
```

### 2. 환경 설정

`.env.example` 파일을 `.env`로 복사하고 필요에 따라 수정하세요:

```bash
copy .env.example .env
```

### 3. 프로젝트 빌드 및 실행

```bash
npm run build
npm start
```

또는 개발 모드로 실행:

```bash
npm run dev
```

## 주요 기능

### WZToMongoConverter 클래스

- `connect()`: MongoDB 연결
- `disconnect()`: MongoDB 연결 종료
- `processJSONFile(filePath)`: 단일 JSON 파일 처리
- `processAllJSONFiles(directoryPath)`: 디렉토리의 모든 JSON 파일 처리
- `findItemsByName(collection, name)`: 이름으로 항목 검색
- `findItemById(collection, id)`: ID로 항목 검색
- `getCollectionStats()`: 컬렉션 통계 정보

### 데이터 구조

각 WZ 항목은 다음과 같은 MongoDB 문서로 변환됩니다:

```typescript
interface MongoDocument {
  id: string; // 원본 WZ ID
  name?: string; // 항목 이름
  description?: string; // 항목 설명
  originalData: any; // 원본 WZ 데이터
  category: string; // 카테고리 (파일명)
  createdAt: Date; // 생성 시간
}
```

## MongoDB 쿼리 예제

프로젝트를 실행한 후 MongoDB에서 다음과 같은 쿼리를 사용할 수 있습니다:

```javascript
// 특정 이름으로 검색
db.cash.find({ name: /해님/i });

// 특정 ID로 검색
db.cash.findOne({ id: '5010000' });

// 특정 카테고리의 모든 항목
db.cash.find({ category: 'Cash' });

// 설명이 있는 항목들
db.cash.find({ description: { $exists: true } });
```

## 파일 구조

```
.
├── index.ts              # 메인 애플리케이션 파일
├── package.json          # npm 설정
├── tsconfig.json         # TypeScript 설정
├── .env.example          # 환경 변수 예제
└── string.wz/           # WZ JSON 파일들
    ├── Cash.img.json
    ├── Consume.img.json
    ├── Eqp.img.json
    └── ...
```

## 개발자 정보

작성자: junghee wang
라이선스: ISC
