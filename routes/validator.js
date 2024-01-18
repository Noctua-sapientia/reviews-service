function validateOrderField(orderField) {
    const allowedOrderFields = ['asc', 'desc'];
    if (orderField && !allowedOrderFields.includes(orderField)) {
      return false;
    }
    return true;
}

function validateSortField(sortField) {
    const allowedSortFields = ['rating', 'date'];
    if (sortField && !allowedSortFields.includes(sortField)) {
        return false;
    } 
    return true;
}

function validateLimit(limit) {
    return (limit === undefined) || (!isNaN(limit) && limit > 0);
}

function validateSkip(skip) {
  return (skip === undefined) || (!isNaN(skip) && skip >= 0);
}

function validateRating(rating) {
    const number = parseInt(rating, 10);
    if (!isNaN(number) && number >= 1 && number <= 5) {
      return true;
    } else {
      return false;
    }
}
  
module.exports = {
    validateOrderField,
    validateSortField,
    validateLimit,
    validateSkip,
    validateRating
};
  