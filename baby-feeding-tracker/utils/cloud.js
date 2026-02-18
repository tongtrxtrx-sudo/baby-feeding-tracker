let appInstance = null

function getAppInstance() {
  if (!appInstance) {
    appInstance = getApp()
  }
  return appInstance
}

const CLOUD_CONFIG = {
  COLLECTIONS: {
    BABIES: 'babies',
    FEEDINGS: 'feedings',
    GROWTHS: 'growths',
    SHARES: 'shares'
  }
}

let cloudInited = false

function initCloud() {
  if (cloudInited) return true
  try {
    if (!wx.cloud) {
      console.log('云开发未初始化，请先开通云开发')
      return false
    }
    wx.cloud.init({
      env: wx.getStorageSync('cloudEnvId') || '',
      traceUser: true
    })
    cloudInited = true
    return true
  } catch (e) {
    console.error('云开发初始化失败', e)
    return false
  }
}

function setCloudEnv(envId) {
  wx.setStorageSync('cloudEnvId', envId)
  cloudInited = false
  initCloud()
}

function getCloudEnv() {
  return wx.getStorageSync('cloudEnvId') || ''
}

function isCloudEnabled() {
  return !!getCloudEnv()
}

async function initDatabase() {
  if (!initCloud()) return false
  try {
    const db = wx.cloud.database()
    const collections = Object.values(CLOUD_CONFIG.COLLECTIONS)
    
    for (const collName of collections) {
      try {
        await db.collection(collName).count()
      } catch (e) {
        try {
          await db.createCollection(collName)
        } catch (createErr) {
          console.log(`创建集合 ${collName} 失败:`, createErr)
        }
      }
    }
    return true
  } catch (e) {
    console.error('初始化数据库整体失败', e)
    return false
  }
}

async function uploadBaby(baby) {
  if (!initCloud()) return false
  try {
    const db = wx.cloud.database()
    const { _openid, ...babyData } = baby
    await db.collection(CLOUD_CONFIG.COLLECTIONS.BABIES).doc(baby.id).set({
      data: {
        ...babyData,
        updateTime: db.serverDate()
      }
    })
    return true
  } catch (e) {
    console.error('上传宝宝信息失败', e)
    return false
  }
}

async function autoUploadFeeding(babyId, feeding) {
  if (!isCloudEnabled() || !initCloud()) return false
  try {
    const db = wx.cloud.database()
    const { _openid, ...feedingData } = feeding
    await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS).doc(feeding.id).set({
      data: {
        babyId,
        ...feedingData,
        updateTime: db.serverDate()
      }
    })
    return true
  } catch (e) {
    console.error('自动上传喂养记录失败', e)
    return false
  }
}

async function autoUploadGrowth(babyId, growth) {
  if (!isCloudEnabled() || !initCloud()) return false
  try {
    const db = wx.cloud.database()
    const { _openid, ...growthData } = growth
    await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS).doc(growth.id).set({
      data: {
        babyId,
        ...growthData,
        updateTime: db.serverDate()
      }
    })
    return true
  } catch (e) {
    console.error('自动上传生长记录失败', e)
    return false
  }
}

async function downloadBaby(babyId) {
  if (!initCloud()) return null
  try {
    const db = wx.cloud.database()
    const result = await db.collection(CLOUD_CONFIG.COLLECTIONS.BABIES).doc(babyId).get()
    return result.data
  } catch (e) {
    console.error('下载宝宝信息失败', e)
    return null
  }
}

async function uploadFeeding(babyId, feeding) {
  if (!initCloud()) return false
  try {
    const db = wx.cloud.database()
    const { _openid, ...feedingData } = feeding
    await db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS).doc(feeding.id).set({
      data: {
        babyId,
        ...feedingData,
        updateTime: db.serverDate()
      }
    })
    return true
  } catch (e) {
    console.error('上传喂养记录失败', e)
    return false
  }
}

async function downloadFeedings(babyId, sinceTime = 0) {
  if (!initCloud()) return []
  try {
    const db = wx.cloud.database()
    const _ = db.command
    let query = db.collection(CLOUD_CONFIG.COLLECTIONS.FEEDINGS).where({
      babyId: babyId
    })
    if (sinceTime > 0) {
      query = query.where({
        createTime: _.gt(sinceTime)
      })
    }
    const result = await query.orderBy('createTime', 'desc').get()
    return result.data
  } catch (e) {
    console.error('下载喂养记录失败', e)
    return []
  }
}

async function uploadGrowth(babyId, growth) {
  if (!initCloud()) return false
  try {
    const db = wx.cloud.database()
    const { _openid, ...growthData } = growth
    await db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS).doc(growth.id).set({
      data: {
        babyId,
        ...growthData,
        updateTime: db.serverDate()
      }
    })
    return true
  } catch (e) {
    console.error('上传生长记录失败', e)
    return false
  }
}

