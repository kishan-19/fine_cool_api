const getPaymentStatus = (paidAmount, totalAmount) => {

  paidAmount = Number(paidAmount || 0);
  totalAmount = Number(totalAmount || 0);

  if (paidAmount <= 0) {
    return "Pending";
  }

  if (paidAmount >= totalAmount) {
    return "Paid";
  }

  if (paidAmount < totalAmount) {
    return "Partially Paid";
  }

};

module.exports = {
  getPaymentStatus
};