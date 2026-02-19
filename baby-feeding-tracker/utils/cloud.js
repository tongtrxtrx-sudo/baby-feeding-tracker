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

// 上传宝宝
async function uploadBaby(baby) {
  if (!initCloud()) return { success: false }
  
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
    return { success: false, error: e.message }
  }
}

// 上传喂养记录
async function autoUploadFeeding(babyId, feeding) {
  if (!initCloud()) return { success: false }
  
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
    return { success: false, error: e.message }
  }
}

// 上传生长记录
async function autoUploadGrowth(babyId, growth) {
  if (!initCloud()) return { success: false }
  
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
    return { success: false, error: e.message }
  }
}

// 上传大便记录
async function autoUploadPoop(babyId, poop) {
  if (!initCloud()) return { success: false }
  
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
    return { success: false, error: e.message }
  }
}

// 下载宝宝
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
    return null
  }
}

// 下载喂养记录
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
    return []
  }
}

// 下载生长记录
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
    return []
  }
}

// 下载大便记录
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
    return []
  }
}

// 创建分享
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
    return false
  }
}

// 通过分享码获取
async function getShareByCode(shareCode) {
  if (!initCloud()) return null
  
  try {
    const result = await wx.cloud.database()
      .collection(CLOUD_CONFIG.COLLECTIONS.SHARES)
      .where({ shareCode, active: true })
      .get()
    
    return result.data.length > 0 ? result.data[0] : null
  } catch (e) {
    return null
  }
}

// 生成分享码
function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 同步数据到云端
async function syncDataToCloud(baby) {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  const storage = require('./storage.js')
  
  try {
    // 上传宝宝
    await uploadBaby(baby)
    
    // 上传喂养记录
    const feedings = storage.getFeedings(baby.id)
    for (const f of feedings) {
      await autoUploadFeeding(baby.id, f)
    }
    
    // 上传生长记录
    const growths = storage.getGrowths(baby.id)
    for (const g of growths) {
      await autoUploadGrowth(baby.id, g)
    }
    
    // 上传大便记录
    const poops = storage.getPoops(baby.id)
    for (const p of poops) {
      await autoUploadPoop(baby.id, p)
    }
    
    wx.setStorageSync(`lastSync_${baby.id}`, Date.now())
    
    return { success: true, message: '同步成功' }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// 从云端同步数据
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
    
    // 下载喂养记录
    const cloudFeedings = await downloadFeedings(baby.id)
    const localFeedings = storage.getFeedings(baby.id)
    const localIds = new Set(localFeedings.map(f => f.id))
    
    for (const f of cloudFeedings) {
      if (!localIds.has(f.id)) {
        const list = storage.getBabyData(baby.id, 'feedings')
        list.unshift(f)
        storage.setBabyData(baby.id, 'feedings', list)
      }
    }
    
    // 下载生长记录
    const cloudGrowths = await downloadGrowths(baby.id)
    const localGrowths = storage.getGrowths(baby.id)
    const localGrowthIds = new Set(localGrowths.map(g => g.id))
    
    for (const g of cloudGrowths) {
      if (!localGrowthIds.has(g.id)) {
        const list = storage.getBabyData(baby.id, 'growths')
        list.unshift(g)
        storage.setBabyData(baby.id, 'growths', list)
      }
    }
    
    // 下载大便记录
    const cloudPoops = await downloadPoops(baby.id)
    const localPoops = storage.getPoops(baby.id)
    const localPoopIds = new Set(localPoops.map(p => p.id))
    
    for (const p of cloudPoops) {
      if (!localPoopIds.has(p.id)) {
        const list = storage.getBabyData(baby.id, 'poops')
        list.unshift(p)
        storage.setBabyData(baby.id, 'poops', list)
      }
    }
    
    wx.setStorageSync(`lastSync_${baby.id}`, Date.now())
    
    return { success: true, message: '下载成功' }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// 同步所有宝宝到云端
async function syncAllBabiesToCloud() {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  const app = getApp()
  let synced = 0
  
  for (const baby of app.globalData.babies) {
    const result = await syncDataToCloud(baby)
    if (result.success) synced++
  }
  
  return { success: true, synced }
}

// 从云端同步所有宝宝
async function syncAllBabiesFromCloud() {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  const app = getApp()
  let synced = 0
  
  for (const baby of app.globalData.babies) {
    const result = await syncDataFromCloud(baby)
    if (result.success) synced++
  }
  
  return { success: true, synced }
}

// 获取共享宝宝数据
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
    return null
  }
}

module.exports = {
  initCloud,
  setCloudEnv,
  getCloudEnv,
  isCloudEnabled,
  initDatabase,
  uploadBaby,
  autoUploadFeeding,
  autoUploadGrowth,
  autoUploadPoop,
  downloadBaby,
  downloadFeedings,
  downloadGrowths,
  downloadPoops,
  createShare,
  getShareByCode,
  generateShareCode,
  syncDataToCloud,
  syncDataFromCloud,
  syncAllBabiesToCloud,
  syncAllBabiesFromCloud,
  getSharedBabyFromCloud
}
