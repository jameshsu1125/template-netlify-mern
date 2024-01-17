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
