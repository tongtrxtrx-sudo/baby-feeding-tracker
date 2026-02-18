function convertStandardsToArrayFormat(standards) {
  const result = {
    months: [],
    p3: [],
    p15: [],
    p50: [],
    p85: [],
    p97: []
  }
  
  standards.forEach(item => {
    result.months.push(item.month)
    result.p3.push(item.p3)
    result.p15.push(item.p15)
    result.p50.push(item.p50)
    result.p85.push(item.p85)
    result.p97.push(item.p97)
  })
  
  return result
}

const WHO_STANDARDS_ARRAY = {
  boys: {
    weight: [
      { month: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.8, p97: 4.3 },
      { month: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.8 },
      { month: 2, p3: 4.3, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.0 },
      { month: 3, p3: 5.0, p15: 5.7, p50: 6.4, p85: 7.2, p97: 8.0 },
      { month: 4, p3: 5.6, p15: 6.3, p50: 7.0, p85: 7.8, p97: 8.7 },
      { month: 5, p3: 6.1, p15: 6.8, p50: 7.5, p85: 8.4, p97: 9.3 },
      { month: 6, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.8, p97: 9.8 },
      { month: 7, p3: 6.7, p15: 7.4, p50: 8.3, p85: 9.2, p97: 10.2 },
      { month: 8, p3: 7.0, p15: 7.8, p50: 8.6, p85: 9.6, p97: 10.6 },
      { month: 9, p3: 7.2, p15: 8.0, p50: 8.9, p85: 9.9, p97: 10.9 },
      { month: 10, p3: 7.4, p15: 8.2, p50: 9.2, p85: 10.2, p97: 11.3 },
      { month: 11, p3: 7.6, p15: 8.4, p50: 9.4, p85: 10.5, p97: 11.6 },
      { month: 12, p3: 7.8, p15: 8.6, p50: 9.6, p85: 10.8, p97: 12.0 },
      { month: 18, p3: 8.8, p15: 9.7, p50: 10.8, p85: 12.0, p97: 13.3 },
      { month: 24, p3: 9.7, p15: 10.7, p50: 11.8, p85: 13.0, p97: 14.5 }
    ],
    height: [
      { month: 0, p3: 46.3, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.6 },
      { month: 1, p3: 51.1, p15: 52.8, p50: 54.7, p85: 56.7, p97: 58.4 },
      { month: 2, p3: 54.7, p15: 56.5, p50: 58.4, p85: 60.4, p97: 62.2 },
      { month: 3, p3: 57.6, p15: 59.5, p50: 61.4, p85: 63.5, p97: 65.3 },
      { month: 4, p3: 60.0, p15: 61.9, p50: 63.9, p85: 66.0, p97: 67.9 },
      { month: 5, p3: 62.0, p15: 63.9, p50: 65.9, p85: 68.0, p97: 70.0 },
      { month: 6, p3: 63.6, p15: 65.5, p50: 67.6, p85: 69.8, p97: 71.8 },
      { month: 7, p3: 65.1, p15: 67.0, p50: 69.2, p85: 71.4, p97: 73.5 },
      { month: 8, p3: 66.5, p15: 68.4, p50: 70.6, p85: 72.9, p97: 75.0 },
      { month: 9, p3: 67.7, p15: 69.7, p50: 72.0, p85: 74.3, p97: 76.5 },
      { month: 10, p3: 68.9, p15: 71.0, p50: 73.3, p85: 75.6, p97: 77.9 },
      { month: 11, p3: 70.0, p15: 72.1, p50: 74.5, p85: 76.9, p97: 79.2 },
      { month: 12, p3: 71.0, p15: 73.1, p50: 75.7, p85: 78.1, p97: 80.5 },
      { month: 18, p3: 76.9, p15: 79.1, p50: 81.6, p85: 84.2, p97: 86.8 },
      { month: 24, p3: 81.6, p15: 83.8, p50: 86.5, p85: 89.2, p97: 92.1 }
    ]
  },
  girls: {
    weight: [
      { month: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.6, p97: 4.0 },
      { month: 1, p3: 3.2, p15: 3.6, p50: 4.2, p85: 4.7, p97: 5.3 },
      { month: 2, p3: 3.9, p15: 4.5, p50: 5.1, p85: 5.8, p97: 6.5 },
      { month: 3, p3: 4.5, p15: 5.1, p50: 5.8, p85: 6.6, p97: 7.4 },
      { month: 4, p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.2, p97: 8.1 },
      { month: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.7, p97: 8.6 },
      { month: 6, p3: 5.8, p15: 6.5, p50: 7.3, p85: 8.1, p97: 9.1 },
      { month: 7, p3: 6.1, p15: 6.8, p50: 7.6, p85: 8.5, p97: 9.5 },
      { month: 8, p3: 6.3, p15: 7.0, p50: 7.9, p85: 8.8, p97: 9.9 },
      { month: 9, p3: 6.6, p15: 7.3, p50: 8.2, p85: 9.2, p97: 10.2 },
      { month: 10, p3: 6.8, p15: 7.5, p50: 8.5, p85: 9.5, p97: 10.5 },
      { month: 11, p3: 6.9, p15: 7.7, p50: 8.7, p85: 9.7, p97: 10.8 },
      { month: 12, p3: 7.1, p15: 7.9, p50: 8.9, p85: 10.0, p97: 11.1 },
      { month: 18, p3: 8.1, p15: 9.0, p50: 10.0, p85: 11.2, p97: 12.5 },
      { month: 24, p3: 9.0, p15: 9.9, p50: 11.0, p85: 12.3, p97: 13.7 }
    ],
    height: [
      { month: 0, p3: 45.6, p15: 47.3, p50: 49.1, p85: 51.0, p97: 52.7 },
      { month: 1, p3: 50.0, p15: 51.7, p50: 53.7, p85: 55.6, p97: 57.4 },
      { month: 2, p3: 53.4, p15: 55.1, p50: 57.1, p85: 59.1, p97: 60.9 },
      { month: 3, p3: 56.2, p15: 58.0, p50: 60.0, p85: 62.0, p97: 63.9 },
      { month: 4, p3: 58.4, p15: 60.3, p50: 62.1, p85: 64.3, p97: 66.2 },
      { month: 5, p3: 60.3, p15: 62.1, p50: 64.0, p85: 66.2, p97: 68.2 },
      { month: 6, p3: 61.8, p15: 63.7, p50: 65.7, p85: 67.9, p97: 70.0 },
      { month: 7, p3: 63.2, p15: 65.1, p50: 67.3, p85: 69.5, p97: 71.6 },
      { month: 8, p3: 64.5, p15: 66.4, p50: 68.7, p85: 71.0, p97: 73.2 },
      { month: 9, p3: 65.7, p15: 67.7, p50: 70.1, p85: 72.4, p97: 74.7 },
      { month: 10, p3: 66.8, p15: 68.9, p50: 71.3, p85: 73.8, p97: 76.1 },
      { month: 11, p3: 67.9, p15: 70.0, p50: 72.6, p85: 75.1, p97: 77.5 },
      { month: 12, p3: 68.9, p15: 71.0, p50: 73.7, p85: 76.3, p97: 78.8 },
      { month: 18, p3: 74.9, p15: 77.1, p50: 79.7, p85: 82.4, p97: 85.2 },
      { month: 24, p3: 80.0, p15: 82.3, p50: 84.9, p85: 87.7, p97: 90.5 }
    ]
  }
}

