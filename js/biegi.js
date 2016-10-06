// UWAGA! Ta wersja jeszcze nie keszuje templateow!

////////////////////////////// M O D E L S ////////////////////////////////////
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

//////////////////////////////// V I E W S ///////////////////////////////////////
var LogInView = Backbone.View.extend({
    el: $('#col_middle'), // renderowanego w tym elemencie
    initialize: function(){
        _.bindAll(this, 'render'); // zeby metody znaly "this" 
        this.render(); // samorenderujacego sie na starcie 
    },
    render: function(){
        var that = this;
        $.get('tpl/login.html', 
            function(data) {
                var compiledTemplate = _.template(data);
                $(that.el).empty();
                $(that.el).append(compiledTemplate());
            }, 
            'html'
        );
    }
});

var ErrorView = Backbone.View.extend({
    el: $('#error'), 
    initialize: function(){
        _.bindAll(this, 'render');  
        this.render();  
    },
    render: function(){
        var compiledTemplate = _.template('<div class="alert alert-danger" role="alert"><%= responseText %></div>');
        $(this.el).empty();
        $(this.el).append(compiledTemplate(this.model));
    }
});

var ChartView = Backbone.View.extend({
    el: $('#col_middle'), 
    initialize: function(){
        _.bindAll(this, 'render');  
        this.render();  
    },
    render: function(){
        var that = this;
        $.get('tpl/chart.html', 
            function(data) {
                $(that.el).empty();
                $(that.el).append( _.template(data));
            }, 
            'html'
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
    el: $('#col_left'), // renderowanego w tym elemencie
    initialize: function(){
        _.bindAll(this, 'render'); // zeby metody znaly "this" 
        this.render(); // samorenderujacego sie na starcie 
    },
    render: function(){
        var that = this;
        $.get('tpl/stats.html', 
            function(data) {
                var compiledTemplate = _.template(data);
                $(that.el).empty();
                $(that.el).append(compiledTemplate(that.model.toJSON()));
            }, 
            'html'
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
        $.get('tpl/pb.html', 
            function(data) {
                var compiledTemplate = _.template(data);
                elem.append(compiledTemplate(that.model.toJSON()));
            }, 
            'html'
        );
    }
});

var PBSView = Backbone.View.extend({
    el: $('#col_right'), // renderowanego w tym elemencie
    initialize: function(){
        _.bindAll(this, 'render'); // zeby metody znaly "this" 
        this.render(); // samorenderujacego sie na starcie 
    },
    render: function(){
        var that = this;
        $.get('tpl/pbs.html', 
            function(data) {
                var compiledTemplate = _.template(data);
                $(that.el).empty();
                $(that.el).append(compiledTemplate());
                _.each(that.model.models, function (pbModel) {
                    new PBView({model: pbModel}).render($('tbody.body#pbs'));
                }, this);                    
            }, 
            'html'
        );
    }
});

//////////////////////////////// R O U T E R ////////////////////////////////////
var AppRouter = Backbone.Router.extend({
    routes: {
        "login": "login",
        "": "dashboard",
        "dashboard": "dashboard"
    },
    login: function() {
        new LogInView();
    },
    dashboard: function() {
        $.ajax({
            url: "http://run.metadetron.com/Biegi/auth"
        }).then(function(data) {    
            new ChartView();
            var stats = new StatsModel({id: 0});
            stats.fetch(
                {
                    success: function() {
                        new StatsView({model: stats});
                    },
                    error: function(collection, response, options) {
                        new ErrorView({model: response});
                    }
                }
            );
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
        }, function(data) {
            new LogInView();
        });
    }
    
});
var appRouter = new AppRouter();
Backbone.history.start();

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log(profile);
    var authResponse = googleUser.getAuthResponse();
    console.log(authResponse);
    $.post("http://run.metadetron.com/Biegi/auth", { google_id: authResponse.id_token}).done(function( data ) {
        console.log(data);
        appRouter.navigate("dashboard", {trigger: true});
    });
    // location.reload();

    // Useful data for your client-side scripts:
//    var profile = googleUser.getBasicProfile();
//    $("#profilePhoto").attr("src", profile.getImageUrl());
//    $("#fullName").text(profile.getName());
    
/*    console.log("ID: " + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log("Image URL: " + profile.getImageUrl());
    console.log("Email: " + profile.getEmail()); 

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token); */
};
