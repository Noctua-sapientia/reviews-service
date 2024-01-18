function validateOrderField(orderField) {
    const allowedOrderFields = ['asc', 'desc'];
    if (orderField && !allowedOrderFields.includes(orderField)) {
      throw new Error("Invalid order field. It must be 'asc' or 'desc'.");
    }
    return orderField || 'desc';
}

function validateSortField(sortField) {
    const allowedSortFields = ['rating', 'date'];
    if (!sortField) {
        return null;
    } else if (!allowedSortFields.includes(sortField)) {
        throw new Error("Invalid sort field. It must be 'rating' or 'date'.");
    }

    return sortField === 'date' ? 'createdAt' : 'rating';
}

function validateLimit(value, fieldName) {
    if (value !== undefined) {
      const number = parseInt(value, 10);
      if (!isNaN(number) && number > 0) {
        return number;
      } else {
        throw new Error("Limit must be a number greater than 0.");
      }
    }
    return null;
}

function validateSkip(value) {
  if (value !== undefined) {
    const number = parseInt(value, 10);
    if (!isNaN(number) && number >= 0) {
      return number;
    } else {
      throw new Error("Skip must be a non-negative number.");
    }
  }
  return 0;
}

function validateRating(rating) {
  if (rating !== undefined) {
    const number = parseInt(rating, 10);
    if (!isNaN(number) && number >= 1 && number <= 5) {
      return number;
    } else {
      throw new Error("Rating must be a number between 1 and 5.");
    }
  }
  return null;
}
  
module.exports = {
    validateOrderField,
    validateSortField,
    validateLimit,
    validateSkip,
    validateRating
};
  