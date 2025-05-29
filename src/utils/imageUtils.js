import { SERVER_URL } from './constants';

/**
 * 将相对路径转换为完整 URL
 * @param {string} path - 图片的相对路径
 * @returns {string} - 完整的图片 URL
 */
export const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // 已经是完整 URL，直接返回
  }
  return `${SERVER_URL}${path}`; // 拼接服务器地址
};