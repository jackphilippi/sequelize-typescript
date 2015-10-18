///<reference path="../typings/bluebird/bluebird.d.ts"/>
///<reference path="../typings/q/Q.d.ts"/>
///<reference path="../node_modules/tsd-goalazo-models/models.d.ts"/>
///<reference path="../node_modules/tsd-http-status-codes/HttpStatus.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var config_1 = require('../config');
var ApiAbstract_1 = require('./ApiAbstract');
var TeamSvcUno_1 = require("../services/Team/TeamSvcUno");
var CompetitionSeriesSvcUno_1 = require('../services/competitionSeries/CompetitionSeriesSvcUno');
var CompetitionSvcUno_1 = require("../services/competition/CompetitionSvcUno");
var CountrySvcUno_1 = require("../services/country/CountrySvcUno");
var UserSvcUno_1 = require("../services/user/UserSvcUno");
var Util_1 = require("../uitils/Util");
var ApiUnus = (function (_super) {
    __extends(ApiUnus, _super);
    function ApiUnus() {
        _super.call(this);
        this.competitionSeriesSvc = new CompetitionSeriesSvcUno_1.CompetitionSeriesSvcUno();
        this.competitionSvc = new CompetitionSvcUno_1.CompetitionSvcUno();
        this.countrySvc = new CountrySvcUno_1.CountrySvcUno();
        this.teamSvc = new TeamSvcUno_1.TeamSvcUno();
        this.userSvc = new UserSvcUno_1.UserSvcUno();
    }
    // USER
    // --------------
    ApiUnus.prototype.postUser = function (req, res, next) {
        var data = req.body;
        if ((!data.name && !data.password) ||
            data.name && data.password) {
            this.userSvc.register(data.name, data.password)
                .then(function (user) { return res.json(user); })
                .catch(next);
        }
        else {
            res.status(400 /* BadRequest */).send("Both name and password should be provided\n            or no parameter for an auto generated user");
        }
    };
    ApiUnus.prototype.authUser = function (req, res, next) {
        var data = req.body;
        this.userSvc.authenticate(data.name, data.password)
            .then(function (user) { return res.json(user); })
            .catch(next);
    };
    ApiUnus.prototype.getUserFilters = function (req, res, next) {
        this.userSvc.getUserFilters(req.user, req.query.limit)
            .then(function (filters) { return res.json(filters); })
            .catch(next);
    };
    ApiUnus.prototype.postUserFilter = function (req, res, next) {
        var data = req.body;
        data.teamIds = Util_1.Util.toArrayIfExists(data.teamIds);
        data.competitionSeriesIds = Util_1.Util.toArrayIfExists(data.competitionSeriesIds);
        if (data.filterName && (data.teamIds || data.competitionSeriesIds)) {
            this.userSvc.setUserFilter(req.user, data.filterName, data.teamIds, data.competitionSeriesIds)
                .then(function () { return res.sendStatus(200 /* OK */); })
                .catch(next);
        }
        else {
            res.status(400 /* BadRequest */).send("Parameters missing: filterName and teamIds or competitionSeriesIds");
        }
    };
    // COUNTRIES
    // --------------
    ApiUnus.prototype.getCountries = function (req, res, next) {
        this.countrySvc.getCountries(req.query.limit)
            .then(function (countries) {
            res.json(countries);
        })
            .catch(next);
    };
    ApiUnus.prototype.getCountryCompetitions = function (req, res, next) {
        this.countrySvc.getCountryCompetitions(req.params.countryId, req.query.limit)
            .then(function (competitions) {
            res.json(competitions);
        })
            .catch(next);
    };
    // COMPETITION SERIES
    // --------------
    ApiUnus.prototype.getCompetitionSeries = function (req, res, next) {
        var _this = this;
        Q.when(null)
            .then(function () { return _this.competitionSeriesSvc.getCompetitionSeries(); })
            .then(function (competitionSeries) {
            res.json(competitionSeries);
        })
            .catch(next);
    };
    // COMPETITION
    // --------------
    ApiUnus.prototype.getCompetitionTeams = function (req, res, next) {
        var _this = this;
        Q.when(null)
            .then(function () { return _this.competitionSvc.getCompetitionTeams(req.params.competitionId, req.query.limit); })
            .then(function (teams) {
            res.json(teams);
        })
            .catch(next);
    };
    // TEAM
    // --------------
    ApiUnus.prototype.getTeams = function (req, res, next) {
        var _this = this;
        Q.when(null)
            .then(function () { return _this.teamSvc.getTeams(); })
            .then(function (teams) {
            res.json(teams);
        })
            .catch(next);
    };
    // MIDDLEWARE
    // ---------------------------
    ApiUnus.prototype.checkRequestFilterMiddleware = function (req, res, next) {
        if (req.query.limit > config_1.config.request.maxLimit) {
            // if limit is higher than configured max
            // response with BAD REQUEST
            res.status(400 /* BadRequest */).send('Maximal limit for data request is ' + config_1.config.request.maxLimit);
            return;
        }
        else if (!req.query.limit) {
            // if no limit is defined, set limit to maxLimit
            req.query.limit = config_1.config.request.maxLimit;
        }
        next();
    };
    ApiUnus.prototype.checkAuthenticationMiddleWare = function (req, res, next) {
        var token = req.headers[config_1.config.request.accessTokenHeader];
        if (!token) {
            res.sendStatus(401 /* Unauthorized */);
        }
        this.userSvc.checkAuthentication(token)
            .then(function (user) {
            req.user = user;
            next();
        })
            .catch(function () {
            res.status(401 /* Unauthorized */);
        });
    };
    return ApiUnus;
})(ApiAbstract_1.ApiAbstract);
exports.ApiUnus = ApiUnus;
//# sourceMappingURL=ApiUnus.js.map