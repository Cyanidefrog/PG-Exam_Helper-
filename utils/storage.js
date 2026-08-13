/**
 * 本地数据存储层
 * 说明：所有数据仅保存在设备本地
 * - 结构化数据：uni.setStorageSync（本地缓存）
 * - 错题照片：先压缩，再通过 uni.saveFile 保存到本地文件系统
 */

const KEYS = {
  SETS: 'pg_exam_sets',
  RECORDS: 'pg_exam_records',
  WRONGS: 'pg_exam_wrongs'
}

// 默认学科
export const DEFAULT_SUBJECTS = ['英语', '数学', '政治']

// 刷卷类型（第几轮刷这套卷）
export const PASS_TYPES = ['一刷', '二刷', '三刷']

// 学科标签颜色
const SUBJECT_COLORS = {
  '英语': '#3D6AF2',
  '数学': '#FF9F43',
  '政治': '#FF5B5B',
  '其他': '#7A5AF8'
}

export function subjectColor(subject) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS['其他']
}

function get(key, defaultValue) {
  try {
    const value = uni.getStorageSync(key)
    return value === '' || value === null || value === undefined ? defaultValue : value
  } catch (e) {
    console.error('读取存储失败:', key, e)
    return defaultValue
  }
}

function set(key, value) {
  try {
    uni.setStorageSync(key, value)
    return true
  } catch (e) {
    console.error('写入存储失败:', key, e)
    uni.showToast({ title: '本地存储空间不足', icon: 'none' })
    return false
  }
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/* ================= 习题集 ================= */

export function getSets() {
  return get(KEYS.SETS, [])
}

export function saveSets(list) {
  return set(KEYS.SETS, list)
}

export function getSetById(id) {
  return getSets().find(item => item.id === id) || null
}

export function createSet(data) {
  const list = getSets()
  const item = Object.assign({ id: genId(), createdAt: Date.now() }, data)
  list.unshift(item)
  saveSets(list)
  return item
}

export function updateSet(id, data) {
  const list = getSets().map(item => (item.id === id ? Object.assign({}, item, data) : item))
  saveSets(list)
}

export function deleteSet(id) {
  saveSets(getSets().filter(item => item.id !== id))
  saveRecords(getRecords().filter(record => record.setId !== id))
}

// 根据习题集年份范围生成卷子（年份）列表
export function getSetYears(set) {
  const years = []
  for (let year = set.startYear; year <= set.endYear; year++) {
    years.push(year)
  }
  return years
}

/* ================= 刷卷记录（每张卷 = 习题集 + 年份） ================= */

export function getRecords() {
  return get(KEYS.RECORDS, [])
}

export function saveRecords(list) {
  return set(KEYS.RECORDS, list)
}

export function getRecord(setId, year) {
  return getRecords().find(record => record.setId === setId && record.year === year) || null
}

// 保存某张卷的刷卷状态：类型（一刷/二刷/三刷）+ 是否已刷
export function upsertRecord(record) {
  const list = getRecords()
  const index = list.findIndex(item => item.setId === record.setId && item.year === record.year)
  const now = Date.now()
  if (index >= 0) {
    list[index] = Object.assign({}, list[index], record, { updatedAt: now })
  } else {
    list.unshift(Object.assign({ id: genId(), createdAt: now, updatedAt: now }, record))
  }
  saveRecords(list)
}

export function deleteRecord(setId, year) {
  saveRecords(getRecords().filter(item => !(item.setId === setId && item.year === year)))
}

/* ================= 错题本（手动录入：题号 + 写字 + 拍照） ================= */

export function getWrongs() {
  return get(KEYS.WRONGS, [])
}

export function saveWrongs(list) {
  return set(KEYS.WRONGS, list)
}

export function getWrongById(id) {
  return getWrongs().find(item => item.id === id) || null
}

export function addWrong(data) {
  const list = getWrongs()
  const item = Object.assign({ id: genId(), createdAt: Date.now(), photos: [] }, data)
  list.unshift(item)
  saveWrongs(list)
  return item
}

export function updateWrong(id, data) {
  const list = getWrongs().map(item => (item.id === id ? Object.assign({}, item, data) : item))
  saveWrongs(list)
}

export function deleteWrong(id) {
  saveWrongs(getWrongs().filter(item => item.id !== id))
}

/* ================= 图片处理 ================= */

// 压缩图片（不支持的平台直接返回原图）
export function compressImage(tempFilePath) {
  return new Promise(resolve => {
    uni.compressImage({
      src: tempFilePath,
      quality: 70,
      success: res => resolve(res.tempFilePath),
      fail: () => resolve(tempFilePath)
    })
  })
}

// 把临时图片持久化保存（小程序 / App 保存到本地文件系统）
export function persistImage(tempFilePath) {
  return new Promise(resolve => {
    uni.saveFile({
      tempFilePath: tempFilePath,
      success: res => resolve(res.savedFilePath),
      fail: () => resolve(tempFilePath)
    })
  })
}

export function previewImages(urls, current) {
  uni.previewImage({ urls: urls, current: current })
}

export function removeSavedFile(filePath) {
  try {
    uni.removeSavedFile && uni.removeSavedFile({ filePath: filePath })
  } catch (e) {
    // 忽略清理失败
  }
}
