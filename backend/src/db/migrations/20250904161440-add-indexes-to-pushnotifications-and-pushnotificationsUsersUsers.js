'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
   INDEX_SPECS: [
    {
      "table": "pushnotifications",
      "name": "idx_pushnotifications_user_date",
      "columns": [
        "createdAt",
        "deletedAt",
      ],
    },
    {
      "table": "pushnotificationsUsersUsers",
      "name": "idx_pushnotifications_users",
      "columns": [
        "userId",
        "pushnotificationId",
      ],
    }
  ],

  _sameFieldList(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].toLowerCase() !== b[i].toLowerCase()) return false;
    }
    return true;
  },

  async _isIndexExists(queryInterface, table, wantedFields, { unique } = {}, options = {}) {
    const existing = await queryInterface.showIndex(table, options);

    for (const raw of existing) {
      const { fields, unique: isUnique, name } = raw;
      if (unique === undefined || unique === isUnique) {
        if (this._sameFieldList(fields.map(obj => obj.attribute), wantedFields)) {
          return true;
        }
      }
    }
    return false;
  },

  async _ensureIndex(queryInterface, spec, t) {
    const { table, name, columns, unique } = spec;
    try{
      const tableInfo = await queryInterface.describeTable(table, { transaction: t });
      for (const column of columns) {
        const hasColumn = Object.keys(tableInfo)
          .some(key => key.toLowerCase() === column.toLowerCase());
        if (!hasColumn) {
          console.warn(`Column ${column} not found in table ${table}, skipping index ${name}`);
          return
        }
      }

      // Check by columns (order-sensitive)
      const exists = await this._isIndexExists(
        queryInterface,
        table,
        columns,
        { unique },
        { transaction: t }
      );

      if (exists) {
        console.log(`Index ${name} already exists on ${table}(${columns.join(', ')})`);
        return // done
      }

      // Not indexed on these columns → create it
      console.log("Creating index", name, "on", table, "(", columns.join(", "), ")");
      await queryInterface.addIndex(
        table,
        columns,
        { name, unique: !!unique, transaction: t }
      );
      console.log(`Created index ${name} on ${table}(${columns.join(', ')})`);
    } catch (error) {
      if (error.message.includes("No description found")) {
        console.warn(`Couldn't find the table ${error}`)
        return
      }
      console.error(`Failed to create index ${name} on ${table}:`, error.message);
      throw error;
    }
  },

  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try{
      for (const spec of this.INDEX_SPECS) {
        const result = await this._ensureIndex(queryInterface, spec, t);
      }
      await t.commit();
    } catch (error) {
      console.error("Error occurred while ensuring indexes:", error);
      await t.rollback();
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      for (const spec of this.INDEX_SPECS) {
        // Check if index exists before attempting to remove
        const exists = await this._isIndexExists(
          queryInterface,
          spec.table,
          spec.columns,
          { unique: spec.unique },
          { transaction: t }
        );
        if (exists) {
          await queryInterface.removeIndex(spec.table, spec.name, { transaction: t });
          console.log(`Removed index ${spec.name} from ${spec.table}`);
        }
      }
      await t.commit();
    } catch (error) {
      console.error("Error occurred while removing indexes:", error);
      await t.rollback();
      throw error;
    }
  }
};
