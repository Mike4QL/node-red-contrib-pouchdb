module.exports = function (RED) {
    var PouchDb = require('pouchdb');
    PouchDb.plugin(require('pouchdb-find'));
    var Path = require('path');

    function PouchDBServerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // Open the database
        if (config.injectDb) {
            // If a database object is given (e.g. for unit testing) use it
            node.db = config.injectDb;
        } else {
            if (config.dbUrl) {
                // If a URL has been supplied connect to that database
                var dbUrl = config.dbUrl;
                if (!dbUrl.endsWith('/')) {
                    dbUrl += '/';
                }
                dbUrl += config.database;

                var dbOptions = {};
                if (config.dbUser) {
                    dbOptions.auth = { username: config.dbUser, password: config.dbPwd };
                }
                node.db = new PouchDb(dbUrl, dbOptions);
            } else {
                // Otherwise use a local database
                node.db = new PouchDb(config.database);
            }
        }

        // Get the database info and save it in the global context
        node.db.info().then(function(info) {
            RED.log.info("Connected to database, " + info.db_name);
            node.context().global.set('dbinfo', info);
            node.emit("ready", info);
        });

        // Start Syncing if the Sync database is specified.
        if (config.dbSync) {
            var syncDbOptions = { auth: { username: config.dbSyncUser, password: config.dbSyncPwd } };

            node.syncDb = new PouchDb(config.dbSync, syncDbOptions);

            // Start the sync
            node.syncObj = node.db.sync(node.syncDb, {live: true, retry: true})
                .on('change', function(info){
                    // Pass on sync changes
                    node.emit('sync-change', info);
                })
                .on('error', function(err) {
                    console.log(err);
                });

        }

    }

    RED.nodes.registerType("pouchdb-server", PouchDBServerNode);
}