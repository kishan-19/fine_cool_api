const moment = require("moment");

class DateUtil {
  /*
  |--------------------------------------------------------------------------
  | DEFAULT FORMAT
  |--------------------------------------------------------------------------
  */
  static DEFAULT_FORMAT = "DD-MM-YYYY";

  /*
  |--------------------------------------------------------------------------
  | PARSE DATE → TIMESTAMP (FOR DB STORE)
  |--------------------------------------------------------------------------
  */
  static parseDate(date) {
    if (!date) return null;
    const parsed = Date.parse(date);
    return isNaN(parsed) ? null : parsed;
  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE → HUMAN READABLE
  |--------------------------------------------------------------------------
  */
  static formatDate(date, format = DateUtil.DEFAULT_FORMAT) {
    if (!date) return null;
    const m = moment(date);
    if (!m.isValid()) return null;
    return m.format(format);
  }

  /*
  |--------------------------------------------------------------------------
  | SMART DATE (STORE + SHOW TOGETHER)
  |--------------------------------------------------------------------------
  */
  static smartDate(date) {
    if (!date) return null;

    const parsed = Date.parse(date);

    if (!isNaN(parsed)) {
      return {
        store: parsed,
        show: moment(parsed).format(DateUtil.DEFAULT_FORMAT),
      };
    }

    return {
      store: null,
      show: null,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CURRENT DATE
  |--------------------------------------------------------------------------
  */
  static now(format = DateUtil.DEFAULT_FORMAT) {
    return moment().format(format);
  }
}

module.exports = DateUtil;
