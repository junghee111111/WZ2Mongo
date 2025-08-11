import * as fs from 'fs-extra';
import * as path from 'path';
import { MongoClient, Collection, Db } from 'mongodb';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

interface WZDataItem {
  _dirName: string;
  _dirType: string;
  _value?: string;
  name?: WZDataItem;
  desc?: WZDataItem;
  [key: string]: unknown;
}

interface MongoDocument {
  id: string;
  name?: string;
  description?: string;
  originalData: WZDataItem;
  category: string;
  createdAt: Date;
}

class WZToMongoConverter {
  private mongoUrl: string;

  private dbName: string;

  private client: MongoClient | null = null;

  private db: Db | null = null;

  constructor(mongoUrl?: string, dbName?: string) {
    this.mongoUrl =
      mongoUrl || process.env.MONGO_URL || 'mongodb://wzuser:wzpassword@localhost:27017/wzdata';
    this.dbName = dbName || process.env.DB_NAME || 'wzdata';
  }

  async connect(): Promise<void> {
    try {
      console.log(`MongoDB 연결 시도 중: ${this.mongoUrl.replace(/\/\/.*@/, '//***:***@')}`);

      // MongoDB 연결 옵션 설정
      this.client = new MongoClient(this.mongoUrl, {
        serverSelectionTimeoutMS: 5000, // 5초 타임아웃
        connectTimeoutMS: 10000, // 10초 연결 타임아웃
      });

      await this.client.connect();

      // 연결 테스트
      await this.client.db('admin').command({ ping: 1 });

      this.db = this.client.db(this.dbName);
      console.log(`MongoDB에 연결되었습니다. 데이터베이스: ${this.dbName}`);
    } catch (error) {
      console.error('MongoDB 연결 실패:', error);
      console.error('Docker 컨테이너가 실행 중인지 확인하세요: docker-compose up -d');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }

  private extractStringValue(item: WZDataItem): string | undefined {
    if (item._dirType === 'String' && item._value) {
      return item._value;
    }
    return undefined;
  }

  private convertWZItemToDocument(id: string, item: WZDataItem, category: string): MongoDocument {
    const document: MongoDocument = {
      id,
      category,
      originalData: item,
      createdAt: new Date(),
    };

    // name 필드 추출
    if (item.name) {
      document.name = this.extractStringValue(item.name);
    }

    // desc 필드 추출
    if (item.desc) {
      document.description = this.extractStringValue(item.desc);
    }

    return document;
  }

  async processJSONFile(filePath: string): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('MongoDB 데이터베이스가 연결되지 않았습니다.');
      }

      console.log(`파일 처리 중: ${filePath}`);

      const fileData = await fs.readJson(filePath);
      const fileName = path.basename(filePath, '.img.json');
      const collectionName = fileName.toLowerCase();

      const collection: Collection<MongoDocument> = this.db.collection(collectionName);

      // 컬렉션 초기화 (선택적)
      await collection.deleteMany({});
      console.log(`컬렉션 ${collectionName} 초기화 완료`);

      const documents: MongoDocument[] = [];

      for (const [id, item] of Object.entries(fileData)) {
        if (typeof item === 'object' && item !== null) {
          const document = this.convertWZItemToDocument(id, item as WZDataItem, fileName);
          documents.push(document);
        }
      }

      if (documents.length > 0) {
        const result = await collection.insertMany(documents);
        console.log(`${documents.length}개의 문서가 ${collectionName} 컬렉션에 삽입되었습니다.`);
        console.log(`삽입된 문서 ID들: ${Object.keys(result.insertedIds).length}개`);
      } else {
        console.log('삽입할 문서가 없습니다.');
      }
    } catch (error) {
      console.error(`파일 처리 중 오류 발생 (${filePath}):`, error);
      throw error;
    }
  }

  async processAllJSONFiles(directoryPath: string): Promise<void> {
    try {
      const files = await fs.readdir(directoryPath);
      const jsonFiles = files.filter(file => file.endsWith('.img.json'));

      console.log(`총 ${jsonFiles.length}개의 JSON 파일을 찾았습니다.`);

      for (const file of jsonFiles) {
        const filePath = path.join(directoryPath, file);
        await this.processJSONFile(filePath);
      }

      console.log('모든 파일 처리가 완료되었습니다.');
    } catch (error) {
      console.error('파일 처리 중 오류 발생:', error);
      throw error;
    }
  }

  // MongoDB 쿼리 예제 메서드들
  async findItemsByName(collectionName: string, searchName: string): Promise<MongoDocument[]> {
    if (!this.db) throw new Error('데이터베이스가 연결되지 않았습니다.');

    const collection = this.db.collection<MongoDocument>(collectionName);
    return collection
      .find({
        name: new RegExp(searchName, 'i'),
      })
      .toArray();
  }

  async findItemById(collectionName: string, id: string): Promise<MongoDocument | null> {
    if (!this.db) throw new Error('데이터베이스가 연결되지 않았습니다.');

    const collection = this.db.collection<MongoDocument>(collectionName);
    return collection.findOne({ id });
  }

  async getCollectionStats(): Promise<void> {
    if (!this.db) throw new Error('데이터베이스가 연결되지 않았습니다.');

    const collections = await this.db.listCollections().toArray();

    console.log('\n=== 컬렉션 통계 ===');
    for (const collectionInfo of collections) {
      const collection = this.db.collection(collectionInfo.name);
      const count = await collection.countDocuments();
      console.log(`${collectionInfo.name}: ${count}개 문서`);
    }
  }
}

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
    const cashItems = await converter.findItemsByName('cash', '해님');
    console.log('Cash 컬렉션에서 "해님" 검색 결과:', cashItems.length, '개');

    if (cashItems.length > 0) {
      console.log('첫 번째 결과:', {
        id: cashItems[0].id,
        name: cashItems[0].name,
        description: `${cashItems[0].description?.substring(0, 50)}...`,
      });
    }

    console.log('\n=== 변환 완료 ===');
    console.log('MongoDB Express UI: http://localhost:8081 에서 데이터를 확인할 수 있습니다.');
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

export { WZToMongoConverter, WZDataItem, MongoDocument };
