export function validatePhone(phone) {
  if (!phone) return false
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Minimum length check
  if (cleaned.length < 10) {
    return false
  }
  
  // Maximum length check
  if (cleaned.length > 15) {
    return false
  }
  
  // Check various phone formats
  // Russia: +7XXXXXXXXXX, 8XXXXXXXXXX
  if (cleaned.startsWith('+7') && cleaned.length === 12) {
    return true
  } else if (cleaned.startsWith('8') && cleaned.length === 11) {
    return true
  } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
    return true
  } else if (cleaned.length >= 10 && cleaned.length <= 15) {
    return true
  }
  
  return false
}

export function validateClassName(className) {
  if (!className) return false
  
  // Remove spaces
  const cleaned = className.trim()
  
  // Check length (1-5 characters)
  if (cleaned.length < 1 || cleaned.length > 5) {
    return false
  }
  
  // Check format: number + optional letter (e.g., "10", "10А", "11Б")
  const classRegex = /^[1-9][0-9]?[А-Яа-яA-Za-z]?$/
  return classRegex.test(cleaned)
}

export function validatePosition(position) {
  if (!position) return false
  
  // Remove extra spaces
  const cleaned = position.trim()
  
  // Check length (2-50 characters)
  if (cleaned.length < 2 || cleaned.length > 50) {
    return false
  }
  
  // Check that it contains at least one letter
  const hasLetter = /[А-Яа-яA-Za-z]/.test(cleaned)
  return hasLetter
}

export function formatPhone(phone) {
  if (!phone) return phone
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11 && cleaned.startsWith('8')) {
    // Convert 8 to +7
    return '+7' + cleaned.substring(1)
  } else if (cleaned.length === 10) {
    // Add +7 for 10-digit numbers
    return '+7' + cleaned
  } else {
    // Return as is with +
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned
    }
    return cleaned
  }
}
