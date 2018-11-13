module.exports = function (RED) {
    function PouchDbGetNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.server = RED.nodes.getNode(config.server);

        node.on('input', function (msg) {
            var msgOut = {};
            if (msg.payload === "" && typeof(msg.options) === 'object'){
                // Empty payload with options uses allDocs to return an array of docs
                node.server.db.allDocs(msg.options).then(function(docs){
                    msgOut.payload = docs.rows.map(function(v,i,a){
                        return v.doc;
                    });
                    node.send(msgOut);
                }).catch(function(err){
                    msgOut.err = err;
                    node.send(msgOut);
                });
            } else if (typeof (msg.payload) === 'string') {
                // single document from id
                node.server.db.get(msg.payload).then(function (doc) {
                    msgOut.payload = doc;
                    node.send(msgOut);
                }).catch(function (err) {
                    msgOut.err = err;
                    node.send(msgOut);
                });
            } else if (typeof(msg.payload) === 'object' && msg.payload.selector) {
                // Use Mango Query
                node.server.db.find(msg.payload).then(function(result){
                    msgOut.payload = result.docs;
                    node.send(msgOut);
                }).catch(function(err){
                    msgOut.err = err;
                    node.send(msgOut);
                });
            } else {
                // Invalid call
                msgOut.err = { message: "Bad Request", error: true, status: 400, payload: msg.payload };
                node.send(msgOut);
            }
        });
    }
    RED.nodes.registerType("pouchdb-get", PouchDbGetNode);
}