const WHO_STANDARDS = {
  boys: {
    weight: convertStandardsToArrayFormat(WHO_STANDARDS_ARRAY.boys.weight),
    height: convertStandardsToArrayFormat(WHO_STANDARDS_ARRAY.boys.height)
  },
  girls: {
    weight: convertStandardsToArrayFormat(WHO_STANDARDS_ARRAY.girls.weight),
    height: convertStandardsToArrayFormat(WHO_STANDARDS_ARRAY.girls.height)
  }
}

function getStandardForAge(gender, type, ageInMonths) {
  const standardsArray = WHO_STANDARDS_ARRAY[gender] && WHO_STANDARDS_ARRAY[gender][type]
  if (!standardsArray) return null

  let lower = standardsArray[0]
  let upper = standardsArray[standardsArray.length - 1]

  for (let i = 0; i < standardsArray.length - 1; i++) {
    if (ageInMonths >= standardsArray[i].month && ageInMonths <= standardsArray[i + 1].month) {
      lower = standardsArray[i]
      upper = standardsArray[i + 1]
      break
    }
  }

  if (ageInMonths <= lower.month) return lower
  if (ageInMonths >= upper.month) return upper

  const ratio = (ageInMonths - lower.month) / (upper.month - lower.month)
  return {
    month: ageInMonths,
    p3: lower.p3 + (upper.p3 - lower.p3) * ratio,
    p15: lower.p15 + (upper.p15 - lower.p15) * ratio,
    p50: lower.p50 + (upper.p50 - lower.p50) * ratio,
    p85: lower.p85 + (upper.p85 - lower.p85) * ratio,
    p97: lower.p97 + (upper.p97 - lower.p97) * ratio
  }
}

function calculatePercentile(value, standard) {
  if (!standard) return null

  if (value <= standard.p3) return 3
  if (value >= standard.p97) return 97

  if (value <= standard.p15) {
    return 3 + (12 * (value - standard.p3) / (standard.p15 - standard.p3))
  } else if (value <= standard.p50) {
    return 15 + (35 * (value - standard.p15) / (standard.p50 - standard.p15))
  } else if (value <= standard.p85) {
    return 50 + (35 * (value - standard.p50) / (standard.p85 - standard.p50))
  } else {
    return 85 + (12 * (value - standard.p85) / (standard.p97 - standard.p85))
  }
}

function getGrowthStatus(percentile) {
  if (percentile < 3) return { status: '偏低', level: 'danger', color: '#FF4D4F' }
  if (percentile < 15) return { status: '偏矮', level: 'warning', color: '#FAAD14' }
  if (percentile < 85) return { status: '正常', level: 'success', color: '#52C41A' }
  if (percentile < 97) return { status: '偏高', level: 'warning', color: '#FAAD14' }
  return { status: '过高', level: 'danger', color: '#FF4D4F' }
}

function calculateAgeInMonths(birthDate, targetDate) {
  const birth = new Date(birthDate)
  const target = targetDate ? new Date(targetDate) : new Date()
  return (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth())
}

module.exports = {
  WHO_STANDARDS,
  getStandardForAge,
  calculatePercentile,
  getGrowthStatus,
  calculateAgeInMonths
}
