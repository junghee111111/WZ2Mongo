import * as dotenv from 'dotenv';
import * as fs from 'fs-extra';
import * as path from 'path';
import { MongoDocument } from './interface/IMongoDocument';
import { WZToMongoConverter } from './service/WzToMongoConverter';

// 환경 변수 로드
dotenv.config();

// 메인 실행 함수
async function main() {
  const converter = new WZToMongoConverter();

  try {
    console.log('=== WZ to MongoDB 변환기 시작 ===');
    console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
    console.log(`JSON 디렉토리: ${process.env.JSON_DIRECTORY || './string.wz'}`);

    // MongoDB 연결
    await converter.connect();

    // JSON 파일들이 있는 디렉토리 경로
    const jsonDirectory = path.resolve(process.env.JSON_DIRECTORY || './string.wz');
    console.log(`JSON 파일 경로: ${jsonDirectory}`);

    // 디렉토리 존재 확인
    if (!(await fs.pathExists(jsonDirectory))) {
      throw new Error(`JSON 디렉토리를 찾을 수 없습니다: ${jsonDirectory}`);
    }

    // 모든 JSON 파일 처리
    await converter.processAllJSONFiles(jsonDirectory);

    // 통계 정보 출력
    await converter.getCollectionStats();

    // 예제 쿼리 실행
    console.log('\n=== 예제 쿼리 실행 ===');

    // Cash 컬렉션에서 이름에 "해님"이 포함된 항목 검색
    // const cashItems = await converter.findItemsByName('cash', '해님');
    // console.log('Cash 컬렉션에서 "해님" 검색 결과:', cashItems.length, '개');

    // if (cashItems.length > 0) {
    //   console.log('첫 번째 결과:', {
    //     id: cashItems[0].id,
    //     name: cashItems[0].name,
    //     description: `${cashItems[0].description?.substring(0, 50)}...`,
    //   });
    // }

    console.log('\n=== 변환 완료 ===');
  } catch (error) {
    console.error('실행 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await converter.disconnect();
  }
}

// 프로그램 실행
if (require.main === module) {
  main().catch(console.error);
}

export { MongoDocument };
