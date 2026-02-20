const CLOUD_CONFIG = {
  COLLECTIONS: {
    BABIES: 'babies',
    FEEDINGS: 'feedings',
    GROWTHS: 'growths',
    POOPS: 'poops',
    SHARES: 'shares'
  }
}

let cloudEnvId = ''
let cloudInited = false

function getCloudEnv() {
  if (!cloudEnvId) {
    cloudEnvId = wx.getStorageSync('cloudEnvId') || ''
  }
  return cloudEnvId
}

function setCloudEnv(envId) {
  cloudEnvId = envId
  cloudInited = false
  wx.setStorageSync('cloudEnvId', envId)
  return initCloud()
}

function isCloudEnabled() {
  const envId = getCloudEnv()
  return !!envId && !!wx.cloud
}

function initCloud() {
  if (cloudInited) return true

  const envId = getCloudEnv()
  if (!envId) return false
  if (!wx.cloud) return false

  try {
    wx.cloud.init({ env: envId, traceUser: true })
    cloudInited = true
    return true
  } catch (e) {
    console.error('云初始化失败:', e)
    return false
  }
}

async function initDatabase() {
  if (!initCloud()) return false

  const db = wx.cloud.database()
  const collections = Object.values(CLOUD_CONFIG.COLLECTIONS)

  for (const name of collections) {
    try {
      await db.createCollection(name)
    } catch (e) {
      // 集合已存在或创建失败，忽略错误
    }
  }
  return true
}

function cleanData(data) {
  const { _id, _openid, ...cleaned } = data
  return cleaned
}

// ==================== 单条记录操作 ====================

// 上传或更新单条喂养记录
async function uploadFeeding(babyId, feeding) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()
    const data = cleanData(feeding)

    const exist = await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS)
      .where({ cloudId: feeding.id })
      .get()

    if (exist.data.length > 0) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS)
        .doc(exist.data[0]._id)
        .update({ data: { ...data, babyId, cloudId: feeding.id, updateTime: db.serverDate() } })
    } else {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS)
        .add({ data: { ...data, babyId, cloudId: feeding.id, createTime: db.serverDate(), updateTime: db.serverDate() } })
    }

    return { success: true }
  } catch (e) {
    console.error('上传喂养记录失败:', e)
    return { success: false, message: e.message }
  }
}

// 上传或更新单条生长记录
async function uploadGrowth(babyId, growth) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()
    const data = cleanData(growth)

    const exist = await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS)
      .where({ cloudId: growth.id })
      .get()

    if (exist.data.length > 0) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS)
        .doc(exist.data[0]._id)
        .update({ data: { ...data, babyId, cloudId: growth.id, updateTime: db.serverDate() } })
    } else {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS)
        .add({ data: { ...data, babyId, cloudId: growth.id, createTime: db.serverDate(), updateTime: db.serverDate() } })
    }

    return { success: true }
  } catch (e) {
    console.error('上传生长记录失败:', e)
    return { success: false, message: e.message }
  }
}

// 上传或更新单条大便记录
async function uploadPoop(babyId, poop) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()
    const data = cleanData(poop)

    const exist = await db.collection(CLOUD_CONFIG.COLLECTIONS.POOPS)
      .where({ cloudId: poop.id })
      .get()

    if (exist.data.length > 0) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.POOPS)
        .doc(exist.data[0]._id)
        .update({ data: { ...data, babyId, cloudId: poop.id, updateTime: db.serverDate() } })
    } else {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.POOPS)
        .add({ data: { ...data, babyId, cloudId: poop.id, createTime: db.serverDate(), updateTime: db.serverDate() } })
    }

    return { success: true }
  } catch (e) {
    console.error('上传大便记录失败:', e)
    return { success: false, message: e.message }
  }
}

// 上传或更新宝宝信息
async function uploadBaby(baby) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()
    const data = cleanData(baby)

    const exist = await db.collection(CLOUD_CONFIG.COLLECTIONS.BABIES)
      .where({ cloudId: baby.id })
      .get()

    if (exist.data.length > 0) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.BABIES)
        .doc(exist.data[0]._id)
        .update({ data: { ...data, cloudId: baby.id, updateTime: db.serverDate() } })
    } else {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.BABIES)
        .add({ data: { ...data, cloudId: baby.id, createTime: db.serverDate(), updateTime: db.serverDate() } })
    }

    return { success: true }
  } catch (e) {
    console.error('上传宝宝失败:', e)
    return { success: false, message: e.message }
  }
}

// 删除单条喂养记录
async function deleteFeeding(babyId, feedingId) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()
    const result = await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS)
      .where({ babyId, cloudId: feedingId })
      .get()

    if (result.data.length > 0) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS)
        .doc(result.data[0]._id)
        .remove()
    }
    return { success: true }
  } catch (e) {
    console.error('删除云端喂养记录失败:', e)
    return { success: false, message: e.message }
  }
}

