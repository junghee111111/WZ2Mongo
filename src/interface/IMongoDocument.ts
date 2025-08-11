export interface MongoDocument {
  id: string;
  mapleItemId?: number;
  name?: string;
  description?: string;
  category: string;
  createdAt: Date;
}
