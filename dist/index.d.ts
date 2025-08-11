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
declare class WZToMongoConverter {
    private mongoUrl;
    private dbName;
    private client;
    private db;
    constructor(mongoUrl?: string, dbName?: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private extractStringValue;
    private convertWZItemToDocument;
    processJSONFile(filePath: string): Promise<void>;
    processAllJSONFiles(directoryPath: string): Promise<void>;
    findItemsByName(collectionName: string, searchName: string): Promise<MongoDocument[]>;
    findItemById(collectionName: string, id: string): Promise<MongoDocument | null>;
    getCollectionStats(): Promise<void>;
}
export { MongoDocument, WZDataItem, WZToMongoConverter };
//# sourceMappingURL=index.d.ts.map