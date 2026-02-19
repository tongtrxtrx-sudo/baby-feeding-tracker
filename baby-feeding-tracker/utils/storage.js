const STORAGE_KEYS = {
  BABIES: 'babies',
  FEEDINGS: 'feedings',
  GROWTHS: 'growths',
  POOPS: 'poops'
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTime(date) {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function getBabyData(babyId, key) {
  const data = wx.getStorageSync(`${key}_${babyId}`) || []
  return data
}

function setBabyData(babyId, key, data) {
  wx.setStorageSync(`${key}_${babyId}`, data)
}

function addFeeding(babyId, feeding) {
  const feedings = getBabyData(babyId, STORAGE_KEYS.FEEDINGS)
  feeding.id = generateId()
  feeding.createTime = Date.now()
  feedings.unshift(feeding)
  setBabyData(babyId, STORAGE_KEYS.FEEDINGS, feedings)
  return feeding
}

function formatFeedingTime(feeding) {
  if (feeding.time) {
    return feeding.time
  }
  return formatTime(feeding.createTime)
}

function getFeedings(babyId) {
  return getBabyData(babyId, STORAGE_KEYS.FEEDINGS)
}

function deleteFeeding(babyId, feedingId) {
  let feedings = getBabyData(babyId, STORAGE_KEYS.FEEDINGS)
  feedings = feedings.filter(f => f.id !== feedingId)
  setBabyData(babyId, STORAGE_KEYS.FEEDINGS, feedings)
}

function updateFeeding(babyId, feedingId, feedingData) {
  let feedings = getBabyData(babyId, STORAGE_KEYS.FEEDINGS)
  const index = feedings.findIndex(f => f.id === feedingId)
  if (index !== -1) {
    feedings[index] = { ...feedings[index], ...feedingData }
    setBabyData(babyId, STORAGE_KEYS.FEEDINGS, feedings)
    return feedings[index]
  }
  return null
}

function addGrowth(babyId, growth) {
  const growths = getBabyData(babyId, STORAGE_KEYS.GROWTHS)
  growth.id = generateId()
  growth.createTime = Date.now()
  growths.unshift(growth)
  setBabyData(babyId, STORAGE_KEYS.GROWTHS, growths)
  return growth
}

function getGrowths(babyId) {
  return getBabyData(babyId, STORAGE_KEYS.GROWTHS)
}

function deleteGrowth(babyId, growthId) {
  let growths = getBabyData(babyId, STORAGE_KEYS.GROWTHS)
  growths = growths.filter(g => g.id !== growthId)
  setBabyData(babyId, STORAGE_KEYS.GROWTHS, growths)
}

function updateGrowth(babyId, growthId, growthData) {
  let growths = getBabyData(babyId, STORAGE_KEYS.GROWTHS)
  const index = growths.findIndex(g => g.id === growthId)
  if (index !== -1) {
    growths[index] = { ...growths[index], ...growthData }
    setBabyData(babyId, STORAGE_KEYS.GROWTHS, growths)
    return growths[index]
  }
  return null
}

function getTodayFeedings(babyId) {
  const feedings = getFeedings(babyId)
  const today = formatDate(new Date())
  return feedings.filter(f => formatDate(f.createTime) === today)
}

function getTodayTotalMilk(babyId) {
  const todayFeedings = getTodayFeedings(babyId)
  return todayFeedings.reduce((sum, f) => sum + (f.amount || 0), 0)
}

function addPoop(babyId, poop) {
  const poops = getBabyData(babyId, STORAGE_KEYS.POOPS)
  poop.id = generateId()
  poop.createTime = Date.now()
  poops.unshift(poop)
  setBabyData(babyId, STORAGE_KEYS.POOPS, poops)
  return poop
}

function getPoops(babyId) {
  return getBabyData(babyId, STORAGE_KEYS.POOPS)
}

function getTodayPoops(babyId) {
  const poops = getPoops(babyId)
  const today = formatDate(new Date())
  return poops.filter(p => formatDate(p.createTime) === today)
}

function deletePoop(babyId, poopId) {
  let poops = getBabyData(babyId, STORAGE_KEYS.POOPS)
  poops = poops.filter(p => p.id !== poopId)
  setBabyData(babyId, STORAGE_KEYS.POOPS, poops)
}

function updatePoop(babyId, poopId, poopData) {
  let poops = getBabyData(babyId, STORAGE_KEYS.POOPS)
  const index = poops.findIndex(p => p.id === poopId)
  if (index !== -1) {
    poops[index] = { ...poops[index], ...poopData }
    setBabyData(babyId, STORAGE_KEYS.POOPS, poops)
    return poops[index]
  }
  return null
}

module.exports = {
  generateId,
  formatDate,
  formatTime,
  formatFeedingTime,
  getBabyData,
  setBabyData,
  addFeeding,
  getFeedings,
  updateFeeding,
  deleteFeeding,
  addGrowth,
  getGrowths,
  updateGrowth,
  deleteGrowth,
  getTodayFeedings,
  getTodayTotalMilk,
  addPoop,
  getPoops,
  getTodayPoops,
  deletePoop,
  updatePoop
}
