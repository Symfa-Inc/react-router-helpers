/* eslint-disable */
import React, { useRef, useContext, useState, useEffect } from 'react';
import { useLocation, Outlet, useRoutes } from 'react-router-dom';

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
    canStartToLoadWorkers: true,
    cancelTitleResolvingForParent: function (_) { },
});
//# sourceMappingURL=context.js.map

var RouteHelperStatus;
(function (RouteHelperStatus) {
    RouteHelperStatus[RouteHelperStatus["Initial"] = 0] = "Initial";
    RouteHelperStatus[RouteHelperStatus["Loading"] = 1] = "Loading";
    RouteHelperStatus[RouteHelperStatus["Loaded"] = 2] = "Loaded";
    RouteHelperStatus[RouteHelperStatus["Failed"] = 3] = "Failed";
})(RouteHelperStatus || (RouteHelperStatus = {}));
//# sourceMappingURL=types.js.map

var isNullOrUndefined = function (obj) {
    return obj === null || obj === undefined;
};
function useManager(_a) {
    var guards = _a.guards, resolvers = _a.resolvers, title = _a.title, titleResolver = _a.titleResolver;
    var previouslyResolvedTitleRef = useRef('');
    // useEffect(() => {
    //   if (hasRouteTitle()) {
    //     const prevTitle = document.title;
    //     document.title = title!;
    //
    //     return () => {
    //       if (hasRouteTitle()) {
    //         document.title = prevTitle;
    //       }
    //     };
    //   }
    // }, []);
    function evaluateGuards(isComponentAliveRef) {
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
                        if (!isComponentAliveRef.current) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, guard()];
                    case 3:
                        canActivate = _a.sent();
                        if (!canActivate) {
                            return [2 /*return*/, RouteHelperStatus.Failed];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error("Error in guards");
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
            var status, keys, promises, _i, _a, resolverKey, resultOfResolvers, infos;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        status = RouteHelperStatus.Loaded;
                        keys = Object.keys(resolvers).map(function (resolverKey) { return resolverKey; });
                        promises = [];
                        for (_i = 0, _a = Object.keys(resolvers); _i < _a.length; _i++) {
                            resolverKey = _a[_i];
                            try {
                                promises.push(resolvers[resolverKey]());
                            }
                            catch (_c) {
                                status = RouteHelperStatus.Failed;
                            }
                        }
                        return [4 /*yield*/, Promise.all(promises).catch(function (e) {
                                console.error("Error in resolvers");
                                console.error(e);
                                status = RouteHelperStatus.Failed;
                            })];
                    case 1:
                        resultOfResolvers = _b.sent();
                        if (status === RouteHelperStatus.Failed) {
                            return [2 /*return*/, {
                                    status: status,
                                    infos: {}
                                }];
                        }
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
    function setTitleWithName(title) {
        console.log('SET TITLE +++++++++++++++++++++++ ' + title);
        document.title = title;
    }
    function setTitle() {
        if (!isNullOrUndefined(title)) {
            setTitleWithName(title);
        }
    }
    function resolveTitle(isComponentAliveRef) {
        return __awaiter(this, void 0, void 0, function () {
            var titleFromResolver;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof titleResolver == "function")) return [3 /*break*/, 2];
                        if (previouslyResolvedTitleRef.current !== '') {
                            setTitleWithName(previouslyResolvedTitleRef.current);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, titleResolver()];
                    case 1:
                        titleFromResolver = _a.sent();
                        previouslyResolvedTitleRef.current = titleFromResolver;
                        if (isComponentAliveRef.current) {
                            setTitleWithName(titleFromResolver);
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    }
    return {
        evaluateGuards: evaluateGuards,
        getGuardsStatusBeforeEvaluating: getGuardsStatusBeforeEvaluating,
        evaluateResolvers: evaluateResolvers,
        getResolversStatusBeforeEvaluating: getResolversStatusBeforeEvaluating,
        resolveTitle: resolveTitle,
        setTitle: setTitle
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
        }
    };
}
//# sourceMappingURL=inner-hooks.js.map

//   // TODO: Add metadata (title)
//   // TODO: Add metadata (title) tests
// TODO: BUG if press on the same link again
// TODO: BUG if press on the last link - title was set from first parent
// TODO: BUG if first press on child1 and then second press on child 2 - title was set from child1
//  // TODO: Add preserve query params strategy for Link component
//  // TODO: Add preserve query params strategy for Link component tests
//
//   // TODO: Add lazy loading
//   // TODO: Add lazy loading tests
//
//   // TODO: Add server side plug
//   // TODO: Add server side plug tests
//
var RouteHelper = function (props) {
    //#region hooks usage
    var parentContext = useContext(RouteContext);
    var location = useLocation();
    var notification = useStatusNotification(props.onGuardStatusChange, props.onResolverStatusChange);
    //#endregion hooks usage
    var COMPONENT_NAME = props.element.type.name;
    var initializeManagerParams = function () {
        var guards = props.guards || [];
        var resolvers = props.resolvers || {};
        var titleResolver = props.titleResolver || null;
        return {
            guards: guards.map(function (g) { return g(); }),
            resolvers: Object.keys(resolvers).reduce(function (acc, next) {
                var _a;
                return (__assign(__assign({}, acc), (_a = {}, _a[next] = resolvers[next](), _a)));
            }, {}),
            title: props.title,
            titleResolver: titleResolver !== null ? titleResolver() : null,
        };
    };
    var manager = useManager(initializeManagerParams());
    var isComponentStillAlive = useRef(true);
    var lastLocationKey = useRef("");
    //#region Refs to prevent double calls
    var wereWorkersStarted = useRef(false);
    var wasParentTitleResolvingCanceled = useRef(false);
    //#endregion Refs to prevent double calls
    //#region Workers infos
    var _a = useState(RouteHelperStatus.Initial), guardsStatus = _a[0], setGuardsStatus = _a[1];
    var _b = useState(RouteHelperStatus.Initial), resolversStatus = _b[0], setResolversStatus = _b[1];
    var _c = useState({}), loadedResolverInfos = _c[0], setLoadedResolverInfos = _c[1];
    //#endregion Workers infos
    var _d = useState(false), canChildStartWorkers = _d[0], setCanChildStartWorkers = _d[1];
    //#region titleResolve
    var lastCancellationKeyFromChild = useRef("");
    var setCancellationKeyForCurrentRoute = function (cancellationKey) {
        lastCancellationKeyFromChild.current = cancellationKey;
    };
    var resolveTitle = function () {
        manager.resolveTitle(isComponentStillAlive);
    };
    var resetCancellationTitleResolvingForParent = function () {
        wasParentTitleResolvingCanceled.current = false;
    };
    var cancelParentTitleResolving = function (cancellationKey) {
        if (!wasParentTitleResolvingCanceled.current) {
            wasParentTitleResolvingCanceled.current = true;
            parentContext.cancelTitleResolvingForParent(cancellationKey);
        }
    };
    var initCancellationTitleResolvingForParent = function (cancellationKey) {
        cancelParentTitleResolving(cancellationKey);
        // console.log('initCancellationTitleResolvingForParent +++++++++++++++++++++++ ');
        if (isLastChild()) {
            console.log('initCancellationTitleResolvingForParent +++++++++++++++++++++++ ');
            manager.setTitle();
            // If route was already loaded
            if (resolversStatus === RouteHelperStatus.Loaded) {
                // TODO: Navigate back, BUG with setting title back do we need to solve it?
                resolveTitle();
            }
        }
    };
    //#endregion titleResolve
    var isUpdateOnNewLocation = function () {
        var isNew = lastLocationKey.current !== "" && lastLocationKey.current !== location.key;
        if (isNew) {
            lastLocationKey.current = location.key;
        }
        return isNew;
    };
    var isLastChild = function () {
        console.log('isLastChild +++++++++++++++++++++++ ');
        return lastLocationKey.current !== lastCancellationKeyFromChild.current;
    };
    //#region workers
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
                    console.log('AFTER RESOLVERS ' + RouteHelperStatus[status] + COMPONENT_NAME);
                    if (status === RouteHelperStatus.Loaded) {
                        setCanChildStartWorkers(true);
                        if (isLastChild()) {
                            resolveTitle();
                        }
                    }
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
                    console.log('send initial status ' + RouteHelperStatus[initialStatus] + " " + COMPONENT_NAME);
                    setGuardsStatus(initialStatus);
                    notification.notifyGuardStatusChange(initialStatus);
                    return [4 /*yield*/, manager.evaluateGuards(isComponentStillAlive)];
                case 1:
                    guardStatus = _a.sent();
                    if (guardStatus === null) {
                        return [2 /*return*/];
                    }
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
    //#endregion workers
    //#region Triggers
    useEffect(function () {
        console.log('mount ' + COMPONENT_NAME);
        lastLocationKey.current = location.key;
        initCancellationTitleResolvingForParent(location.key);
        isComponentStillAlive.current = true;
        return function () {
            console.log('unmount ' + COMPONENT_NAME);
            isComponentStillAlive.current = false;
        };
    }, []);
    useEffect(function () {
        if (parentContext.canStartToLoadWorkers && !wereWorkersStarted.current) {
            wereWorkersStarted.current = true;
            evaluateGuardsAndResolvers();
        }
    }, [parentContext]);
    useEffect(function () {
        if (isUpdateOnNewLocation() && isLastChild()) {
            resetCancellationTitleResolvingForParent();
            initCancellationTitleResolvingForParent(lastLocationKey.current);
        }
    }, [location]);
    //#endregion Triggers
    var elementToRender = parentContext.canStartToLoadWorkers &&
        guardsStatus === RouteHelperStatus.Loaded &&
        resolversStatus === RouteHelperStatus.Loaded ? (props.element) : (React.createElement(Outlet, null));
    return (React.createElement(RouteContext.Provider, { value: {
            routeResolverInfos: loadedResolverInfos,
            canStartToLoadWorkers: canChildStartWorkers,
            cancelTitleResolvingForParent: setCancellationKeyForCurrentRoute
        } },
        React.createElement(RouteContext.Consumer, null, function () { return elementToRender; })));
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
//# sourceMappingURL=hooks.js.map

export { RouteHelper, RouteHelperStatus, useResolver, useRoutesWithHelper };
