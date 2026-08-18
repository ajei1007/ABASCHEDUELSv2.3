const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');
const { sum } = require('lodash');
const TotaltypesDBApi = require('./totaltypes');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const moment = require('moment');

module.exports = class Data1DBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const data1 = await db.data1.create(
      {
        id: data.id || undefined,

        s1: data.s1 || false,

        s2: data.s2 || false,

        s3: data.s3 || false,

        s4: data.s4 || false,

        s5: data.s5 || false,

        s6: data.s6 || false,

        s7: data.s7 || false,

        s8: data.s8 || false,

        s9: data.s9 || false,

        s11: data.s11 || false,

        s12: data.s12 || false,

        s13: data.s13 || false,

        s14: data.s14 || false,

        s15: data.s15 || false,

        s16: data.s16 || false,

        s17: data.s17 || false,

        s18: data.s18 || false,

        s19: data.s19 || false,

        s20: data.s20 || false,

        s21: data.s21 || false,

        s22: data.s22 || false,

        s23: data.s23 || false,

        s24: data.s24 || false,

        s25: data.s25 || false,

        s26: data.s26 || false,

        s27: data.s27 || false,

        s28: data.s28 || false,

        s29: data.s29 || false,

        s30: data.s30 || false,

        s31: data.s31 || false,

        s32: data.s32 || false,

        s33: data.s33 || false,

        s34: data.s34 || false,

        s35: data.s35 || false,

        s36: data.s36 || false,

        s37: data.s37 || false,

        s38: data.s38 || false,

        s39: data.s39 || false,

        s40: data.s40 || false,

        s41: data.s41 || false,

        s42: data.s42 || false,

        s43: data.s43 || false,

        s44: data.s44 || false,

        s45: data.s45 || false,

        s46: data.s46 || false,

        s47: data.s47 || false,

        s48: data.s48 || false,

        s10: data.s10 || false,

        slots: data.slots || null,
        date: data.date || null,
        total: data.total || null,
        eff: data.eff || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await data1.setPerson(data.person || null, {
      transaction,
    });

    await data1.setActivity(data.activity || null, {
      transaction,
    });

    await data1.setLocation(data.location || null, {
      transaction,
    });

    return data1;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const data1 = await db.data1.findByPk(id, {
      transaction,
    });

    await data1.update(
      {
        s1: data.s1 || false,

        s2: data.s2 || false,

        s3: data.s3 || false,

        s4: data.s4 || false,

        s5: data.s5 || false,

        s6: data.s6 || false,

        s7: data.s7 || false,

        s8: data.s8 || false,

        s9: data.s9 || false,

        s11: data.s11 || false,

        s12: data.s12 || false,

        s13: data.s13 || false,

        s14: data.s14 || false,

        s15: data.s15 || false,

        s16: data.s16 || false,

        s17: data.s17 || false,

        s18: data.s18 || false,

        s19: data.s19 || false,

        s20: data.s20 || false,

        s21: data.s21 || false,

        s22: data.s22 || false,

        s23: data.s23 || false,

        s24: data.s24 || false,

        s25: data.s25 || false,

        s26: data.s26 || false,

        s27: data.s27 || false,

        s28: data.s28 || false,

        s29: data.s29 || false,

        s30: data.s30 || false,

        s31: data.s31 || false,

        s32: data.s32 || false,

        s33: data.s33 || false,

        s34: data.s34 || false,

        s35: data.s35 || false,

        s36: data.s36 || false,

        s37: data.s37 || false,

        s38: data.s38 || false,

        s39: data.s39 || false,

        s40: data.s40 || false,

        s41: data.s41 || false,

        s42: data.s42 || false,

        s43: data.s43 || false,

        s44: data.s44 || false,

        s45: data.s45 || false,

        s46: data.s46 || false,

        s47: data.s47 || false,

        s48: data.s48 || false,

        s10: data.s10 || false,

        slots: data.slots || null,
        date: data.date || null,
        total: data.total || null,
        eff: data.eff || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await data1.setPerson(data.person || null, {
      transaction,
    });

    await data1.setActivity(data.activity || null, {
      transaction,
    });

    await data1.setLocation(data.location || null, {
      transaction,
    });

    return data1;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const data1 = await db.data1.findByPk(id, options);

    // await data1.update({
    //   deletedBy: currentUser.id
    // }, {
    //   transaction,
    // });

    await data1.destroy({
      transaction,
      force: true,
    });

    return data1;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const data1 = await db.data1.findOne(
      {
        where,
      },
      { transaction },
    );

    if (!data1) {
      return data1;
    }

    const output = data1.get({ plain: true });

    // output.person = await data1.getPerson({
    //   transaction
    // });

    // output.activity = await data1.getActivity({
    //   transaction
    // });

    // output.location = await data1.getLocation({
    //   transaction
    // });

    return output;
  }

  static async findAll2(filter, options) {
    const transaction = (options && options.transaction) || undefined;
    const opt = {
      benchmark: true,
      type: db.sequelize.QueryTypes.SELECT,
    };
    let query = `SELECT date,personId,activityId, SUM(total), SUM(s1),SUM(s2),SUM(s3),SUM(s4),SUM(s5),SUM(s6),SUM(s7),SUM(s8),SUM(s9),SUM(s10),SUM(s11),SUM(s12),SUM(s13),SUM(s14),SUM(s15),SUM(s16),SUM(s17),SUM(s18),SUM(s19),SUM(s20),SUM(s21),SUM(s22),SUM(s23),SUM(s24),SUM(s25),SUM(s26),SUM(s27 ),SUM(s28),SUM(s29),SUM(s30),SUM(s31),SUM(s32),SUM(s33),SUM(s34),SUM(s35),SUM(s36),SUM(s37),SUM(s38),SUM(s39),SUM(s40),SUM(s41),SUM(s42),SUM(s43),SUM(s44),SUM(s45),SUM(s46),SUM(s47),SUM(s48) FROM data1 WHERE date = '${filter.date}'`;
    if (filter.people && filter.people.split('|')) {
      query += ` AND personId IN ("${filter.people.split('|').join('","')}")`;
    }
    query += ' GROUP BY activityId,date,personId';
    // const rows = await db.sequelize.query(query, opt);
    let where = {};
    let groups = [];
    let attributes = [];
    let sums = [];
    //  if(filter.start){
    //   where = {
    //     ...where,
    //     date: {
    //       [Op.eq]: filter.start,
    //     },
    //   };
    // }
    if (filter.start && filter.end) {
      if (moment(filter.end).diff(moment(filter.start), 'days') <= 1) {
        where = {
          ...where,
          date: {
            [Op.eq]: filter.start,
          },
        };
      } else {
        where = {
          ...where,
          date: {
            [Op.gte]: filter.start,
            [Op.lt]: filter.end,
          },
        };
      }
    }
    if (filter.total) {
      sums.push([
        db.sequelize.fn('sum', db.sequelize.col(`total`)),
        `SUM(total)`,
      ]);
    }
    if (filter.date2) {
      attributes.push('date');
      groups.push('date');
    }
    //  else if(filter.date3){
    //   attributes.push('date')
    //  // groups.push('date')
    //  }
    if (filter.personId) {
      attributes.push('personId');
      groups.push('personId');
    }
    if (filter.activityId) {
      attributes.push('activityId');
      groups.push('activityId');
    } else if (filter.totalType && filter.totalType != 'total') {
      const t = await TotaltypesDBApi.findBy({ id: filter.totalType });
      if (t.activities) {
        var listItems = t.activities.map((item) => {
          return Utils.uuid(item.id);
        });
        where = {
          ...where,
          activityId: { [Op.or]: listItems },
        };
      }
    }
    if (filter.locationId) {
      attributes.push('locationId');
      groups.push('locationId');
    }
    if (filter.people) {
      var listItems = filter.people.split('|').map((item) => {
        return Utils.uuid(item);
      });

      where = {
        ...where,
        personId: { [Op.or]: listItems },
      };
    }
    if (filter.capacity) {
      for (let index = 1; index <= 48; index++) {
        sums.push([
          db.sequelize.fn('sum', db.sequelize.col(`s${index}`)),
          `SUM(s${index})`,
        ]);
      }
    }
    attributes = attributes.concat(sums);
    let rows = await db.data1.findAll({
      where,
      // include,
      attributes: attributes,
      group: groups,
      //limit: limit ? Number(limit) : undefined,
      //offset: offset ? Number(offset) : undefined,
      // order: (filter.field && filter.sort)
      //   ? [[filter.field, filter.sort]]
      //   : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      raw: true,
    });
    return { rows };
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      // {
      //   model: db.users,
      //   as: 'person',
      // },
      // {
      //   model: db.users,
      //   as: 'activity',
      // },
      // {
      //   model: db.users,
      //   as: 'location',
      // },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.date) {
        where = {
          ...where,
          date: {
            [Op.eq]: filter.date,
          },
        };
      }

      if (filter.slots) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('data1', 'slots', filter.slots),
        };
      }

      if (filter.dateRange) {
        const [start, end] = filter.dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.totalRange) {
        const [start, end] = filter.totalRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            total: {
              ...where.total,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            total: {
              ...where.total,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.effRange) {
        const [start, end] = filter.effRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            eff: {
              ...where.eff,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            eff: {
              ...where.eff,
              [Op.lte]: end,
            },
          };
        }
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.s1) {
        where = {
          ...where,
          s1: filter.s1,
        };
      }

      if (filter.s2) {
        where = {
          ...where,
          s2: filter.s2,
        };
      }

      if (filter.s3) {
        where = {
          ...where,
          s3: filter.s3,
        };
      }

      if (filter.s4) {
        where = {
          ...where,
          s4: filter.s4,
        };
      }

      if (filter.s5) {
        where = {
          ...where,
          s5: filter.s5,
        };
      }

      if (filter.s6) {
        where = {
          ...where,
          s6: filter.s6,
        };
      }

      if (filter.s7) {
        where = {
          ...where,
          s7: filter.s7,
        };
      }

      if (filter.s8) {
        where = {
          ...where,
          s8: filter.s8,
        };
      }

      if (filter.s9) {
        where = {
          ...where,
          s9: filter.s9,
        };
      }

      if (filter.s11) {
        where = {
          ...where,
          s11: filter.s11,
        };
      }

      if (filter.s12) {
        where = {
          ...where,
          s12: filter.s12,
        };
      }

      if (filter.s13) {
        where = {
          ...where,
          s13: filter.s13,
        };
      }

      if (filter.s14) {
        where = {
          ...where,
          s14: filter.s14,
        };
      }

      if (filter.s15) {
        where = {
          ...where,
          s15: filter.s15,
        };
      }

      if (filter.s16) {
        where = {
          ...where,
          s16: filter.s16,
        };
      }

      if (filter.s17) {
        where = {
          ...where,
          s17: filter.s17,
        };
      }

      if (filter.s18) {
        where = {
          ...where,
          s18: filter.s18,
        };
      }

      if (filter.s19) {
        where = {
          ...where,
          s19: filter.s19,
        };
      }

      if (filter.s20) {
        where = {
          ...where,
          s20: filter.s20,
        };
      }

      if (filter.s21) {
        where = {
          ...where,
          s21: filter.s21,
        };
      }

      if (filter.s22) {
        where = {
          ...where,
          s22: filter.s22,
        };
      }

      if (filter.s23) {
        where = {
          ...where,
          s23: filter.s23,
        };
      }

      if (filter.s24) {
        where = {
          ...where,
          s24: filter.s24,
        };
      }

      if (filter.s25) {
        where = {
          ...where,
          s25: filter.s25,
        };
      }

      if (filter.s26) {
        where = {
          ...where,
          s26: filter.s26,
        };
      }

      if (filter.s27) {
        where = {
          ...where,
          s27: filter.s27,
        };
      }

      if (filter.s28) {
        where = {
          ...where,
          s28: filter.s28,
        };
      }

      if (filter.s29) {
        where = {
          ...where,
          s29: filter.s29,
        };
      }

      if (filter.s30) {
        where = {
          ...where,
          s30: filter.s30,
        };
      }

      if (filter.s31) {
        where = {
          ...where,
          s31: filter.s31,
        };
      }

      if (filter.s32) {
        where = {
          ...where,
          s32: filter.s32,
        };
      }

      if (filter.s33) {
        where = {
          ...where,
          s33: filter.s33,
        };
      }

      if (filter.s34) {
        where = {
          ...where,
          s34: filter.s34,
        };
      }

      if (filter.s35) {
        where = {
          ...where,
          s35: filter.s35,
        };
      }

      if (filter.s36) {
        where = {
          ...where,
          s36: filter.s36,
        };
      }

      if (filter.s37) {
        where = {
          ...where,
          s37: filter.s37,
        };
      }

      if (filter.s38) {
        where = {
          ...where,
          s38: filter.s38,
        };
      }

      if (filter.s39) {
        where = {
          ...where,
          s39: filter.s39,
        };
      }

      if (filter.s40) {
        where = {
          ...where,
          s40: filter.s40,
        };
      }

      if (filter.s41) {
        where = {
          ...where,
          s41: filter.s41,
        };
      }

      if (filter.s42) {
        where = {
          ...where,
          s42: filter.s42,
        };
      }

      if (filter.s43) {
        where = {
          ...where,
          s43: filter.s43,
        };
      }

      if (filter.s44) {
        where = {
          ...where,
          s44: filter.s44,
        };
      }

      if (filter.s45) {
        where = {
          ...where,
          s45: filter.s45,
        };
      }

      if (filter.s46) {
        where = {
          ...where,
          s46: filter.s46,
        };
      }

      if (filter.s47) {
        where = {
          ...where,
          s47: filter.s47,
        };
      }

      if (filter.s48) {
        where = {
          ...where,
          s48: filter.s48,
        };
      }

      if (filter.s10) {
        where = {
          ...where,
          s10: filter.s10,
        };
      }

      if (filter.person) {
        var listItems = filter.person.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          personId: { [Op.or]: listItems },
        };
      }

      if (filter.activity) {
        var listItems = filter.activity.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          activityId: { [Op.or]: listItems },
        };
      }

      if (filter.location) {
        var listItems = filter.location.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          locationId: { [Op.or]: listItems },
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = await db.data1.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
    });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('data1', 'id', query),
        ],
      };
    }

    const records = await db.data1.findAll({
      attributes: ['id', 'id'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['id', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.id,
    }));
  }
};
