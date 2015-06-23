/*! MongoDB_Node_POC 1.0.0 2015-06-23 */
//####js/component/base.js
// Define Namespace
(function() {
    this.app = {};
}).call(this);

// Config
(function() {
    app.config = {
        hello: 'world'
    };
}(app));

//use media queries to determine if what screen size we are using
// Create the state-indicator element
var indicator = document.createElement('div');
indicator.className = 'state-indicator';
document.body.appendChild(indicator);

//function added below - getDeviceState - use this to determine state.
// Create a method which returns device state
function getDeviceState() {
    var state = window.getComputedStyle(
        document.querySelector('.state-indicator'), ':before'
    ).getPropertyValue('content')

    state = state.replace(/"/g, "");
    state = state.replace(/'/g, ""); //fix for update in chrome which returns ''

    return state; //need to replace quotes to support mozilla - which returns a string with quotes inside.

}

// FOR DEBUG
// Cancel out errors in browsers that don't recognise various console functions
(function() {
    if (!window.console) {
        window.console = {};
    }
    // Union of Chrome, FF, IE, and Safari console methods
    var m = [
        "log", "info", "warn", "error", "debug", "trace", "dir", "group",
        "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
        "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
    ];
    // Define undefined methods as noops to prevent errors
    var noops = function() {};
    for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = noops;
        }
    }
})();


$(function() {
    app.util.initModules();
});


(function() {
    app.util = {
        initModules: function(context) {

            var modules = [],
                unique = [],
                pattern = '[class^="mod-"], [class*=" mod-"]';
            targets = $(pattern, context);

            // NOTE: When calling this function you CAN pass either a selector
            // string or jQuery object as the context, it will handle either.
            context = $(context);

            // No context? Set as the document
            if (context.length === 0) context = $(document);

            // If context is a valid element, add it as a target. This catches
            // instances where the context is also a module
            // NOTE: Context could reference multiple elements, hence the loop
            context.each(function() {
                if (!!$(this).filter(pattern).length) targets = targets.add($(this));
            });

            // Loop through all targets (target are elements with .mod class)
            targets.each(function() {

                // Grab element classes & match pattern mod-{module}
                var matches = $(this).prop('class').match(/mod-([^ ]+)/g);

                // Add module(s) to modules array
                $.each(matches, function(i) {

                    // NOTE: We strip out 'mod-' here as the global tag in the
                    // regex causes the whole match to be returned, not just
                    // the capture group #BangsHeadAgainstWall
                    var module = matches[i].replace('mod-', '');

                    // Add only if module exists
                    if (app[module]) {
                        modules.push(module);

                    }
                });
            });

            // Remove duplicate entries
            $.each(modules, function(i, n) {
                if ($.inArray(n, unique) === -1) unique.push(n);
            });
            modules = unique;

            // Fire init on each module
            var defer = [];
            $.each(modules, function(i) {
                if (app[modules[i]].init) {

                    // Defer till after main init loop?
                    if (app[modules[i]].settings.defer) {
                        defer.push(modules[i]);
                    } else {
                        app[modules[i]].init(context);
                    }
                } else {
                    console.log('initModule: The module \'' + modules[i] + '\' does not have an init method');
                }
            });

            // Fire init on deferred modules
            $.each(defer, function(i) {
                if (app[defer[i]].init) {
                    app[defer[i]].init(context);
                } else {
                    console.log('initModule: The module \'' + defer[i] + '\' does not have an init method');
                }
            });

            // Return list of modules
            return modules;

        },
    }
})(app);



//####js/component/highcharts-options.js
// $(function() {
// 	var highCharts = Highcharts || {};
	
//     highCharts.setOptions({
//         colors: ['#55c6f2', '#a9d18e', '#f7d348', '#c9c9c9']
//     });
// });

//####js/component/tile-section.js
(function() {
    app['tile-section'] = {
        settings: {
            target: '.mod-tile-section'
        },
        init: function(context) {
            var tile_opportunity = App.Template['tile_opportunity'];
            var tile_storeFront = App.Template['tile_storeFront'];
            var tile_dwellTime = App.Template['tile_dwellTime'];
            var tile_customers = App.Template['tile_customers'];

            app['tile-section'].fetchData('getTotalCount', tile_opportunity, '.section-opportunity');
            app['tile-section'].fetchData('getContinentCount', tile_storeFront, '.section-storeFront');
            app['tile-section'].fetchData('getCountriesInContinent', tile_dwellTime, '.section-dwellTime', {
                'country': 'Asia'
            });
            app['tile-section'].fetchData('getMostPopulatedCities', '', '.section-customers');

        },
        fetchData: function(url, template, parentContainer, data) {
            $.ajax({
                url: 'http://localhost:3001/api/' + url,
                data: data || {},
                success: function(data) {
                    if (template) {
                        app['tile-section'].bindTemplate(data, template, parentContainer);
                    } else {
                        console.log(data);
                    }
                },
                error: function(err) {
                    console.log('err');
                }
            })
        },
        bindTemplate: function(data, template, parentContainer) {
            var response = $.parseJSON(data);

            $(parentContainer).html(template({
                'tile-name': response.name,
                'tile-percent': response.data,
                'tile-percent-change': '',
                'tile-period-param': response.desc
            }));
        }
    }
})(app);

