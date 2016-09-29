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

////////////////////////////// V I E W S /////////////////////////////////
(function($){
    var ErrorView = Backbone.View.extend({
        el: $('#error'), 
        initialize: function(){
            _.bindAll(this, 'render');  
            this.render();  
        },
        render: function(){
            var compiledTemplate = _.template('<div class="alert alert-danger" role="alert"><%= message %></div>');
            $(that.el).append(compiledTemplate(this.message));
        }
    });
})(jQuery);

(function($){
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
    new ChartView();
})(jQuery);

(function($){
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
                    $(that.el).append(compiledTemplate(that.model.toJSON()));
                }, 
                'html'
            );
        }
    });
    var stats = new StatsModel({id: 0});
    stats.fetch(
        {
            success: function() {
                new StatsView({model: stats});
            },
            error: function(collection, response, options) {
                new ErrorView({message: response.responseText});
            }
        }
    );
})(jQuery);

(function($){
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
    // definicja widoku
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
                    $(that.el).append(compiledTemplate());
                    _.each(that.model.models, function (pbModel) {
                        new PBView({model: pbModel}).render($('tbody.body#pbs'));
                    }, this);                    
                }, 
                'html'
            );
        }
    });
    var pbCollection = new PBCollection();
    pbCollection.fetch(
        {
            success: function() {
                new PBSView({model: pbCollection});
            },
            error: function(collection, response, options) {
                new ErrorView({message: response.responseText});
            }
        }
    );
})(jQuery);
