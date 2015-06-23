(function() {
    app['shopper-profile'] = {
        settings: {
            target: '.mod-shopper-profile'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-profile-chart');

            $.ajax({
                url: 'http://localhost:3001/api/getMostPopulatedCities',
                success: function(data) {
                    app['shopper-profile'].renderChart(chartContainer, $.parseJSON(data));
                },
                error: function(err) {
                    console.log('err');
                }
            })

        },
        renderChart: function(chartContainer, data) {
            var chartData = new Array();


            $.each(data.data, function(i, val) {
                var dataItem = {};

                dataItem.name = this.countryName;
                dataItem.y = this.population;

                chartData.push(dataItem)
            })

            console.log(chartData);

            chartContainer.highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                title: {
                    text: ""
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.point.name + ': ' + (this.y/1000000000).toFixed(2) + ' billions' + '</b>';
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    },
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return (this.y/1000000000).toFixed(2);
                            },
                            distance: -30,
                            color: 'white'
                        }
                    }
                },
                legend: {
                    itemMarginBottom: 10
                },
                series: [{
                    type: 'pie',
                    name: 'Population',
                    data: chartData
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);
