export interface WZDataItem {
  _dirName: string;
  _dirType: string;
  _value?: string;
  name?: WZDataItem;
  desc?: WZDataItem;
  [key: string]: unknown;
}