async function downloadGrowths(babyId, sinceTime = 0) {
  if (!initCloud()) return []
  try {
    const db = wx.cloud.database()
    const _ = db.command
    let query = db.collection(CLOUD_CONFIG.COLLECTIONS.GROWTHS).where({
      babyId: babyId
    })
    if (sinceTime > 0) {
      query = query.where({
        createTime: _.gt(sinceTime)
      })
    }
    const result = await query.orderBy('createTime', 'desc').get()
    return result.data
  } catch (e) {
    console.error('下载生长记录失败', e)
    return []
  }
}

async function createShare(babyId, shareCode) {
  if (!initCloud()) {
    console.error('createShare: 云开发未初始化')
    return false
  }
  try {
    const db = wx.cloud.database()
    await db.collection(CLOUD_CONFIG.COLLECTIONS.SHARES).where({
      shareCode: shareCode
    }).remove()
    await db.collection(CLOUD_CONFIG.COLLECTIONS.SHARES).add({
      data: {
        babyId,
        shareCode,
        createTime: db.serverDate(),
        active: true
      }
    })
    return true
  } catch (e) {
    console.error('创建共享失败:', e)
    return false
  }
}

async function getShareByCode(shareCode) {
  if (!initCloud()) return null
  try {
    const db = wx.cloud.database()
    const result = await db.collection(CLOUD_CONFIG.COLLECTIONS.SHARES).where({
      shareCode,
      active: true
    }).get()
    if (result.data.length > 0) {
      return result.data[0]
    }
    return null
  } catch (e) {
    console.error('获取共享信息失败', e)
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

async function syncBabyToCloud(baby) {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  try {
    await uploadBaby(baby)
    return { success: true, message: '宝宝信息已上传' }
  } catch (e) {
    return { success: false, message: e.message || '上传失败' }
  }
}

async function syncFeedingsToCloud(babyId, feedings) {
  if (!isCloudEnabled() || !feedings || feedings.length === 0) return { success: true, message: '无新数据' }
  
  const lastSyncTime = wx.getStorageSync(`lastSync_${babyId}`) || 0
  const newFeedings = feedings.filter(f => f.createTime > lastSyncTime)
  
  if (newFeedings.length === 0) {
    return { success: true, message: '无新数据' }
  }

  try {
    for (const feeding of newFeedings) {
      await uploadFeeding(babyId, feeding)
    }
    return { success: true, message: `已上传${newFeedings.length}条喂养记录` }
  } catch (e) {
    return { success: false, message: e.message || '上传失败' }
  }
}

async function syncGrowthsToCloud(babyId, growths) {
  if (!isCloudEnabled() || !growths || growths.length === 0) return { success: true, message: '无新数据' }
  
  const lastSyncTime = wx.getStorageSync(`lastSync_${babyId}`) || 0
  const newGrowths = growths.filter(g => g.createTime > lastSyncTime)
  
  if (newGrowths.length === 0) {
    return { success: true, message: '无新数据' }
  }

  try {
    for (const growth of newGrowths) {
      await uploadGrowth(babyId, growth)
    }
    return { success: true, message: `已上传${newGrowths.length}条生长记录` }
  } catch (e) {
    return { success: false, message: e.message || '上传失败' }
  }
}

async function syncDataToCloud(baby) {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  const storage = require('./storage.js')
  
  try {
    await uploadBaby(baby)
    
    const feedings = storage.getFeedings(baby.id)
    await syncFeedingsToCloud(baby.id, feedings)
    
    const growths = storage.getGrowths(baby.id)
    await syncGrowthsToCloud(baby.id, growths)
    
    wx.setStorageSync(`lastSync_${baby.id}`, Date.now())
    
    return { success: true, message: '同步成功' }
  } catch (e) {
    console.error('上传数据失败:', e)
    return { success: false, message: e.message || '同步失败' }
  }
}

async function syncDataFromCloud(baby, options = {}) {
  const { force = false } = options
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  const storage = require('./storage.js')
  const app = getAppInstance()
  
  try {
    const lastSyncTime = force ? 0 : (wx.getStorageSync(`lastSync_${baby.id}`) || 0)
    
    const cloudBaby = await downloadBaby(baby.id)
    if (cloudBaby && !baby.shared) {
      const babies = app.globalData.babies.map(b => {
        if (b.id === baby.id) {
          return { ...b, ...cloudBaby }
        }
        return b
      })
      app.globalData.babies = babies
      app.saveBabies()
    }
    
    const cloudFeedings = await downloadFeedings(baby.id, lastSyncTime)
    const localFeedings = storage.getFeedings(baby.id)
    const localFeedingIds = new Set(localFeedings.map(f => f.id))
    
    let newFeedingCount = 0
    for (const feeding of cloudFeedings) {
      if (!localFeedingIds.has(feeding.id)) {
        const babyFeedings = storage.getBabyData(baby.id, 'feedings')
        babyFeedings.unshift(feeding)
        storage.setBabyData(baby.id, 'feedings', babyFeedings)
        newFeedingCount++
      }
    }
    
    const cloudGrowths = await downloadGrowths(baby.id, lastSyncTime)
    const localGrowths = storage.getGrowths(baby.id)
    const localGrowthIds = new Set(localGrowths.map(g => g.id))
    
    let newGrowthCount = 0
    for (const growth of cloudGrowths) {
      if (!localGrowthIds.has(growth.id)) {
        const babyGrowths = storage.getBabyData(baby.id, 'growths')
        babyGrowths.unshift(growth)
        storage.setBabyData(baby.id, 'growths', babyGrowths)
        newGrowthCount++
      }
    }
    
    wx.setStorageSync(`lastSync_${baby.id}`, Date.now())
    
    let message = ''
    if (newFeedingCount > 0 || newGrowthCount > 0) {
      message = `新增${newFeedingCount}条喂养，${newGrowthCount}条生长`
    } else {
      message = '已是最新数据'
    }
    
    return { success: true, message }
  } catch (e) {
    console.error('下载数据失败:', e)
    return { success: false, message: e.message || '同步失败' }
  }
}

async function syncAllBabiesToCloud() {
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  const app = getAppInstance()
  const storage = require('./storage.js')
  const result = { success: true, synced: 0, failed: 0, messages: [] }
  
  for (const baby of app.globalData.babies) {
    try {
      const babyResult = await syncDataToCloud(baby)
      if (babyResult.success) {
        result.synced++
        result.messages.push(`${baby.name}: ${babyResult.message}`)
      } else {
        result.failed++
        result.messages.push(`${baby.name}: ${babyResult.message}`)
      }
    } catch (e) {
      result.failed++
      result.messages.push(`${baby.name}: 上传失败`)
    }
  }
  
  const sharedBabies = wx.getStorageSync('sharedBabies') || []
  for (const baby of sharedBabies) {
    try {
      const feedings = storage.getFeedings(baby.id)
      await syncFeedingsToCloud(baby.id, feedings)
      
      const growths = storage.getGrowths(baby.id)
      await syncGrowthsToCloud(baby.id, growths)
      
      result.synced++
      result.messages.push(`${baby.name}(共享): 已上传`)
    } catch (e) {
      result.failed++
      result.messages.push(`${baby.name}(共享): 上传失败`)
    }
  }
  
  if (result.failed > 0) {
    result.success = false
  }
  
  return result
}

async function syncAllBabiesFromCloud() {
  console.log('syncAllBabiesFromCloud 被调用')
  console.log('isCloudEnabled:', isCloudEnabled())
  
  if (!isCloudEnabled()) return { success: false, message: '未启用云同步' }
  
  const storage = require('./storage.js')
  const result = { success: true, synced: 0, failed: 0, messages: [] }
  
  const babies = wx.getStorageSync('babies') || []
  console.log('syncAllBabiesFromCloud - 宝宝列表:', babies.length)
  
  for (const baby of babies) {
    console.log('正在同步宝宝:', baby.name, baby.id)
    try {
      const babyResult = await syncDataFromCloud(baby)
      console.log('宝宝同步结果:', baby.name, babyResult)
      if (babyResult.success) {
        result.synced++
        result.messages.push(`${baby.name}: ${babyResult.message}`)
      } else {
        result.failed++
        result.messages.push(`${baby.name}: ${babyResult.message}`)
      }
    } catch (e) {
      console.error('宝宝同步异常:', baby.name, e)
      result.failed++
      result.messages.push(`${baby.name}: 下载失败`)
    }
  }
  
  const sharedBabies = wx.getStorageSync('sharedBabies') || []
  console.log('syncAllBabiesFromCloud - 共享宝宝列表:', sharedBabies.length)
  
  for (const baby of sharedBabies) {
    console.log('正在同步共享宝宝:', baby.name, baby.id)
    try {
      const babyResult = await syncDataFromCloud(baby)
      console.log('共享宝宝同步结果:', baby.name, babyResult)
      if (babyResult.success) {
        result.synced++
        result.messages.push(`${baby.name}(共享): ${babyResult.message}`)
      } else {
        result.failed++
        result.messages.push(`${baby.name}(共享): ${babyResult.message}`)
      }
    } catch (e) {
      console.error('共享宝宝同步异常:', baby.name, e)
      result.failed++
      result.messages.push(`${baby.name}(共享): 下载失败`)
    }
  }
  
  if (result.failed > 0) {
    result.success = false
  }
  
  return result
}

async function getSharedBabyFromCloud(shareInfo) {
  if (!isCloudEnabled() || !shareInfo || !shareInfo.babyId) return null
  try {
    const baby = await downloadBaby(shareInfo.babyId)
    if (!baby) return null

    const feedings = await downloadFeedings(shareInfo.babyId)
    const growths = await downloadGrowths(shareInfo.babyId)

    return { baby, feedings, growths }
  } catch (e) {
    console.error('获取共享宝宝数据失败', e)
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
  downloadBaby,
  uploadFeeding,
  downloadFeedings,
  uploadGrowth,
  downloadGrowths,
  autoUploadFeeding,
  autoUploadGrowth,
  createShare,
  getShareByCode,
  generateShareCode,
  syncBabyToCloud,
  syncFeedingsToCloud,
  syncGrowthsToCloud,
  syncDataToCloud,
  syncDataFromCloud,
  syncAllBabiesToCloud,
  syncAllBabiesFromCloud,
  getSharedBabyFromCloud
}
