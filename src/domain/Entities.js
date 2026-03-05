/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} summary - 짧은 개요 (카드 표시용)
 * @property {string} content - 상세 내용 (모달 표시용)
 * @property {string} category
 * @property {string} status
 * @property {string} description - 하위 호환용
 * @property {string} longDescription - 하위 호환용
 * @property {string} techStack - 주요 개발 언어/기술
 * @property {Object} socialLinks - 소셜 미디어 링크 객체
 * @property {string[]} tags
 * @property {string} [liveUrl]
 * @property {string} [githubUrl]
 */

/**
 * @typedef {Object} Insight
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} date
 * @property {string} content
 * @property {string} [readTime]
 */

/**
 * @typedef {Object} Inquiry
 * @property {string} [id]
 * @property {string} name
 * @property {string} email
 * @property {string} message
 * @property {string} date
 * @property {'new' | 'read' | 'archived'} status
 */
