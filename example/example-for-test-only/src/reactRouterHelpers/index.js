/* eslint-disable */
import React, { useRef, useState, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var RouteContext = React.createContext({
    routeResolverInfos: {},
});

var RouteHelperStatus;
(function (RouteHelperStatus) {
    RouteHelperStatus[RouteHelperStatus["Initial"] = 0] = "Initial";
    RouteHelperStatus[RouteHelperStatus["Loading"] = 1] = "Loading";
    RouteHelperStatus[RouteHelperStatus["Loaded"] = 2] = "Loaded";
    RouteHelperStatus[RouteHelperStatus["Failed"] = 3] = "Failed";
})(RouteHelperStatus || (RouteHelperStatus = {}));

function useManager(_a) {
    var guards = _a.guards, resolvers = _a.resolvers;
    function evaluateGuards() {
        return __awaiter(this, void 0, void 0, function () {
            var _i, guards_1, guard, canActivate, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, guards_1 = guards;
                        _a.label = 1;
                    case 1:
                        if (!(_i < guards_1.length)) return [3 /*break*/, 6];
                        guard = guards_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, guard()];
                    case 3:
                        canActivate = _a.sent();
                        if (!canActivate) {
                            return [2 /*return*/, RouteHelperStatus.Failed];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error('Error in guards');
                        console.error(e_1);
                        return [2 /*return*/, RouteHelperStatus.Failed];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, RouteHelperStatus.Loaded];
                }
            });
        });
    }
    function evaluateResolvers() {
        return __awaiter(this, void 0, void 0, function () {
            var status, keys, promises, resultOfResolvers, infos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        status = RouteHelperStatus.Loaded;
                        keys = Object.keys(resolvers).map(function (resolverKey) { return resolverKey; });
                        promises = Object.keys(resolvers).map(function (resolverKey) { return resolvers[resolverKey](); });
                        return [4 /*yield*/, Promise.all(promises).catch(function (e) {
                                console.error('Error in resolvers');
                                console.error(e);
                                status = RouteHelperStatus.Failed;
                            })];
                    case 1:
                        resultOfResolvers = _a.sent();
                        infos = resultOfResolvers.reduce(function (acc, next, index) {
                            var _a;
                            var key = keys[index];
                            return __assign(__assign({}, acc), (_a = {}, _a[key] = next, _a));
                        }, {});
                        return [2 /*return*/, {
                                infos: infos,
                                status: status
                            }];
                }
            });
        });
    }
    function getGuardsStatusBeforeEvaluating() {
        return guards.length === 0 ? RouteHelperStatus.Loaded : RouteHelperStatus.Loading;
    }
    function getResolversStatusBeforeEvaluating() {
        return Object.keys(resolvers).length === 0 ? RouteHelperStatus.Loaded : RouteHelperStatus.Loading;
    }
    return {
        evaluateGuards: evaluateGuards,
        getGuardsStatusBeforeEvaluating: getGuardsStatusBeforeEvaluating,
        evaluateResolvers: evaluateResolvers,
        getResolversStatusBeforeEvaluating: getResolversStatusBeforeEvaluating
    };
}
function useStatusNotification(guardsStatusChangeReceiver, resolversStatusChangeReceiver) {
    var stackGuardsRef = useRef([]);
    var stackResolversRef = useRef([]);
    return {
        notifyGuardStatusChange: function (status) {
            if (guardsStatusChangeReceiver != null && stackGuardsRef.current[stackGuardsRef.current.length - 1] !== status) {
                stackGuardsRef.current.push(status);
                guardsStatusChangeReceiver(status);
            }
        },
        notifyResolversStatusChange: function (status) {
            if (resolversStatusChangeReceiver != null && stackResolversRef.current[stackResolversRef.current.length - 1] !== status) {
                stackResolversRef.current.push(status);
                resolversStatusChangeReceiver(status);
            }
        },
    };
}

//   // TODO: Add resolvers
//   // TODO: Add resolvers tests
//   // TODO: Add metadata (title)
//   // TODO: Add metadata (title) tests
//
//   // TODO: Add lazy loading
//   // TODO: Add lazy loading tests
//
//   // TODO: Add server side plug
//   // TODO: Add server side plug tests
//
var RouteHelper = function (props) {
    var guards = props.guards || [];
    var resolvers = props.resolvers || {};
    var manager = useManager({
        guards: guards.map(function (g) { return g(); }),
        resolvers: Object.keys(resolvers).reduce(function (acc, next) {
            var _a;
            return (__assign(__assign({}, acc), (_a = {}, _a[next] = resolvers[next](), _a)));
        }, {}),
    });
    var _a = useState(RouteHelperStatus.Initial), guardsStatus = _a[0], setGuardsStatus = _a[1];
    var _b = useState(RouteHelperStatus.Initial), resolversStatus = _b[0], setResolversStatus = _b[1];
    var _c = useState({}), loadedResolverInfos = _c[0], setLoadedResolverInfos = _c[1];
    var notification = useStatusNotification(props.onGuardsStatusChange, props.onResolversStatusChange);
    var evaluateResolvers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialStatus, _a, status, infos;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    initialStatus = manager.getResolversStatusBeforeEvaluating();
                    setResolversStatus(initialStatus);
                    notification.notifyResolversStatusChange(initialStatus);
                    return [4 /*yield*/, manager.evaluateResolvers()];
                case 1:
                    _a = _b.sent(), status = _a.status, infos = _a.infos;
                    setLoadedResolverInfos(infos);
                    setResolversStatus(status);
                    notification.notifyResolversStatusChange(status);
                    return [2 /*return*/];
            }
        });
    }); };
    var evaluateGuardsAndResolvers = function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialStatus, guardStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    initialStatus = manager.getGuardsStatusBeforeEvaluating();
                    setGuardsStatus(initialStatus);
                    notification.notifyGuardStatusChange(initialStatus);
                    return [4 /*yield*/, manager.evaluateGuards()];
                case 1:
                    guardStatus = _a.sent();
                    notification.notifyGuardStatusChange(guardStatus);
                    if (!(guardStatus == RouteHelperStatus.Loaded)) return [3 /*break*/, 3];
                    return [4 /*yield*/, evaluateResolvers()];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    setGuardsStatus(guardStatus);
                    return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, evaluateGuardsAndResolvers()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    if (guardsStatus == RouteHelperStatus.Loaded && resolversStatus === RouteHelperStatus.Loaded) {
        return (React.createElement(RouteContext.Provider, { value: {
                routeResolverInfos: loadedResolverInfos,
            } },
            React.createElement(RouteContext.Consumer, null, function () { return props.element; })));
    }
    return React.createElement(React.Fragment, null);
};
var wrapRouteToHelper = function (props) {
    return React.createElement(RouteHelper, __assign({}, props));
};

var wrapRoutesToHelper = function (routes) {
    return routes.map(function (props) {
        var children = Array.isArray(props.children) ? wrapRoutesToHelper(props.children) : [];
        return __assign(__assign({}, props), { element: wrapRouteToHelper(props), children: children });
    });
};
var useRoutesWithHelper = function (routes, locationArg) {
    return useRoutes(wrapRoutesToHelper(routes), locationArg);
};

function useResolver() {
    return React.useContext(RouteContext).routeResolverInfos;
}

export { RouteHelper, RouteHelperStatus, useResolver, useRoutesWithHelper };
