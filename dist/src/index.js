"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WZToMongoConverter = void 0;
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs-extra"));
const mongodb_1 = require("mongodb");
const path = __importStar(require("path"));
// 환경 변수 로드
dotenv.config();
class WZToMongoConverter {
    constructor(mongoUrl, dbName) {
        this.client = null;
        this.db = null;
        this.mongoUrl =
            mongoUrl || process.env.MONGO_URL || 'mongodb://wzuser:wzpassword@localhost:27017/wzdata';
        this.dbName = dbName || process.env.DB_NAME || 'wzdata';
    }
    async connect() {
        try {
            console.log(`MongoDB 연결 시도 중: ${this.mongoUrl.replace(/\/\/.*@/, '//***:***@')}`);
            // MongoDB 연결 옵션 설정
            this.client = new mongodb_1.MongoClient(this.mongoUrl, {
                serverSelectionTimeoutMS: 5000, // 5초 타임아웃
                connectTimeoutMS: 10000, // 10초 연결 타임아웃
            });
            await this.client.connect();
            // 연결 테스트
            await this.client.db('admin').command({ ping: 1 });
            this.db = this.client.db(this.dbName);
            console.log(`MongoDB에 연결되었습니다. 데이터베이스: ${this.dbName}`);
        }
        catch (error) {
            console.error('MongoDB 연결 실패:', error);
            console.error('Docker 컨테이너가 실행 중인지 확인하세요: docker-compose up -d');
            throw error;
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('MongoDB 연결이 종료되었습니다.');
        }
    }
    extractStringValue(item) {
        if (item._dirType === 'String' && item._value) {
            return item._value;
        }
        return undefined;
    }
    convertWZItemToDocument(id, item, category) {
        const document = {
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
    async processJSONFile(filePath) {
        try {
            if (!this.db) {
                throw new Error('MongoDB 데이터베이스가 연결되지 않았습니다.');
            }
            console.log(`파일 처리 중: ${filePath}`);
            const fileData = await fs.readJson(filePath);
            const fileName = path.basename(filePath, '.img.json');
            const collectionName = fileName.toLowerCase();
            const collection = this.db.collection(collectionName);
            // 컬렉션 초기화 (선택적)
            await collection.deleteMany({});
            console.log(`컬렉션 ${collectionName} 초기화 완료`);
            const documents = [];
            for (const [id, item] of Object.entries(fileData)) {
                if (typeof item === 'object' && item !== null) {
                    const document = this.convertWZItemToDocument(id, item, fileName);
                    documents.push(document);
                }
            }
            if (documents.length > 0) {
                const result = await collection.insertMany(documents);
                console.log(`${documents.length}개의 문서가 ${collectionName} 컬렉션에 삽입되었습니다.`);
                console.log(`삽입된 문서 ID들: ${Object.keys(result.insertedIds).length}개`);
            }
            else {
                console.log('삽입할 문서가 없습니다.');
            }
        }
        catch (error) {
            console.error(`파일 처리 중 오류 발생 (${filePath}):`, error);
            throw error;
        }
    }
    async processAllJSONFiles(directoryPath) {
        try {
            const files = await fs.readdir(directoryPath);
            const jsonFiles = files.filter(file => file.endsWith('.img.json'));
            console.log(`총 ${jsonFiles.length}개의 JSON 파일을 찾았습니다.`);
            for (const file of jsonFiles) {
                const filePath = path.join(directoryPath, file);
                await this.processJSONFile(filePath);
            }
            console.log('모든 파일 처리가 완료되었습니다.');
        }
        catch (error) {
            console.error('파일 처리 중 오류 발생:', error);
            throw error;
        }
    }
    // MongoDB 쿼리 예제 메서드들
    async findItemsByName(collectionName, searchName) {
        if (!this.db)
            throw new Error('데이터베이스가 연결되지 않았습니다.');
        const collection = this.db.collection(collectionName);
        return collection
            .find({
            name: new RegExp(searchName, 'i'),
        })
            .toArray();
    }
    async findItemById(collectionName, id) {
        if (!this.db)
            throw new Error('데이터베이스가 연결되지 않았습니다.');
        const collection = this.db.collection(collectionName);
        return collection.findOne({ id });
    }
    async getCollectionStats() {
        if (!this.db)
            throw new Error('데이터베이스가 연결되지 않았습니다.');
        const collections = await this.db.listCollections().toArray();
        console.log('\n=== 컬렉션 통계 ===');
        for (const collectionInfo of collections) {
            const collection = this.db.collection(collectionInfo.name);
            const count = await collection.countDocuments();
            console.log(`${collectionInfo.name}: ${count}개 문서`);
        }
    }
}
exports.WZToMongoConverter = WZToMongoConverter;
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
    }
    catch (error) {
        console.error('실행 중 오류 발생:', error);
        process.exit(1);
    }
    finally {
        await converter.disconnect();
    }
}
// 프로그램 실행
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=index.js.map