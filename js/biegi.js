var BiegiModule = (function(){

    var profilePictureUrl = null;
    var profileName = null;
    var sessionToken = null;
    var compiledTemplateCache = {};
    var odcinekCollection = null;
    var views = {
        chartView: null,
        wiatrTableView: null,
        statsView: null,
        biegAddView: null,
        biegiView: null 
    };

    var getSessionToken = function() {
        return this.sessionToken;
    }

    $.ajaxSetup({
        data: {'token': getSessionToken }
    });          

    var _sync = Backbone.sync;
    Backbone.sync = function(method, model, options) {

        if( model && (method === 'create' || method === 'update' || method === 'patch') ) {
            options.contentType = 'application/json';
            options.data = JSON.stringify(options.attrs || model.toJSON());
            options.url = model.urlRoot + "?token=" + getSessionToken();
        }

        return _sync.call( this, method, model, options );
    }

    ////////////////////////////// M O D E L S ////////////////////////////////////
    var DictionaryModel = Backbone.Model.extend({
        defaults: {
            value: null,
            title: null,
            parentId: null
        },
        initialize: function(){        
        }
    });

    var DictionaryCollection = Backbone.Collection.extend({
        url: function() {
            return 'http://run.metadetron.com/Biegi/dictionary/' + this.entityName + '/';
        },
        model: DictionaryModel,
        initialize: function(entityName) {
            this.entityName = entityName;
        }, 
    });    
    
    var StatsModel = Backbone.Model.extend({
        urlRoot: 'http://run.metadetron.com/Biegi/stats/', 
        defaults: {
            currentDate: null,
            runCount: null,
            lastRun: null,
            totalDistance: null
        },
        initialize: function(){        
        }
    });

    var PBModel = Backbone.Model.extend({
        defaults: {
            location: null,
            track: null,
            time: null
        },
        initialize: function(){        
        }
    });

    var PBCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/pb/',
        model: PBModel 
    });

    var BiegModel = Backbone.Model.extend({
        defaults: {
            bgg_id: null,
            bgg_dzien: null, 
  	        bgg_bty_id: null,
  	        bgg_tmp_id: null,
            bgg_mjs_id: null,
            miejsce: null,
            odc_id: null,
            bgg_opd_id: null,
            bgg_wtr_id: null,
            bgg_rbg_id: null,
            bgg_dystans: null,
            bgg_sekundy: null,
            bgg_opis: null,
            rodzajBiegu: null,
            buty: null,
            wiatr: null,
            temperatura: null,
            opad: null,
            godziny: null,
            minuty: null,
            sekundy: null	
        },
        urlRoot: 'http://run.metadetron.com/Biegi/biegjs/',
        initialize: function(){        
        }
    });

    var BiegCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/biegjs/',
        model: BiegModel 
    });

    var WiatrModel = Backbone.Model.extend({
        defaults: {
            wtr_id: null,
	        wtr_opis: null,
	        wtr_date_created: null,
	        wtr_date_modified: null,
		    wtr_usr_created_id: null,
	        wtr_usr_modified_id: null,
	        wtr_display_order: null
        },
        urlRoot: 'http://run.metadetron.com/Biegi/wiatr/',
        initialize: function(){        
        }
    });

    var WiatrCollection = Backbone.Collection.extend({
        url: 'http://run.metadetron.com/Biegi/wiatr/',
        model: WiatrModel 
    });
    //////////////////////////////// V I E W S ///////////////////////////////////////
    var LogInView = Backbone.View.extend({
        el: $('#page_login #col_middle #top_1'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            console.log("Rendering LogInView...");
            $('#login').show();
            $('#logout').hide();
            var that = this;
            fillTemplate('login',
                function (compiledTemplate) {
                    // $('#col_left #left_top_1').empty();
                    // $('#col_left #left_top_2').empty();
                    // $('#col_right #right_top_1').empty();
                    // $('#col_right #right_top_2').empty();
                    // $('#col_middle #top_2').empty();
                    // $(that.el).empty();
                    $(that.el).append(compiledTemplate());
                } 
            );            
        }
    });

    var DictionarySelectionView = Backbone.View.extend({        
        initialize: function(){
            _.bindAll(this, 'render');
        },        
        render: function(el){
            var that = this;
            // $(el).empty(); 
            _.each(that.model.models, function (dictionaryModel) {
                fillTemplate('dictionarySelect',
                    function (compiledTemplate) {
                        $(el).append(compiledTemplate(dictionaryModel.toJSON()));
                    } 
                );
            }, this);                    
        }
    });

    var WiatrTableView = Backbone.View.extend({
        el: $('#page_config #col_left #left_top_1'),
        initialize: function(){
            _.bindAll(this, 'render');
            // this.listenTo(this.model, 'sync', this.render);
            this.listenTo(appEvents, 'WiatrEditView:persisted', this.render);
        },        
        render: function(m){
            this.model = m;
console.log('WiatrTableView.render() called');            
            var that = this;
            // $(this.el).empty(); 
            fillTemplate('wiatrTable', 
                function (compiledTemplate) {
                    $(that.el).empty();
                    $(that.el).append(compiledTemplate());
                    _.each(that.model.models, function (wiatrModel) {
                        fillTemplate('wiatrTableRow', 
                            function (compiledTemplate) {
                                $("tbody", that.el).append(compiledTemplate(wiatrModel.toJSON()));
                            } 
                        );
                    }, that);                    
                } 
            );
        }
    });

    var WiatrEditView = Backbone.View.extend({
        el: $('#page_config #col_left #left_top_1'),
        initialize: function(){
            _.bindAll(this, 'render');
            this.render();
        },        
        render: function(){
            var that = this;
            fillTemplate('wiatrEdit', 
                function (compiledTemplate) {
                    // $(that.el).empty();
                    $(that.el).append(compiledTemplate(that.model.toJSON()));
                } 
            );
        },
        events: {
            "change"        : "change",
             "click .save"   : "persist"
        },
        change: function (event) {
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change); //, {validate : true}); bo nie mamy validatorow indywidualnych w modelu jeszcze(?)
        },
        persist: function (event) {
            var self = this;
            this.model.save(null, {
                success: function (model) {
                    var wiatrCollection = new WiatrCollection('wiatr'); 
                    wiatrCollection.fetch(
                        {
                            success: function() {
                                self.undelegateEvents(); // potrzebne?
                                // appRouter.navigate("config", {trigger: true});
                                appEvents.trigger('WiatrEditView:persisted'); // model.sync event???                                
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );            
                },
                error: function (model, response) {
                    new ErrorView({model: response});
                }
            });
            event.preventDefault();
        },
    });

    var ErrorView = Backbone.View.extend({
        el: $('#error'), 
        initialize: function(){
            _.bindAll(this, 'render');  
            this.render();  
        },
        render: function(){
            var compiledTemplate = _.template('<div class="alert alert-danger" role="alert"><%= responseText %> <%= statusText %></div>');
            // $("div.modal-body", this.el).empty();
            $("div.modal-body", this.el).append(compiledTemplate(this.model));
            $(this.el).modal();
        }
    });

    var ChartView = Backbone.View.extend({
        el: $('#chart_view'), 
        initialize: function(){
            _.bindAll(this, 'render');  
        },
        render: function(){
            var that = this;
            fillTemplate('chart',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate());
                } 
            );            
            google.charts.load('current', {packages: ['corechart', 'bar']});
            google.charts.setOnLoadCallback(drawAxisTickColors);

            function drawAxisTickColors() {
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Month');
                data.addColumn('number', 'Distance');
                var options = {
                    title: 'Distance per month'
                };
                // wywolaj api pobierajace liste danych
                $.ajax({
                    url: "http://run.metadetron.com/Biegi/month/"
                }).then(function(months) {
                    data.addRows(months);
                    var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
                    chart.draw(data, options);
                });
            }
        }
    });

    // definicja widoku
    var StatsView = Backbone.View.extend({
        el: $('#stats_view'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('stats',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate(that.model.toJSON()));
                    $("#profilePhoto").attr("src", profilePictureUrl);
                    $("#fullName").text(profileName);                                
                } 
            );
        }
    });

    // definicja widoku
    var PBView = Backbone.View.extend({
        el: null, // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(elem){
            var that = this;
            fillTemplate('pb',
                function (compiledTemplate) {
                    elem.append(compiledTemplate(that.model.toJSON()));
                } 
            );
        }
    });

    var PBSView = Backbone.View.extend({
        el: $('#page_dashboard #col_right #right_top_1'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            var that = this;
            fillTemplate('pbs',
                function (compiledTemplate) {
                    // $(that.el).empty();
                    $(that.el).append(compiledTemplate());
                    _.each(that.model.models, function (pbModel) {
                        new PBView({model: pbModel}).render($('tbody.body#pbs'));
                    }, this);                    
                } 
            );
        }
    });

    var BiegView = Backbone.View.extend({
        el: null, // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(elem){
            var that = this;
            fillTemplate('bieg',
                function (compiledTemplate) {
                    elem.append(compiledTemplate(that.model.toJSON()));
                } 
            );
        }
    });    

    var BiegiView = Backbone.View.extend({
        el: $('#biegi_view'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(m){
            this.model = m;
            var that = this;
            fillTemplate('biegi',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate());
                    _.each(that.model.models, function (biegModel) {
                        new BiegView({model: biegModel}).render($('div#biegi'));
                    }, this);
                } 
            );
        }
    });

    var BiegDetailsView = Backbone.View.extend({
        el: $("#modalDialog"), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this"
            this.render(); 
        },
        render: function(){
            var that = this;
            fillTemplate('biegDetails',
                function (compiledTemplate) {
                    // $(that.el).empty();
                    $(that.el).append(compiledTemplate(that.model.toJSON()));
                    $('#myModal').modal({
                        backdrop: 'static',
                        keyboard: false
                    });
                } 
            );
        }
    });    

    var BiegAddView = Backbone.View.extend({
        el: $('#bieg_add_view'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
        },
        render: function(){
            var that = this;
            this.model = new BiegModel({bgg_dzien: utc = new Date().toJSON().slice(0,10)});
            fillTemplate('biegAdd',
                function (compiledTemplate) {
                    $(that.el).html(compiledTemplate(that.model.toJSON()));
                    var miejsceCollection = new DictionaryCollection('miejsce'); 
                    miejsceCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: miejsceCollection}).render($("#bgg_mjs_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    odcinekCollection = new DictionaryCollection('odcinek'); 
                    odcinekCollection.fetch(
                        {
                            success: function() {
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );                        
                    var temperaturaCollection = new DictionaryCollection('temperatura'); 
                    temperaturaCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: temperaturaCollection}).render($("#bgg_tmp_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var butyCollection = new DictionaryCollection('buty'); 
                    butyCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: butyCollection}).render($("#bgg_bty_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var opadCollection = new DictionaryCollection('opad'); 
                    opadCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: opadCollection}).render($("#bgg_opd_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var wiatrCollection = new DictionaryCollection('wiatr'); 
                    wiatrCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: wiatrCollection}).render($("#bgg_wtr_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                    var rodzajBieguCollection = new DictionaryCollection('rodzajBiegu'); 
                    rodzajBieguCollection.fetch(
                        {
                            success: function() {
                                new DictionarySelectionView({model: rodzajBieguCollection}).render($("#bgg_rbg_id", that.el).first());
                            },
                            error: function(collection, response, options) {
                                new ErrorView({model: response});
                            }
                        }
                    );
                } 
            );
        },
        events: {
            "change"        : "change",
            "change #bgg_mjs_id": "miejsceSelected",
             "click .save"   : "persist"
        },
        change: function (event) {
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change); //, {validate : true}); bo nie mamy validatorow indywidualnych w modelu jeszcze(?)
        },
        persist: function (event) {
            var self = this;
            this.model.save(null, {
                success: function (model) {
                    appRouter.dashboard();
                },
                error: function (model, response) {
                    new ErrorView({model: response});
                }
            });
            event.preventDefault();
        },
        miejsceSelected: function(event) {
            var filteredOdcinekCollection = new Backbone.Collection(odcinekCollection.filter(function (odcinek) {
                if (odcinek.get('parentId') == null) return true;
                return odcinek.get('parentId') == event.target.value;
            }));
            new DictionarySelectionView({model: filteredOdcinekCollection}).render($("#odc_id").first());
        }
    });

    var app = this;

    //////////////////////////////// R O U T E R ////////////////////////////////////
    var AppRouter = Backbone.Router.extend({
        routes: {
            "login": "login",
            "": "login",
            "dashboard": "dashboard",
            "config": "config",
            "biegi/details/:id": "biegDetails",
            "wiatr/edit/:id": "wiatrEdit"
        },
        login: function() {
            $(".backbone_page").hide();
            $("#page_login.backbone_page").show();
            // new LogInView(); TODO
        },
        dashboard: function() {
            $(".backbone_page").hide();
            $("#page_dashboard.backbone_page").show();

            $('#login').hide();
            $('#logout').show();
            $('#myModal').modal('hide');
            // this.views.chartView.render(); // ???
            var pbCollection = new PBCollection();
            pbCollection.fetch(
                {
                    success: function() {
                        new PBSView({model: pbCollection});
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
        },
        biegDetails: function(id) {
            var bieg = new BiegModel({id: id});
            bieg.fetch(
                {
                    success: function() {
                        new BiegDetailsView({model: bieg});
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
        },
        config: function() {
            $(".backbone_page").hide();
            $("#page_config.backbone_page").show();

            // $('#col_left #left_top_1').empty();
            // $('#col_left #left_top_2').empty();
            // $('#col_right #right_top_1').empty();
            // $('#col_right #right_top_2').empty();
            // $('#col_middle #top_1').empty();
            // $('#col_middle #top_2').empty();
            var wiatrCollection = new WiatrCollection('wiatr');
            var that = this; 
            wiatrCollection.fetch(
                {
                    success: function() {
                        views.wiatrTableView.render(wiatrCollection);
                        // that.wiatrTableView.render();
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );            
        },
        wiatrEdit: function(id) {
            console.log("wiatrEdit navigation called");
            // $('#col_left #left_top_1').empty();
            this.wiatrTableView.undelegateEvents();
            var wiatr = new WiatrModel({id: id});
            wiatr.fetch(
                {
                    success: function() {
                        new WiatrEditView({model: wiatr});
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
        }       
    });
    views.chartView = new ChartView();
    views.wiatrTableView = new WiatrTableView();
    views.statsView = new StatsView(); 
    views.biegAddView = new BiegAddView({model: new BiegModel()});
    views.biegiView = new BiegiView();

    var appRouter = new AppRouter();
    var appEvents = _.extend({}, Backbone.Events);
    Backbone.history.start();

    /////////////////////////// U T I L S //////////////////////////
    function fillTemplate(templateId, callback) {
        if (!(templateId in compiledTemplateCache)) {
            var data = $('script#' + templateId).html();
            var compiledTemplate = _.template(data);
            compiledTemplateCache[templateId] = compiledTemplate;
            fillTemplate(templateId, callback);
            return;         
        }
        callback(compiledTemplateCache[templateId]);
    }

    function onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        var authResponse = googleUser.getAuthResponse();
        profilePictureUrl = profile.getImageUrl();
        profileName = profile.getName();
        this.sessionToken = authResponse.id_token;

        views.chartView.render();
        var stats = new StatsModel({id: 0});
        stats.fetch(
            {
                success: function() {
                    views.statsView.render(stats);
                },
                error: function(collection, response, options) {
                    new ErrorView({model: response});
                }
            }
        );
        views.biegAddView.render();
        var biegCollection = new BiegCollection();
        biegCollection.fetch(
            {
                success: function() {
                    views.biegiView.render(biegCollection);
                },
                error: function(collection, response, options) {
                    new ErrorView({model: response});
                }
            }
        );

        appRouter.navigate("dashboard", {trigger: true}); // raczej ma byc: appRouter.dashboard(); ?
    };

    function signOut() {
        var auth2 = gapi.auth2.getAuthInstance();
        var that = this;
        auth2.signOut().then(function () {
            console.log('User signed out.');
            that.sessionToken = null;
            appRouter.navigate("login", {trigger: true});
        });
    };

    return {
        signOut: signOut,
        onSignIn: onSignIn
    };
}());

// for google data-onsuccess :-/
window.onSignIn = BiegiModule.onSignIn;
window.signOut = BiegiModule.signOut;

