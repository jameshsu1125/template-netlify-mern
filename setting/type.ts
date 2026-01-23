// mongodb types
export enum IType {
  String = 'String',
  Number = 'Number',
  Boolean = 'Boolean',
  Date = 'Date',
}

export type TUploadRespond = {
  access_control: null;
  access_mode: string;
  aspect_ratio: number;
  asset_id: string;
  backup_bytes: number;
  bytes: number;
  created_at: string;
  created_by: { access_key: string };
  etag: string;
  filename: string;
  folder: string;
  format: string;
  height: number;
  pixels: number;
  public_id: string;
  resource_type: string;
  secure_url: string;
  status: string;
  type: string;
  uploaded_at: string;
  uploaded_by: { access_key: string };
  url: string;
  version: number;
  width: number;
};

export type UploadBunnyCDNRespond = {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  Checksum: string;
  ReplicatedZones: string;
  LastChanged: string;
  ServerId: number;
  ArrayNumber: number;
  IsDirectory: boolean;
  UserId: string;
  ContentType: string;
  DateCreated: string;
  StorageZoneId: number;
  Url: string;
};

export type CloudinaryUploadedResult =
  | {
      [futureKey: string]: any;
      public_id: string;
      version: number;
      signature: string;
      width: number;
      height: number;
      format: string;
      resource_type: 'image' | 'raw' | 'video' | 'auto';
      created_at: string;
      tags: string[];
      pages: number;
      bytes: number;
      type: string;
      etag: string;
      placeholder: boolean;
      url: string;
      secure_url: string;
      access_mode: string;
      original_filename: string;
      moderation: string[];
      access_control: string[];
      context: object;
      metadata: object;
      colors?: [string, number][];
    }
  | undefined;