//####js/component/shopper-engagement.js
(function() {
    app['shopper-engagement'] = {
        settings: {
            target: '.mod-shopper-engagement'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-engagement-chart');

            app['shopper-engagement'].renderChart(chartContainer);


        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                colors: ['#a6a6a6', '#55c6f2'],
                title: {
                    text: ''
                },
                xAxis: {
                    categories: ['>10 mins', '5-20 mins', '2-5 mins', 'bounced'],
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: ''
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ' millions'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -40,
                    y: 100,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow: true
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }, {
                    name: 'This Month',
                    data: [133, 156, 947, 408]
                }]
            });
        }
    }
})(app);

//####js/component/shopper-profile.js
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

//####js/component/revisit-frequency.js
(function() {
    app['revisit-frequency'] = {
        settings: {
            target: '.mod-revisit-frequency'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#revisit-frequency-chart');

            app['revisit-frequency'].renderChart(chartContainer);


        },
        renderChart: function(chartContainer) {
// Highcharts.setOptions({
//         colors: ['#00b0f0', '#f7d348', '#92d050', '#0070c0', '#ff6d60', '#7030a0']
//     });
            chartContainer.highcharts({
                chart: {
                    type: 'pie',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                colors: ['#b4c7e7', '#0070c0', '#55c6f2', '#a9d18e', '#f7d348', '#767171'],
                title: {
                    text: ''
                },
                yAxis: {
                    title: {
                        text: 'Total percent market share'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false
                    },
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return 'test';
                            },
                            distance: -30,
                            color: 'white'
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>: ' + this.y + ' %';
                    }
                },
                legend: {
                    enabled: true,
                    layout: 'vertical',
                    align: 'right',
                    width: 200,
                    verticalAlign: 'middle',
                    useHTML: true,
                    itemMarginTop: 10,
                    itemMarginBottom: 10,
                    labelFormatter: function() {
                        return '<div style="text-align: left; width:50px;float:right;">' + this.name + '</div>';
                    }
                },
                series: [{
                    name: 'Browsers',
                    data: [
                        ["0-2 weeks", 10],
                        ["2-4 weeks", 15],
                        ["1-3 months", 10],
                        ["3-6 months", 35],
                        ["6-1 months", 10],
                        ["> 1 year", 20]
                    ],
                    size: '100%',
                    innerSize: '60%',
                    showInLegend: true,
                    dataLabels: {
                        enabled: false
                    }
                }],
                credits: {
                    enabled: false
                },
            });
        }
    }
})(app);

