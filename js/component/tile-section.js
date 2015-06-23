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
