// Existing types...
export interface APIResponse<T> {
  success: boolean;
  code: string;
  msg: string;
  data: T;
}

export type EmptyReponse = APIResponse<{}>;
export type JSONReponse = APIResponse<JSON>;
