# Docker MongoDB 사용 가이드

## 1. MongoDB Docker 컨테이너 시작

```bash
# MongoDB와 Mongo Express 컨테이너 시작
npm run docker:up

# 또는 직접 명령어 사용
docker-compose up -d
```

## 2. 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# MongoDB 로그 확인
npm run docker:logs
```

## 3. 애플리케이션 실행

```bash
# TypeScript 빌드 후 실행
npm start

# 또는 개발 모드
npm run dev
```

## 4. MongoDB 접속 정보

### 애플리케이션에서 사용

- **URL**: `mongodb://wzuser:wzpassword@localhost:27017/wzdata`
- **데이터베이스**: `wzdata`
- **사용자**: `wzuser`
- **비밀번호**: `wzpassword`

### 관리자 계정

- **사용자**: `admin`
- **비밀번호**: `password123`

## 5. Mongo Express (웹 UI)

MongoDB 데이터를 웹에서 확인할 수 있습니다:

- **URL**: http://localhost:8081
- 인증 없이 바로 접속 가능

## 6. 컨테이너 중지 및 정리

```bash
# 컨테이너 중지
npm run docker:down

# 컨테이너와 볼륨까지 완전 삭제 (데이터 초기화)
npm run mongo:reset
```

## 7. 트러블슈팅

### MongoDB 연결 실패 시

1. 컨테이너가 실행 중인지 확인: `docker ps`
2. MongoDB 로그 확인: `npm run docker:logs`
3. 포트 충돌 확인: `netstat -an | findstr 27017`

### 데이터 초기화가 필요한 경우

```bash
npm run mongo:reset
```

### 환경 변수 수정

`.env` 파일에서 MongoDB 연결 정보를 수정할 수 있습니다.

## 8. MongoDB 직접 접속

### Windows에서 MongoDB Shell 사용

```bash
# MongoDB 컨테이너에 접속
docker exec -it wz-mongodb mongosh

# 특정 데이터베이스 선택
use wzdata

# 컬렉션 조회
show collections

# 문서 조회 예제
db.cash.find().limit(5)
```
