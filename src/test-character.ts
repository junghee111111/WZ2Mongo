import { WZToMongoConverter } from './service/WzToMongoConverter';

async function testCharacterProcessor() {
  const converter = new WZToMongoConverter();

  try {
    console.log('=== 캐릭터 JSON 파일 처리 테스트 ===\n');
    await converter.processCharacterJsonFile();
  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
  }
}

testCharacterProcessor().catch(console.error);
