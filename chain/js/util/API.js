define(["freeipa/ipa", "freeipa/rpc"], function(IPA, rpc) {

    function getPolicy(path) {
        return new Promise(function(resolve, reject) {
            rpc.command({
                entity: 'gpo',
                method: 'get_policy',
                args: [path || '/'],
                options: {
                    version: IPA.api_version
                },
                on_success: function(data) {
                    var result = (data.result && data.result.result) || {};
                    resolve(result);
                },
                on_error: function(xhr, text_status, error_thrown) {
                    reject(error_thrown || new Error('Failed to get policy'));
                }
            }).execute();
        });
    }

    return { getPolicy: getPolicy };
});