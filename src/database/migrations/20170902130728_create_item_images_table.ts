import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_images', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('hash').notNullable();

            table.integer('item_information_id').unsigned().nullable();
            table.foreign('item_information_id').references('id')
                .inTable('item_informations').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('item_images')
    ]);
};
