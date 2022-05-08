/* eslint-disable */
import React, { useState, useEffect } from 'react';

var RouteHelper = /** @class */ (function () {
    function RouteHelper(component) {
        this.component = component;
    }
    RouteHelper.prototype.create = function () {
        var _a = useState(false), isSet = _a[0], set = _a[1];
        var setSomething = function () {
            setTimeout(function () {
                set(true);
            }, 2000);
        };
        useEffect(function () {
            setSomething();
        }, []);
        if (!isSet) {
            return React.createElement("h1", null, "loading...");
        }
        return React.createElement(React.Fragment, null, this.component);
    };
    return RouteHelper;
}());

var helper = function () {
    console.log('should work!');
};

export { RouteHelper, helper };