// 删除单条生长记录
async function deleteGrowth(babyId, growthId) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()
    const result = await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS)
      .where({ babyId, cloudId: growthId })
      .get()

    if (result.data.length > 0) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS)
        .doc(result.data[0]._id)
        .remove()
    }
    return { success: true }
  } catch (e) {
    console.error('删除云端生长记录失败:', e)
    return { success: false, message: e.message }
  }
}

// 删除单条大便记录
async function deletePoop(babyId, poopId) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()
    const result = await db.collection(CLOUD_CONFIG.COLLECTIONS.POOPS)
      .where({ babyId, cloudId: poopId })
      .get()

    if (result.data.length > 0) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.POOPS)
        .doc(result.data[0]._id)
        .remove()
    }
    return { success: true }
  } catch (e) {
    console.error('删除云端大便记录失败:', e)
    return { success: false, message: e.message }
  }
}

// 删除宝宝及其所有数据
async function deleteBaby(babyId) {
  if (!initCloud()) return { success: false, message: '云未初始化' }

  try {
    const db = wx.cloud.database()

    // 删除宝宝基本信息
    const babyResult = await db.collection(CLOUD_CONFIG.COLLECTIONS.BABIES)
      .where({ cloudId: babyId })
      .get()
    for (const doc of babyResult.data) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.BABIES).doc(doc._id).remove()
    }

    // 删除喂养记录
    const feedingResult = await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS)
      .where({ babyId })
      .get()
    for (const doc of feedingResult.data) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS).doc(doc._id).remove()
    }

    // 删除生长记录
    const growthResult = await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS)
      .where({ babyId })
      .get()
    for (const doc of growthResult.data) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS).doc(doc._id).remove()
    }

    // 删除大便记录
    const poopResult = await db.collection(CLOUD_CONFIG.COLLECTIONS.POOPS)
      .where({ babyId })
      .get()
    for (const doc of poopResult.data) {
      await db.collection(CLOUD_CONFIG.COLLECTIONS.POOPS).doc(doc._id).remove()
    }

    return { success: true }
  } catch (e) {
    console.error('删除云端宝宝失败:', e)
    return { success: false, message: e.message }
  }
}

// ==================== 下载函数 ====================

async function downloadBaby(babyId) {
  if (!initCloud()) return null

  try {
    const result = await wx.cloud.database()
      .collection(CLOUD_CONFIG.COLLECTIONS.BABIES)
      .where({ cloudId: babyId })
      .get()

    if (result.data.length > 0) {
      return { ...result.data[0], id: result.data[0].cloudId }
    }
    return null
  } catch (e) {
    console.error('下载宝宝失败:', e)
    return null
  }
}

async function downloadFeedings(babyId) {
  if (!initCloud()) return []

  try {
    const result = await wx.cloud.database()
      .collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS)
      .where({ babyId })
      .orderBy('createTime', 'desc')
      .get()

    return result.data.map(item => ({ ...item, id: item.cloudId }))
  } catch (e) {
    console.error('下载喂养记录失败:', e)
    return []
  }
}

async function downloadGrowths(babyId) {
  if (!initCloud()) return []

  try {
    const result = await wx.cloud.database()
      .collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS)
      .where({ babyId })
      .orderBy('createTime', 'desc')
      .get()

    return result.data.map(item => ({ ...item, id: item.cloudId }))
  } catch (e) {
    console.error('下载生长记录失败:', e)
    return []
  }
}

async function downloadPoops(babyId) {
  if (!initCloud()) return []

  try {
    const result = await wx.cloud.database()
      .collection(CLOUD_CONFIG.COLLECTIONS.POOPS)
      .where({ babyId })
      .orderBy('createTime', 'desc')
      .get()

    return result.data.map(item => ({ ...item, id: item.cloudId }))
  } catch (e) {
    console.error('下载大便记录失败:', e)
    return []
  }
}

// ==================== 全量同步（手动触发） ====================

// 上传所有本地数据到云端（覆盖模式）
async function syncDataToCloud(baby) {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }

  const storage = require('./storage.js')

  try {
    // 上传宝宝
    await uploadBaby(baby)

    // 获取本地数据
    const feedings = storage.getFeedings(baby.id)
    const growths = storage.getGrowths(baby.id)
    const poops = storage.getPoops(baby.id)

    // 上传喂养记录
    for (const f of feedings) {
      await uploadFeeding(baby.id, f)
    }

    // 上传生长记录
    for (const g of growths) {
      await uploadGrowth(baby.id, g)
    }

    // 上传大便记录
    for (const p of poops) {
      await uploadPoop(baby.id, p)
    }

    wx.setStorageSync(`lastSync_${baby.id}`, Date.now())

    return { success: true, message: '同步成功', uploaded: { feedings: feedings.length, growths: growths.length, poops: poops.length } }
  } catch (e) {
    console.error('同步到云端失败:', e)
    return { success: false, message: e.message }
  }
}

