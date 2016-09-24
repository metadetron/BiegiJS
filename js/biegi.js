////////////////////////////// M O D E L S ////////////////////////////////////

  var Month = Backbone.Model.extend({
    defaults: {
      date: null,
      distance: 0
    }
  });

  var Months = Backbone.Collection.extend({
    model: Month,
    url:"http://run.metadetron.com/Biegi/miesiac/"
  });

////////////////////////////// V I E W S /////////////////////////////////

// co tu sie dzieje sie?
(function($){
    // definicja widoku
    var LorumView = Backbone.View.extend({
        el: $('#col_left'), // renderowanego w tym elemencie
        initialize: function(){
            _.bindAll(this, 'render'); // zeby metody znaly "this" 
            this.render(); // samorenderujacego sie na starcie 
        },
        render: function(){
            var that = this;
            $.get('tpl/portlet.html', 
                function(data) {
                    $(that.el).append( _.template(data));
                }, 
                'html'
            );
        }
    });
    new LorumView();
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
                data.addColumn('timeofday', 'Time of Day');
                data.addColumn('number', 'Motivation Level');
                var options = {
                    title: 'Motivation and Energy Level Throughout the Day',
                    focusTarget: 'category',
                    hAxis: {
                        title: 'Time of Day',
                        format: 'h:mm a',
                        viewWindow: {
                            min: [7, 30, 0],
                            max: [17, 30, 0]
                        },
                        textStyle: {
                            fontSize: 14,
                            color: '#053061',
                            bold: true,
                            italic: false
                        },
                        titleTextStyle: {
                            fontSize: 18,
                            color: '#053061',
                            bold: true,
                            italic: false
                        }
                    },
                    vAxis: {
                        title: 'Rating (scale of 1-10)',
                        textStyle: {
                            fontSize: 18,
                            color: '#67001f',
                            bold: false,
                            italic: false
                        },
                        titleTextStyle: {
                            fontSize: 18,
                            color: '#67001f',
                            bold: true,
                            italic: false
                        }
                    }
                };
                // wywolaj api pobierajace liste danych
                var months = new Months();
                months.fetch(
                    {
                        success: function() {            
                            data.addRows(months);
                            view.render();                
                            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
                            chart.draw(data, options);
                        },
                        error: function(model, response) {
                            alert(response.responseText);
                        }
                    }
                );
            }            
        }
    });
    new ChartView();
})(jQuery);