# ESLint & Prettier 개발 가이드

## 📝 코드 품질 도구 설정

이 프로젝트는 **Airbnb ESLint 스타일 가이드**와 **Prettier**를 사용하여 일관된 코드 스타일을 유지합니다.

## 🛠️ 설치된 도구들

### ESLint 관련

- `eslint` - JavaScript/TypeScript 린터
- `@typescript-eslint/parser` - TypeScript 파서
- `@typescript-eslint/eslint-plugin` - TypeScript ESLint 플러그인
- `eslint-config-airbnb-base` - Airbnb 기본 스타일 가이드
- `eslint-config-airbnb-typescript` - Airbnb TypeScript 스타일 가이드
- `eslint-plugin-import` - import/export 문법 체크
- `eslint-import-resolver-typescript` - TypeScript import resolver

### Prettier 관련

- `prettier` - 코드 포매터
- `eslint-config-prettier` - ESLint와 Prettier 충돌 방지
- `eslint-plugin-prettier` - ESLint에서 Prettier 실행

### Git Hooks

- `husky` - Git hooks 관리
- `lint-staged` - 스테이징된 파일에만 린트 적용

## 🚀 사용법

### 수동 실행

```bash
# ESLint 체크만
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포매팅
npm run format

# Prettier 체크만 (수정하지 않음)
npm run format:check

# 타입 체크
npm run type-check

# 모든 체크 실행
npm run check-all

# 모든 자동 수정 실행
npm run fix-all
```

### 자동 실행

#### VS Code에서

- 파일 저장 시 자동으로 Prettier 포매팅 실행
- ESLint 오류 자동 수정
- Import 자동 정리

#### Git 커밋 시

- `git commit` 실행 시 자동으로 lint-staged 실행
- 스테이징된 파일에 대해서만 ESLint + Prettier 적용

## ⚙️ 설정 파일들

### `.eslintrc.json`

- Airbnb TypeScript 스타일 가이드 적용
- Prettier와 통합
- 프로젝트에 맞는 커스텀 규칙 설정

### `.prettierrc.json`

- 코드 포매팅 규칙 설정
- 줄 길이: 100자
- 싱글 쿼트 사용
- 세미콜론 사용

### `.vscode/settings.json`

- VS Code에서 저장 시 자동 포매팅
- ESLint 자동 수정 활성화

### `package.json`의 `lint-staged`

- Git 커밋 시 실행할 명령어 정의

## 🎯 주요 규칙

### TypeScript 관련

- `any` 타입 사용 최소화 (warning)
- 명시적 함수 반환 타입 선택사항
- 사용하지 않는 변수는 `_`로 시작

### Import/Export

- 기본 export 보다는 named export 권장
- 상대 경로보다는 절대 경로 권장

### 스타일

- 들여쓰기: 2 스페이스
- 문자열: 싱글 쿼트
- 세미콜론: 필수
- 객체/배열: trailing comma 사용

## 🔧 문제 해결

### ESLint 오류 해결

```bash
# 자동 수정 가능한 오류들 수정
npm run lint:fix
```

### Prettier 포매팅 오류 해결

```bash
# 모든 파일 포매팅
npm run format
```

### TypeScript 타입 오류 해결

```bash
# 타입 체크만 실행
npm run type-check
```

### 모든 문제 한번에 해결

```bash
# ESLint 수정 + Prettier 포매팅
npm run fix-all
```

## 📚 추천 VS Code 확장

다음 확장들이 자동으로 설치됩니다:

- **ESLint** - ESLint 지원
- **Prettier** - Prettier 지원
- **TypeScript Hero** - TypeScript 추가 기능

## 🚫 주의사항

1. **커밋 전 체크**: 모든 ESLint 오류를 해결해야 커밋 가능
2. **타입 안전성**: `any` 타입 사용을 최소화하세요
3. **Import 순서**: ESLint가 자동으로 import 순서를 정리합니다

## 📝 예제 코드

```typescript
// ✅ 좋은 예
interface User {
  id: string;
  name: string;
  email?: string;
}

const createUser = (userData: Omit<User, 'id'>): User => {
  return {
    id: generateId(),
    ...userData,
  };
};

// ❌ 나쁜 예
const createUser = (userData: any) => {
  return {
    id: generateId(),
    ...userData,
  };
};
```

이 설정으로 팀 전체가 일관된 코드 스타일을 유지할 수 있습니다! 🎉
