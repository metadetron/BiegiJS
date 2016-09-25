////////////////////////////// M O D E L S ////////////////////////////////////
var StatsModel = Backbone.Model.extend({
    defaults: {
        currentDate: "TESCIOR!",
        runCount: null,
        lastRun: null,
        totalDistance: null
    },
    initialize: function(){        
    }
});


////////////////////////////// V I E W S /////////////////////////////////
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
                    var template = _.template(data);
                    $(that.el).append(template(that.model.toJSON()));
                }, 
                'html'
            );
        }
    });
    new StatsView({model: new StatsModel()});
})(jQuery);
