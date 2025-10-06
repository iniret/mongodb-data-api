/**
 * Simple utility to convert ISO date strings and MongoDB extended JSON to proper formats
 */
const convertDateStrings = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertDateStrings);
  }
  
  // Handle MongoDB extended JSON formats
  if (obj.$date) {
    const date = new Date(obj.$date);
    return !isNaN(date.getTime()) ? date : obj;
  }
  
  if (obj.$oid) {
    const mongoose = require('mongoose');
    return new mongoose.Types.ObjectId(obj.$oid);
  }
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      const date = new Date(value);
      result[key] = !isNaN(date.getTime()) ? date : value;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertDateStrings(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

module.exports = { convertDateStrings };