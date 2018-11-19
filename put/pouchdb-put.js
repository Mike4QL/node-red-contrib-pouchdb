module.exports = function (RED) {
    function PouchDbPutNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.server = RED.nodes.getNode(config.server);

        node.status({fill: "red", shape: "ring", text: "not connected"});
        node.server.on("ready", function(info) {
            node.status({fill: "green", shape: "dot", text: info.db_name});
        });

        node.on('input', function (msg) {
            var msgOut = {};
            var pPut;
            var docs = [];
            if (Array.isArray(msg.payload)) {
                docs = msg.payload;
            } else {
                docs.push(msg.payload);
            }
            if (msg.options) {
                pPut = node.server.db.bulkDocs(docs, msg.options);
            } else {
                pPut = node.server.db.bulkDocs(docs)
            }
            pPut.then(function (result) {
                msgOut.payload = result;
                node.send(msgOut);
            }).catch(function (err) {
                msgOut.err = err;
                node.send(msgOut);
            })
        });
    }
    RED.nodes.registerType("pouchdb-put", PouchDbPutNode);
}