//####js/component/cross-store.js
(function() {
    app['cross-store'] = {
        settings: {
            target: '.mod-cross-store'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#cross-store-chart');

            app['cross-store'].renderChart(chartContainer);


        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                chart: {
                    type: 'column',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: [
                        'DLF Vasant Kunj',
                        'Brand Average'
                    ],
                    crosshair: true
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Cross-store',
                    data: [{
                            y: 49.9,
                            color: '#a9d18e'
                        },
                        {
                            y: 71.5,
                            color: '#55c6f2'
                        }
                    ]

                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);

//####js/component/time-trend.js
(function() {
    app['time-trend'] = {
        settings: {
            target: '.mod-time-trend'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#time-trend-chart');

            app['time-trend'].renderChart(chartContainer);


        },
        renderChart: function(chartContainer) {
            chartContainer.highcharts({
                title: {
                    text: '',
                    style: {
                        fontFamily: 'Arial'
                    }
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ]
                },
                yAxis: {
                    title: {
                        text: 'Walk-ins'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: ''
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: [{
                    name: 'Tokyo',
                    data: [7.0, 6.9, 9.5, 14.5, 22, 11, 21.2, 26.5, 23.3, 18.3, 13.9, 9.6]
                }, {
                    name: 'New York',
                    data: [-0.2, 0.8, 8, 21, 17.0, 20.0, 8, 11.1, 29.1, 14.1, 8.6, 2.5]
                }],
                credits: {
                    enabled: false
                }
            });
        }
    }
})(app);
//####js/component/right-now.js
(function() {
    app['right-now'] = {
        settings: {
            target: '.mod-right-now'
        },
        init: function(context) {
            var s = this.settings;
            var chartContainer = $(s.target).find('#shopper-area-chart');

            $.ajax({
                url: 'http://localhost:3001/api/getCountiesByArea',
                success: function(data) {
                    app['right-now'].renderChart(chartContainer, $.parseJSON(data));
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
                dataItem.y = this.areaInSqKm;

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
                        return '<b>' + this.point.name + ': ' + (this.y/10000000).toFixed(2) + ' cr sqKm' + '</b>';
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
                                return (this.y/10000000).toFixed(2);
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

//####js/component/internal-benchmarking.js
(function() {
    app['internal-benchmarking'] = {
        settings: {
            target: '.mod-internal-benchmarking'
        },
        init: function(context) {
            var s = this.settings;

            $('.benchmark-start-date').datepicker({});
            $('.benchmark-end-date').datepicker({});


            var walkins_chart = $(s.target).find('#walkins-chart');
            storeFront_chart = $(s.target).find('#storeFront-chart');
            engagement_chart = $(s.target).find('#engagement-chart');
            dwell_chart = $(s.target).find('#dwell-chart');
            repeatCustomers_chart = $(s.target).find('#repeatCustomers-chart');
            topCustomers_chart = $(s.target).find('#topCustomers-chart');

            categoriesArr = ['Your Store', 'This Mall/Area', 'Stores(same city tier)', 'Stores(All)']

            var chartObj = {
                labelName: 'Walk-ins',
                chartbaseMargin: 20,
                containerName: walkins_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#00b0f0']
            }

            var chartObj1 = {
                labelName: 'Storefront conversion',
                chartbaseMargin: 5,
                containerName: storeFront_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [17, 341, 211, 343]
                }],
                colors: ['#f7d348']
            }

            var chartObj2 = {
                labelName: 'Engagement levels',
                chartbaseMargin: 5,
                containerName: engagement_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [99, 77, 665, 63]
                }],
                colors: ['#92d050']
            }

            var chartObj3 = {
                labelName: 'Dwell time',
                chartbaseMargin: 20,
                containerName: dwell_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#0070c0']
            }

            var chartObj4 = {
                labelName: 'Repeat customers',
                chartbaseMargin: 5,
                containerName: repeatCustomers_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#ff6d60']
            }

            var chartObj5 = {
                labelName: 'Top customers',
                chartbaseMargin: 5,
                containerName: topCustomers_chart,
                dataArr: [{
                    name: 'Last Month',
                    data: [107, 31, 635, 203]
                }],
                colors: ['#7030a0']
            }


            app['internal-benchmarking'].renderChart(chartObj), categoriesArr;
            app['internal-benchmarking'].renderChart(chartObj1, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj2, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj3, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj4, categoriesArr);
            app['internal-benchmarking'].renderChart(chartObj5, categoriesArr);


        },
        renderChart: function(chartObj) {
            var chartContainer = chartObj.containerName;

            chartContainer.highcharts({
                chart: {
                    type: 'bar',
                    style: {
                        fontFamily: 'Arial',
                        fontSize: '12px'
                    }
                },
                colors: chartObj.colors,
                title: {
                    text: chartObj.labelName,
                    // floating: true,
                    align: 'left',
                    x: 0,
                    y: 10,
                    margin: chartObj.chartbaseMargin
                },
                xAxis: {
                    categories: categoriesArr,
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                yAxis: {
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    gridLineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: '',
                    },
                    minorTickLength: 0,
                    tickLength: 0
                },
                tooltip: {
                    valueSuffix: ' millions'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                series: chartObj.dataArr
            });
        }
    }
})(app);

//####js/component/campaign-impact.js
(function() {
    app['campaign-impact'] = {
        settings: {
            target: '.mod-campaign-impact'
        },
        init: function(context) {
            var s = this.settings;
            var target = $(s.target);
            var edit_btn = target.find('.edit-btn');
            var configure_panel = target.find('.impact-edit');
            var panel_btn = target.find('.config-save, .config-cancel');

            edit_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            panel_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            })

            $('.campaign-start-date').datepicker({});
            $('.campaign-end-date').datepicker({});


        }
    }
})(app);


// bindTemplate: function(data, template) {
//     var response = $.parseJSON(data);

//     $('.section-opportunity').html(template({
//         'tile-name': 'Data count',
//         'tile-percent': response.length,
//         'tile-percent-change': '',
//         'tile-period-param': 'Count of rows'
//     }));
// }
//####js/component/storefront-impact.js
(function() {
    app['modification-impact'] = {
        settings: {
            target: '.mod-modification-impact'
        },
        init: function(context) {
            var s = this.settings;
            var target = $(s.target);
            var edit_btn = target.find('.edit-btn');
            var configure_panel = target.find('.impact-edit');
            var panel_btn = target.find('.config-save, .config-cancel');

            edit_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            });

            panel_btn.on('click', function() {
                configure_panel.toggleClass('edit-active');
            })


            $('.storefront-start-date').datepicker({});
            

        }
    }
})(app);
