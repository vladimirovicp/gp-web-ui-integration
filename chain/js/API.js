define(["freeipa/ipa", "freeipa/rpc"], function(IPA, rpc) {
  function createRpcError(message, details) {
    var error = new Error(message);
    if (details) {
      error.details = details;
    }
    return error;
  }

  function ensureDependencies() {
    if (!rpc || typeof rpc.command !== "function") {
      throw createRpcError("Global rpc is not available.");
    }
    if (!IPA) {
      throw createRpcError("Global IPA is not available.");
    }
  }

  function executeGpoCommand(method, args) {
    return new Promise(function(resolve, reject) {
      try {
        ensureDependencies();
      } catch (error) {
        reject(error);
        return;
      }

      rpc.command({
        entity: "gpo",
        method: method,
        args: Array.isArray(args) ? args : [],
        options: {
          version: IPA.api_version
        },
        on_success: function(data) {
          resolve({
            result: data && data.result ? data.result.result : null,
            raw: data
          });
        },
        on_error: function(xhr, text_status, error_thrown) {
          reject(createRpcError("GPO RPC command failed: " + method, {
            xhr: xhr,
            text_status: text_status,
            error_thrown: error_thrown
          }));
        }
      }).execute();
    });
  }

  async function getPolicy(path) {
    var response = await executeGpoCommand("get_policy", [path || "/"]);
    return response.result || {};
  }

  async function getCurrentValue(nameGpt, target, path) {
    var response = await executeGpoCommand("get_current_value", [nameGpt, target, path]);
    return response.result;
  }

  async function setPolicy(nameGpt, target, path, jsonData, metadata) {
    var response = await executeGpoCommand("set_policy", [nameGpt, target, path, jsonData, metadata]);
    return response.result;
  }

  async function loadMainPolicy(path) {
    return getPolicy(path || "/");
  }

  return {
    getPolicy: getPolicy,
    getCurrentValue: getCurrentValue,
    setPolicy: setPolicy,
    loadMainPolicy: loadMainPolicy
  };
});
