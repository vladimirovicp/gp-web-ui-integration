define(["freeipa/ipa", "freeipa/rpc"], function(IPA, rpc) {
  function unwrapSingleValue(value) {
    if (Array.isArray(value)) {
      return value.length > 0 ? unwrapSingleValue(value[0]) : null;
    }
    return value;
  }

  function normalizeStringArg(value, fallback) {
    var normalized = unwrapSingleValue(value);
    if (normalized === null || normalized === void 0 || normalized === "") {
      return fallback;
    }
    return String(normalized);
  }

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
    var response = await executeGpoCommand("get_policy", [normalizeStringArg(path, "/")]);
    return response.result || {};
  }

  async function getCurrentValue(nameGpt, target, path) {
    var response = await executeGpoCommand("get_current_value", [
      normalizeStringArg(nameGpt, ""),
      normalizeStringArg(target, ""),
      normalizeStringArg(path, "/")
    ]);
    return response.result;
  }

  async function setPolicy(nameGpt, target, path, jsonData, metadata) {
    var response = await executeGpoCommand("set_policy", [
      normalizeStringArg(nameGpt, ""),
      normalizeStringArg(target, ""),
      normalizeStringArg(path, "/"),
      normalizeStringArg(jsonData, ""),
      normalizeStringArg(metadata, "")
    ]);
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
