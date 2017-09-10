/* REQUIRES 3djobs.js */

var charts_div = document.getElementById('charts');
var form_charts = charts_div.getElementsByTagName('form')[0];
var chart_canvas = charts_div.getElementsByTagName('canvas')[0];
var select_chart = document.getElementById('chart_type');
var users_statistics = document.getElementById('users_statistics');

var chart;

hide(chart_canvas);

const color_matches = {
        rouge: 'red',
        bleu: 'blue',
        blanc: 'white',
        noir: 'black',
        gris: 'gray',
        vert: 'green',
        rose: 'pink',
        jaune: 'yellow',
        orange: 'orange',
};

form_charts.addEventListener('submit', function(e) {
    e.preventDefault();

    var charts = {
        users_statistics: {
            type: 'bar',
            data: {
                datasets: [],
                labels: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Users statistics',
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItems, data) {
                            var unit = data.datasets[tooltipItems.datasetIndex].unit;
                            return data.datasets[tooltipItems.datasetIndex].label +': ' + tooltipItems.yLabel + unit;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                },
                scales: {
                    yAxes: [{
                        id: 'y-prices',
                        ticks: {
                            beginAtZero: true
                        },
                        type: 'linear',
                        scaleLabel: {
                            display: true,
                            labelString: 'Prices (€)'
                        },
                        gridLines: {
                            display: true,
                        },
                        stacked: true
                    }, {
                        id: 'y-weights',
                        ticks: {
                            beginAtZero: true
                        },
                        position: 'right',
                        type: 'linear',
                        scaleLabel: {
                            display: true,
                            labelString: 'Weights (g)'
                        },
                        gridLines: {
                            display: false,
                        }
                    }]
                },
            },
        },

        monthly_usage_evolution: {

        },
    };

    if(chart) {
        chart.destroy();
    }

    hide(chart_canvas);

    if(select_chart.value == 'users_statistics') {
        var m_from = users_statistics.getElementsByTagName('select')[0].value;
        var d_from = users_statistics.getElementsByTagName('select')[1].value;
        var y_from = users_statistics.getElementsByTagName('select')[2].value;

        var m_to = users_statistics.getElementsByTagName('select')[3].value;
        var d_to = users_statistics.getElementsByTagName('select')[4].value;
        var y_to = users_statistics.getElementsByTagName('select')[5].value;

        req.open('POST', '/users_statistics', true);
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        var params = 'm_from=' + encodeURIComponent(m_from) + '&d_from=' + encodeURIComponent(d_from) + '&y_from=' + encodeURIComponent(y_from) + '&m_to=' + encodeURIComponent(m_to) + '&d_to=' + encodeURIComponent(d_to) + '&y_to=' + encodeURIComponent(y_to);

        req.onreadystatechange = function() {
            if(req.readyState == 4) {
                if(req.status == 200) { // If OK, server returns a JSON object containing the statistics
                    var response = JSON.parse(req.responseText);

                    var chart_configuration = charts.users_statistics;

                    // To be able to link user ID with its index in data[] and labels[]
                    var userid_to_i = {};
                    var user_count = 0;

                    var spoolid_to_i = {};
                    var spool_count = 0; // Incremented by 2 : first index is for price, second index is for weight

                    for(var i = 0; i < response.length; i++) {
                        if(spoolid_to_i[response[i].spool_id] === undefined) { // Spool has not been added to dataset yet
                            spoolid_to_i[response[i].spool_id] = spool_count;

                            var hue;
                            var spool_description = response[i].spool_description;

                            for(var french_color in color_matches) {
                                // We set a hue corresponding to the color found in PLA description (whether it's a French or an English color)
                                if(spool_description.toLowerCase().includes(french_color) || spool_description.toLowerCase().includes(color_matches[french_color])) {
                                    hue = color_matches[french_color];
                                }
                            }

                            var bg_color_price;
                            switch(hue) {
                                case 'white':
                                    bg_color_price = 'rgba(255, 255, 255, 0.7)';
                                    break;
                                case 'gray':
                                    bg_color_price = 'rgba(120, 120, 120, 0.7)';
                                    break;
                                case 'black':
                                    bg_color_price = 'rgba(30, 30, 30, 0.7)';
                                    break;
                                default:
                                    bg_color_price = randomColor({
                                        luminosity: 'light',
                                        format: 'rgba',
                                        alpha: 0.7,
                                        hue: hue,
                                    });
                            }

                            var bg_color_weight = 'rgba(240, 240, 240, 0.7)';
                            var border_color = tinycolor(bg_color_price).darken(20).toString();

                            // Price
                            chart_configuration.data.datasets[spool_count] = {
                                label: 'Total estimated price for ' + spool_description,
                                backgroundColor: bg_color_price,
                                borderColor: border_color,
                                borderWidth: '1',
                                yAxisID: 'y-prices',
                                stack: 'prices_spool_' + response[i].spool_id,
                                unit: '€',
                                data: [],
                            };

                            spool_count++;

                            // Weight
                            chart_configuration.data.datasets[spool_count] = {
                                label: 'Total weight for ' + spool_description,
                                backgroundColor: bg_color_weight,
                                borderColor: border_color,
                                borderWidth: '1',
                                yAxisID: 'y-weights',
                                stack: 'weights_spool_' + response[i].spool_id,
                                unit: 'g',
                                data: [],
                            };

                            spool_count++;

                            console.log('Added spool #'+response[i].spool_id+' to chart dataset.');
                        }

                        if(userid_to_i[response[i].user_id] === undefined) { // If we see an user for the first time, we attribute an index to him
                            userid_to_i[response[i].user_id] = user_count;
                            chart_configuration.data.labels[user_count] = response[i].first_name + ' ' + response[i].last_name.toUpperCase();
                            user_count++;

                            console.log('Added user #'+response[i].user_id+' to chart labels.');
                        }

                        // And now, we add user data to spool dataset
                        chart_configuration.data.datasets[spoolid_to_i[response[i].spool_id]].data[userid_to_i[response[i].user_id]] = response[i].estimated_total_price / 100; // Remember : first spool index is for price
                        chart_configuration.data.datasets[spoolid_to_i[response[i].spool_id] + 1].data[userid_to_i[response[i].user_id]] = response[i].total_weight; // Remember : 2nd spool index is for weight
                    }

                    var from_date = new Date(y_from, m_from, d_from).toDateString();
                    var to_date = new Date(y_to, m_to, d_to).toDateString();
                    chart_configuration.options.title.text = 'Users statistics from ' + from_date + ' to ' + to_date;

                    show(chart_canvas);
                    chart = new Chart(chart_canvas, chart_configuration);
                } else if(req.status == 400) { // There were errors
                    var errors = JSON.parse(req.responseText).errors;
                    for(var i = 0; i < errors.length; i++) {
                        addMessageCharts('error', errors[i]);
                    }
                } else {
                    console.warn('POST /users_statistics : the server responded with an error ' + req.status);
                }
            }
        };

        req.send(params);
    }
});
