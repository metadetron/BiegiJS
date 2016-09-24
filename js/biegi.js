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

                data.addRows([
                    [{v: [8, 0, 0], f: '8 am'}, 1],
                    [{v: [9, 0, 0], f: '9 am'}, 2],
                    [{v: [10, 0, 0], f:'10 am'}, 3],
                    [{v: [11, 0, 0], f: '11 am'}, 4],
                    [{v: [12, 0, 0], f: '12 pm'}, 5],
                    [{v: [13, 0, 0], f: '1 pm'}, 6],
                    [{v: [14, 0, 0], f: '2 pm'}, 7],
                    [{v: [15, 0, 0], f: '3 pm'}, 8],
                    [{v: [16, 0, 0], f: '4 pm'}, 9],
                    [{v: [17, 0, 0], f: '5 pm'}, 10],
                ]);

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

                var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
                chart.draw(data, options);
                }
            
        }
    });
    new ChartView();
})(jQuery);