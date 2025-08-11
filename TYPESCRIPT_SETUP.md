# 🚀 TypeScript 프로젝트 실행 가이드

## ✅ 문제 해결 완료!

`SyntaxError: Cannot use import statement outside a module` 오류가 해결되었습니다.

## 📁 프로젝트 구조

```
g:\maple41\String.wz\
├── src/
│   └── index.ts          # 메인 TypeScript 소스 파일
├── dist/                 # 컴파일된 JavaScript 파일
├── string.wz/           # JSON 데이터 파일들
├── docker-compose.yml   # Docker MongoDB 설정
├── tsconfig.json        # TypeScript 설정
├── package.json         # 프로젝트 설정
└── .eslintrc.json       # ESLint 설정
```

## 🛠️ 실행 방법

### 1. 개발 모드 (권장)

```bash
# TypeScript를 ts-node로 직접 실행
npm run dev
```

### 2. 프로덕션 모드

```bash
# TypeScript 컴파일 후 JavaScript 실행
npm run build
npm start
```

### 3. MongoDB Docker 실행

```bash
# MongoDB 컨테이너 시작
npm run docker:up

# 애플리케이션 실행
npm run dev
```

## 🔧 사용 가능한 스크립트

| 명령어                | 설명                               |
| --------------------- | ---------------------------------- |
| `npm run dev`         | **ts-node로 TypeScript 직접 실행** |
| `npm run build`       | TypeScript 컴파일                  |
| `npm start`           | 컴파일 후 JavaScript 실행          |
| `npm run lint`        | ESLint 검사                        |
| `npm run lint:fix`    | ESLint 자동 수정                   |
| `npm run format`      | Prettier 포매팅                    |
| `npm run fix-all`     | ESLint + Prettier 한번에           |
| `npm run docker:up`   | MongoDB Docker 시작                |
| `npm run docker:down` | MongoDB Docker 중지                |

## 📝 주요 변경사항

### 1. **프로젝트 구조 개선**

- 소스 파일을 `src/` 폴더로 구성
- TypeScript 설정을 src 구조에 맞게 조정

### 2. **ts-node 추가**

- TypeScript 파일을 컴파일 없이 직접 실행
- `npm run dev` 명령어로 빠른 개발 가능

### 3. **설정 파일 업데이트**

- `tsconfig.json`: rootDir을 `./src`로 변경
- `package.json`: 스크립트 경로 수정
- `lint-staged`: src 폴더 대상으로 수정

## 🎯 이제 사용법

```bash
# 1. MongoDB 시작
npm run docker:up

# 2. 애플리케이션 개발 모드로 실행
npm run dev
```

## 🔍 문제 진단

만약 여전히 오류가 발생한다면:

1. **Node.js 버전 확인**

   ```bash
   node --version  # v16 이상 권장
   ```

2. **의존성 재설치**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript 전역 설치** (선택사항)
   ```bash
   npm install -g typescript ts-node
   ```

이제 TypeScript import 문제 없이 프로젝트를 실행할 수 있습니다! 🎉
