import * as fs from 'fs-extra';
import { Collection, Db, MongoClient } from 'mongodb';
import path from 'path';
import { MongoDocument } from '../interface/IMongoDocument';
import { WZDataItem } from '../interface/IWZItem';

export class WZToMongoConverter {
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
      let fileName = path.basename(filePath, '.img.target.json');
      // 첫글자 upper case
      fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

      const collectionName = 'items';

      const collection: Collection<MongoDocument> = this.db.collection(collectionName);

      const documents: MongoDocument[] = [];

      if (fileName === 'Eqp') {
        // 장비템은 다르게 설정
        for (const [id, item] of Object.entries(fileData[fileName])) {
          for (const [key, value] of Object.entries(item)) {
            // 두번 루프 돌려야댐!!
            if (typeof item === 'object' && item !== null) {
              const document = this.convertWZItemToDocument(
                id,
                value as WZDataItem,
                `${fileName}/${key}`
              );
              documents.push(document);
            }
          }
        }
      } else {
        for (const [id, item] of Object.entries(fileData[fileName])) {
          if (typeof item === 'object' && item !== null) {
            const document = this.convertWZItemToDocument(id, item as WZDataItem, fileName);
            documents.push(document);
          }
        }
      }

      if (documents.length > 0) {
        const result = await collection.insertMany(documents);
        console.log(
          `${documents.length}/${Object.entries(fileData).length}개의 문서가 ${collectionName} 컬렉션에 삽입되었습니다.`
        );
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
      const jsonFiles = files.filter(file => file.endsWith('.target.json'));

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
