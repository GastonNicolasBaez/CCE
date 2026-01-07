'use strict';

/**
 * Migration: Create Tenants Table
 *
 * Creates the core tenants table for multi-tenant architecture.
 * Each tenant represents a club/organization using the platform.
 *
 * Run: npm run db:migrate
 * Rollback: npm run db:migrate:undo
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tenants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique identifier for subdomain (e.g., espora, river)'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Full name of the club'
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended', 'trial', 'cancelled'),
        allowNull: false,
        defaultValue: 'trial',
        comment: 'Tenant status'
      },
      plan: {
        type: Sequelize.ENUM('free', 'pro', 'enterprise'),
        allowNull: false,
        defaultValue: 'free',
        comment: 'Subscription plan'
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Custom settings (logo, colors, etc)'
      },
      max_members: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
        comment: 'Maximum members allowed based on plan'
      },
      admin_email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'Email of the tenant administrator'
      },
      admin_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Name of the tenant administrator'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Contact phone number'
      },
      trial_ends_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Trial expiration date'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional metadata'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('tenants', ['slug'], {
      unique: true,
      name: 'tenants_slug_unique'
    });

    await queryInterface.addIndex('tenants', ['status'], {
      name: 'tenants_status_idx'
    });

    await queryInterface.addIndex('tenants', ['plan'], {
      name: 'tenants_plan_idx'
    });

    await queryInterface.addIndex('tenants', ['admin_email'], {
      name: 'tenants_admin_email_idx'
    });

    console.log('✅ Tenants table created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tenants');
    console.log('✅ Tenants table dropped');
  }
};
