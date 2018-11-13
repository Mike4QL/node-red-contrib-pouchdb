module.exports = function (RED) {
    var _ = require('lodash');
    
    function PouchDbChangesNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.server = RED.nodes.getNode(config.server);

        node.server.on('sync-change', function (info) {
            // Only interested in 'pull' changes
            if (info.direction === 'pull') {
                // Return only non-delete docs
                var msgOut = info.change.docs.map(function (item) {
                    return (item._deleted) ? null : { payload: _.omit(item, '_revisions') };
                })
                node.send(msgOut);
            }
        });
    }
    RED.nodes.registerType("pouchdb-changes", PouchDbChangesNode);
}
