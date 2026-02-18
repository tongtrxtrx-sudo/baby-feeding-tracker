const storage = require('./storage.js')
const growthStandard = require('./growth-standard.js')

function calculateBMIFromGrowth(growth) {
  if (!growth || !growth.weight || !growth.height) return null
  return growth.weight / Math.pow(growth.height / 100, 2)
}

function getFeedingAdvice(baby, todayTotalMilk) {
  const ageInMonths = growthStandard.calculateAgeInMonths(baby.birthDate)
  let recommended = 0
  let advice = ''

  if (ageInMonths < 1) {
    recommended = 500
    advice = '新生儿按需喂养，每次60-90ml，每天8-12次'
  } else if (ageInMonths < 3) {
    recommended = 750
    advice = '每次90-120ml，每天6-8次'
  } else if (ageInMonths < 6) {
    recommended = 900
    advice = '每次120-180ml，每天5-6次'
  } else if (ageInMonths < 12) {
    recommended = 800
    advice = '每次180-240ml，每天4-5次，开始添加辅食'
  } else if (ageInMonths < 24) {
    recommended = 500
    advice = '每天300-500ml，辅食为主'
  }

  const diff = todayTotalMilk - recommended
  let status = '正常'
  let statusColor = '#52C41A'

  if (diff < -200) {
    status = '不足'
    statusColor = '#FF4D4F'
  } else if (diff < -100) {
    status = '偏少'
    statusColor = '#FAAD14'
  } else if (diff > 200) {
    status = '过量'
    statusColor = '#FAAD14'
  }

  return {
    recommended,
    actual: todayTotalMilk,
    diff,
    status,
    statusColor,
    advice,
    ageInMonths
  }
}

function getGrowthAdvice(baby, latestGrowth) {
  if (!latestGrowth) return null

  const ageInMonths = growthStandard.calculateAgeInMonths(baby.birthDate)
  const gender = baby.gender === 'boy' ? 'boys' : 'girls'

  const weightStandard = growthStandard.getStandardForAge(gender, 'weight', ageInMonths)
  const heightStandard = growthStandard.getStandardForAge(gender, 'height', ageInMonths)

  const weightPercentile = growthStandard.calculatePercentile(latestGrowth.weight, weightStandard)
  const heightPercentile = growthStandard.calculatePercentile(latestGrowth.height, heightStandard)

  const weightStatus = growthStandard.getGrowthStatus(weightPercentile)
  const heightStatus = growthStandard.getGrowthStatus(heightPercentile)

  let advices = []

  if (weightStatus.level === 'danger') {
    if (weightPercentile < 3) {
      advices.push('体重增长较慢，建议增加喂养次数和奶量')
    } else {
      advices.push('体重增长过快，建议适当控制奶量，增加活动量')
    }
  }

  if (heightStatus.level === 'danger') {
    if (heightPercentile < 3) {
      advices.push('身高增长较慢，建议补充维生素D，多晒太阳')
    } else {
      advices.push('身高增长较好，继续保持')
    }
  }

  if (advices.length === 0) {
    advices.push('宝宝生长发育良好，继续保持当前的喂养方式')
  }

  return {
    weight: {
      value: latestGrowth.weight,
      percentile: weightPercentile,
      status: weightStatus,
      standard: weightStandard
    },
    height: {
      value: latestGrowth.height,
      percentile: heightPercentile,
      status: heightStatus,
      standard: heightStandard
    },
    advices,
    ageInMonths
  }
}

function generateReport(baby) {
  const feedings = storage.getFeedings(baby.id)
  const growths = storage.getGrowths(baby.id)
  const todayTotalMilk = storage.getTodayTotalMilk(baby.id)

  const feedingAdvice = getFeedingAdvice(baby, todayTotalMilk)
  const latestGrowth = growths.length > 0 ? growths[0] : null
  const growthAdvice = latestGrowth ? getGrowthAdvice(baby, latestGrowth) : null

  return {
    feeding: feedingAdvice,
    growth: growthAdvice,
    stats: {
      totalFeedings: feedings.length,
      totalGrowths: growths.length,
      todayTotalMilk
    }
  }
}

module.exports = {
  calculateBMIFromGrowth,
  getFeedingAdvice,
  getGrowthAdvice,
  generateReport
}
