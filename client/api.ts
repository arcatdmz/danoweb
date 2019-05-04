/**
 * api.ts
 *
 * Functions to call server APIs
 */
import axios from "axios";

export interface APIOptions {
  endpoint?: string;
}

export async function getTextFile(filePath: string, options: APIOptions) {
  const res = await axios.get(getEndpoint(options) + filePath);
  return res.data as string;
}

function getEndpoint(options?: APIOptions) {
  return (options && options.endpoint) || "";
}
