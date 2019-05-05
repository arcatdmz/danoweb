/**
 * api.ts
 *
 * Functions to call server APIs
 */
import axios from "axios";

export interface APIOptions {
  endpoint?: string;
}

export async function getTextFile(filePath: string, options?: APIOptions) {
  try {
    const res = await axios.get(getEndpoint(options) + filePath);
    return res.data as string;
  } catch (_e) {
    return null;
  }
}

export async function putTextFile(
  filePath: string,
  options: APIOptions & { content: string }
) {
  const fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
  const formData = new FormData();
  formData.append("path", filePath);
  formData.append(
    "content",
    new Blob([options.content], { type: "text/plain" }),
    fileName
  );
  const res = await axios.put(getEndpoint(options) + filePath, formData);
  return res.data as string;
}

function getEndpoint(options?: APIOptions) {
  return (options && options.endpoint) || "";
}
