const validator = require('validator');
const { v4: uuid } = require('uuid');
const Sequelize = require('./models').Sequelize;

module.exports = class Utils {
  static getLimitOffset(limit, page){
    // extract limit
    var lim = Number(limit) || null;
    if (lim <= 0) {
      lim = null;
    }

    //extract page number    
    let currentPage = Number(page) || null;
    if (currentPage <= 0) {
      currentPage = null;
    }
    //extract offset
    var off = null
    if (lim && currentPage){
      off = (currentPage-1)*lim
    }


    if (lim === null){
      lim = -1
    }

    if (off === null){
      off = -1
    }

    return { lim: lim, off: off };
  }


  static uuid(value) {
    let id = value;

    if (!validator.isUUID(id)) {
      id = uuid();
    }

    return id;
  }

  static ilike(model, column, value) {
    return Sequelize.where(
      Sequelize.fn(
        'lower',
        Sequelize.col(`${model}.${column}`),
      ),
      {
        [Sequelize.Op.like]: `%${value}%`.toLowerCase(),
      },
    );
  }
  static eq(model, column, value) {
    return Sequelize.where(
      Sequelize.fn('lower', Sequelize.col(`${model}.${column}`)),
      {
        [Sequelize.Op.eq]: `${value}`,
      },
    );
  }

  static ne(model, column, value) {
    return Sequelize.where(
      Sequelize.fn('lower', Sequelize.col(`${model}.${column}`)),
      {
        [Sequelize.Op.ne]: `${value}`,
      },
    );
  }

  static notIn(model, column, value) {
    return Sequelize.where(
      Sequelize.fn('lower', Sequelize.col(`${model}.${column}`)),
      {
        [Sequelize.Op.notIn]: value,
      },
    );
  }

};