// 从云端下载数据到本地（合并模式 - 只添加本地没有的数据）
async function syncDataFromCloud(baby) {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }

  const storage = require('./storage.js')
  const app = getApp()

  try {
    // 下载宝宝信息
    const cloudBaby = await downloadBaby(baby.id)
    if (cloudBaby && !baby.shared) {
      const babies = app.globalData.babies.map(b =>
        b.id === baby.id ? { ...b, ...cloudBaby } : b
      )
      app.globalData.babies = babies
      app.saveBabies()
    }

    let added = { feedings: 0, growths: 0, poops: 0 }

    // 下载喂养记录（只添加本地没有的数据）
    const cloudFeedings = await downloadFeedings(baby.id)
    const localFeedings = storage.getFeedings(baby.id)
    const localFeedingIds = new Set(localFeedings.map(f => f.id))

    for (const f of cloudFeedings) {
      if (!localFeedingIds.has(f.id)) {
        const list = storage.getBabyData(baby.id, 'feedings')
        list.unshift(f)
        storage.setBabyData(baby.id, 'feedings', list)
        added.feedings++
      }
    }

    // 下载生长记录（只添加本地没有的数据）
    const cloudGrowths = await downloadGrowths(baby.id)
    const localGrowths = storage.getGrowths(baby.id)
    const localGrowthIds = new Set(localGrowths.map(g => g.id))

    for (const g of cloudGrowths) {
      if (!localGrowthIds.has(g.id)) {
        const list = storage.getBabyData(baby.id, 'growths')
        list.unshift(g)
        storage.setBabyData(baby.id, 'growths', list)
        added.growths++
      }
    }

    // 下载大便记录（只添加本地没有的数据）
    const cloudPoops = await downloadPoops(baby.id)
    const localPoops = storage.getPoops(baby.id)
    const localPoopIds = new Set(localPoops.map(p => p.id))

    for (const p of cloudPoops) {
      if (!localPoopIds.has(p.id)) {
        const list = storage.getBabyData(baby.id, 'poops')
        list.unshift(p)
        storage.setBabyData(baby.id, 'poops', list)
        added.poops++
      }
    }

    wx.setStorageSync(`lastSync_${baby.id}`, Date.now())

    return { success: true, message: '下载成功', added }
  } catch (e) {
    console.error('从云端同步失败:', e)
    return { success: false, message: e.message }
  }
}

// ==================== 分享功能 ====================

async function createShare(babyId, shareCode) {
  if (!initCloud()) return false

  try {
    const db = wx.cloud.database()
    const coll = db.collection(CLOUD_CONFIG.COLLECTIONS.SHARES)

    // 删除旧分享
    const old = await coll.where({ babyId }).get()
    for (const doc of old.data) {
      await coll.doc(doc._id).remove()
    }

    // 创建新分享
    await coll.add({
      data: { babyId, shareCode, createTime: db.serverDate(), active: true }
    })

    return true
  } catch (e) {
    console.error('创建分享失败:', e)
    return false
  }
}

async function getShareByCode(shareCode) {
  if (!initCloud()) return null

  try {
    const result = await wx.cloud.database()
      .collection(CLOUD_CONFIG.COLLECTIONS.SHARES)
      .where({ shareCode, active: true })
      .get()

    return result.data.length > 0 ? result.data[0] : null
  } catch (e) {
    console.error('获取分享失败:', e)
    return null
  }
}

function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function getSharedBabyFromCloud(shareInfo) {
  if (!isCloudEnabled() || !shareInfo?.babyId) return null

  try {
    const baby = await downloadBaby(shareInfo.babyId)
    if (!baby) return null

    const feedings = await downloadFeedings(shareInfo.babyId)
    const growths = await downloadGrowths(shareInfo.babyId)
    const poops = await downloadPoops(shareInfo.babyId)

    return { baby, feedings, growths, poops }
  } catch (e) {
    console.error('获取共享宝宝失败:', e)
    return null
  }
}

module.exports = {
  initCloud,
  setCloudEnv,
  getCloudEnv,
  isCloudEnabled,
  initDatabase,
  // 单条记录操作
  uploadBaby,
  uploadFeeding,
  uploadGrowth,
  uploadPoop,
  deleteBaby,
  deleteFeeding,
  deleteGrowth,
  deletePoop,
  // 下载
  downloadBaby,
  downloadFeedings,
  downloadGrowths,
  downloadPoops,
  // 全量同步
  syncDataToCloud,
  syncDataFromCloud,
  // 分享
  createShare,
  getShareByCode,
  generateShareCode,
  getSharedBabyFromCloud
}
