const db = require('../models');
const FileDBApi = require('./file');
const BranchesDBApi = require('./branches');
const crypto = require('crypto');
const Utils = require('../utils');
const { Client } = require('@googlemaps/google-maps-services-js');
const { log } = require('console');
const { getUserAndRole } = require('../../utils/getUserRole');
const { v4: uuid } = require('uuid');
const config = require('../../config');
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class DistancematrixDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;
    const distancematrix = await db.distancematrix.create(
      {
        id: data.id || undefined,

        address1: data.address1 || null,
        address2: data.address2 || null,
        distance: data.distance || null,
        duration: data.duration || null,
        duration_early: data.duration_early || null,
        duration_late: data.duration_late || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await distancematrix.setAddy1(data.addy1 || null, {
      transaction,
    });

    await distancematrix.setAddy2(data.addy2 || null, {
      transaction,
    });

    await distancematrix.setUser1(data.user1 || null, {
      transaction,
    });

    await distancematrix.setUser2(data.user2 || null, {
      transaction,
    });

    return distancematrix;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const distancematrix = await db.distancematrix.findByPk(id, {
      transaction,
    });

    await distancematrix.update(
      {
        address1: data.address1 || null,
        address2: data.address2 || null,
        distance: data.distance || null,
        duration: data.duration || null,
        duration_early: data.duration_early || null,
        duration_late: data.duration_late || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await distancematrix.setAddy1(data.addy1 || null, {
      transaction,
    });

    await distancematrix.setAddy2(data.addy2 || null, {
      transaction,
    });

    await distancematrix.setUser1(data.user1 || null, {
      transaction,
    });

    await distancematrix.setUser2(data.user2 || null, {
      transaction,
    });

    return distancematrix;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const distancematrix = await db.distancematrix.findByPk(id, options);

    await distancematrix.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await distancematrix.destroy({
      transaction,
    });

    return distancematrix;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const distancematrix = await db.distancematrix.findOne(
      { where },
      { transaction },
    );

    if (!distancematrix) {
      return distancematrix;
    }

    const output = distancematrix.get({ plain: true });

    output.addy1 = await distancematrix.getAddy1({
      transaction,
    });

    output.addy2 = await distancematrix.getAddy2({
      transaction,
    });

    output.user1 = await distancematrix.getUser1({
      transaction,
    });

    output.user2 = await distancematrix.getUser2({
      transaction,
    });

    return output;
  }

  static async calculator(filter, options) {
    //const query = `SELECT * FROM distancematrix WHERE (user1Id = '${filter.user1Id}' AND user2Id = '${filter.user2Id}') OR (user1Id = '${filter.user1Id}' AND user2Id = '${filter.user2Id}')`;
    const query = `SELECT * FROM distancematrix WHERE address1 = '${filter.address1}' AND address2 = '${filter.address2}'`;
    const timeconstraints = await db.sequelize.query(query, {
      type: db.sequelize.QueryTypes.SELECT,
      raw: true,
    });

    function getNearestMonday1130AM() {
      const now = new Date();
      const dayOfWeek = now.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
      const diff = (7 - dayOfWeek + 1) % 7; // days until next Monday

      const nextMonday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + diff,
        11,
        30,
        0,
      );

      // If today is Monday but past 11:30 AM, add 7 days to get next Monday
      if (dayOfWeek === 1 && now.getHours() >= 11 && now.getMinutes() > 30) {
        nextMonday.setDate(nextMonday.getDate() + 7);
      }

      return nextMonday;
    }

    const find_distancematrix = async (origin, destination) => {
    const client = new Client({});

    if (!config.googleDistanceMatrixApiKey) {
      console.error('Google Distance Matrix API key is not configured.');
      return null;
    }

    if (!origin || !destination) {
      console.error('Origin and destination are required.');
      return null;
    }

    try {
      const departureTime = getNearestMonday1130AM();

      const response = await client.distancematrix({
        params: {
          origins: [origin],
          destinations: [destination],
          departure_time: departureTime,
          key: config.googleDistanceMatrixApiKey,
        },
        timeout: 1000,
      });

      const element = response?.data?.rows?.[0]?.elements?.[0];

      if (!element?.distance?.value || !element?.duration?.value) {
        console.warn('Missing distance or duration in Distance Matrix response.');
        return null;
      }

      return {
        distance: element.distance.value,
        duration: element.duration.value,
      };
    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      return null;
    }
  };

    if (
      (filter.address1 && filter.address2) !== '' &&
      (filter.address1 && filter.address2) !== null &&
      timeconstraints.length === 0
    ) {
      const newDriveData = await find_distancematrix(
        filter.address1,
        filter.address2,
      );
      if (!newDriveData)
        throw new Error('Calculation Failed due to Inproper Data!');

      const DbId = uuid();
      const Db2Id = uuid();
      const insertQuery = `INSERT INTO distancematrix (id,createdById,updatedById,address1,address2,distance,duration,duration_early,duration_late) VALUES ('${DbId}','${filter.currentUserId}','${filter.currentUserId}','${filter.address1}','${filter.address2}',${newDriveData.distance},${newDriveData.duration},${newDriveData.duration},${newDriveData.duration})`;

      await db.sequelize.query(insertQuery, {
        type: db.sequelize.QueryTypes.INSERT,
        raw: true,
      });

      const insertQueryReverse = `INSERT INTO distancematrix (id,createdById,updatedById,address1,address2,distance,duration,duration_early,duration_late) VALUES ('${Db2Id}','${filter.currentUserId}','${filter.currentUserId}','${filter.address2}','${filter.address1}',${newDriveData.distance},${newDriveData.duration},${newDriveData.duration},${newDriveData.duration})`;
      await db.sequelize.query(insertQueryReverse, {
        type: db.sequelize.QueryTypes.INSERT,
        raw: true,
      });

      return {
        distance: newDriveData.distance,
        duration: newDriveData.duration,
      };
    }

    const distance = timeconstraints?.[0]?.distance ?? '';
    const duration = timeconstraints?.[0]?.duration ?? '';
    return {
      distance,
      duration,
    };
  }

  static async findAll(filter, options) {
    if (filter.branches) {
      filter.branches = await BranchesDBApi.getBranchStructures({
        companyId: filter.companyId,
        branchIds: filter.branches,
      });
    }
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page - 1;

    offset = currentPage * limit;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        attributes: [],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }
      if (filter.companyId) {
        where = {
          ...where,
          ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
        };
      }

      if (filter.address1) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('distancematrix', 'address1', filter.address1),
        };
      }

      if (filter.address2) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('distancematrix', 'address2', filter.address2),
        };
      }

      if (filter.distanceRange) {
        const [start, end] = filter.distanceRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            distance: {
              ...where.distance,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            distance: {
              ...where.distance,
              [Op.lte]: end,
            },
          };
        }
      }

      if (filter.durationRange) {
        const [start, end] = filter.durationRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            duration: {
              ...where.duration,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            duration: {
              ...where.duration,
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

      if (filter.addy1) {
        var listItems = filter.addy1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          addy1Id: { [Op.or]: listItems },
        };
      }

      if (filter.addy2) {
        var listItems = filter.addy2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          addy2Id: { [Op.or]: listItems },
        };
      }

      if (filter.user1) {
        var listItems = filter.user1.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          user1Id: { [Op.or]: listItems },
        };
      }

      if (filter.user2) {
        var listItems = filter.user2.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          user2Id: { [Op.or]: listItems },
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

    let { rows, count } = await db.distancematrix.findAndCountAll({
      where,
      include,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      order:
        filter.field && filter.sort
          ? [[filter.field, filter.sort]]
          : [['createdAt', 'desc']],
      transaction,
      benchmark: true,
      logging: console.log,
    });

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit, filter) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('distancematrix', 'addy1', query),
        ],
      };
    }

    const records = await db.distancematrix.findAll({
      attributes: ['id', 'addy1'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['addy1', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.addy1,
    }));
  }

  static async findAllDistanceMatrixOfCompany(filter) {
    const records = await db.distancematrix.findAll({
      attributes: ['address1', 'address2', 'distance', 'duration'],
      where: {
        ['$createdBy.companyId$']: Utils.uuid(filter.companyId),
      },
      include: {
        attributes: [],
        model: db.users,
        as: 'createdBy',
        paranoid: false,
      },
    });
    return JSON.parse(JSON.stringify(records));
  }

  static async findAllDistanceMatrixBunchOfAddresses(filter) {
    const records = await db.distancematrix.findAll({
      attributes: ['address1', 'address2', 'distance', 'duration'],
      where: {
        address1: { [Op.or]: filter.addresses },
        address2: { [Op.or]: filter.addresses },
      },
    });
    return JSON.parse(JSON.stringify(records));
  }
};
