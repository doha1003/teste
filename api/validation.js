// Input validation utilities for fortune API

// Sanitize string input to prevent prompt injection
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove potential prompt injection patterns
    return input
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/[\n\r]/g, ' ') // Replace newlines with spaces
        .replace(/\\/g, '') // Remove backslashes
        .replace(/[{}]/g, '') // Remove braces
        .substring(0, 100); // Limit length
}

// Validate date format and range
export function validateDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date format' };
    }
    
    // Check year range (manseryeok database range)
    if (year < 1841 || year > 2110) {
        return { valid: false, error: 'Date must be between 1841 and 2110' };
    }
    
    return { valid: true, date };
}

// Validate zodiac sign
export function validateZodiac(zodiac) {
    const validZodiacs = [
        'aries', 'taurus', 'gemini', 'cancer', 
        'leo', 'virgo', 'libra', 'scorpio',
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    
    return validZodiacs.includes(zodiac);
}

// Validate animal zodiac
export function validateAnimalZodiac(animal) {
    const validAnimals = [
        'rat', 'ox', 'tiger', 'rabbit', 
        'dragon', 'snake', 'horse', 'goat',
        'monkey', 'rooster', 'dog', 'pig'
    ];
    
    return validAnimals.includes(animal);
}

// Validate gender
export function validateGender(gender) {
    return ['male', 'female'].includes(gender);
}

// Validate hour (for saju)
export function validateHour(hour) {
    const hourNum = parseInt(hour);
    return !isNaN(hourNum) && hourNum >= 0 && hourNum <= 23;
}

// Validate request based on type
export function validateFortuneRequest(type, data) {
    const errors = [];
    
    switch(type) {
        case 'daily':
            if (!data.name || data.name.trim() === '') {
                errors.push('Name is required');
            }
            if (!data.birthDate) {
                errors.push('Birth date is required');
            } else {
                const dateValidation = validateDate(data.birthDate);
                if (!dateValidation.valid) {
                    errors.push(dateValidation.error);
                }
            }
            if (!data.gender || !validateGender(data.gender)) {
                errors.push('Valid gender is required (male/female)');
            }
            break;
            
        case 'zodiac':
            if (!data.zodiac || !validateZodiac(data.zodiac)) {
                errors.push('Valid zodiac sign is required');
            }
            break;
            
        case 'zodiac-animal':
            if (!data.animal || !validateAnimalZodiac(data.animal)) {
                errors.push('Valid animal zodiac is required');
            }
            break;
            
        case 'saju':
            if (!data.yearPillar || !data.monthPillar || !data.dayPillar || !data.hourPillar) {
                errors.push('All four pillars are required');
            }
            break;
            
        case 'general':
        case 'tarot':
            if (!data.prompt && !data.cardNumber) {
                errors.push('Prompt or card selection is required');
            }
            break;
            
        default:
            errors.push('Invalid fortune type');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Rate limiting helper
const requestCounts = new Map();

export function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 30; // 30 requests per minute
    
    // Clean old entries
    for (const [key, data] of requestCounts.entries()) {
        if (now - data.firstRequest > windowMs) {
            requestCounts.delete(key);
        }
    }
    
    const userRequests = requestCounts.get(ip);
    
    if (!userRequests) {
        requestCounts.set(ip, {
            count: 1,
            firstRequest: now
        });
        return { allowed: true };
    }
    
    if (userRequests.count >= maxRequests) {
        return { 
            allowed: false, 
            retryAfter: Math.ceil((userRequests.firstRequest + windowMs - now) / 1000)
        };
    }
    
    userRequests.count++;
    return { allowed: true };
}