require ('custom-env').env(process.env.NODE_ENV)

module.exports = {
    "skip": true,
    "name": "oracle",
    "type": "oracle",
    "host": process.env.DATABASE_HOST,
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "port": process.env.DATABASE_PORT,
    "sid": "xe.oracle.docker",
    "logging": false,
    "entities": [
        process.env.DATABASE_ENTITIES
    ],
    "migrations": [
        process.env.DATABASE_MIGRATIONS
    ],
    "cli": {
        "entitiesDir": process.env.DATABASE_ENTITIES_DIR,
        "migrationsDir": process.env.DATABASE_MIGRATIONS_DIR
    },
    // "ssl": true,
}