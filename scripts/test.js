$(document).ready(function() {
    $.getJSON('https://data.cityofchicago.org/resource/cwig-ma7x.json', function(data, success) {
        console.log('started')
        console.log(success)
        var x = {}
        data.forEach(function(d) {
            if(d['violations']) {
                if(x[d['inspection_type']]) {
                    x[d['inspection_type']]['numViolations']++;
                    x[d['inspection_type']]['numOccurences']++;
                }
                else {
                    x[d['inspection_type']] = {'numViolations' : 1}
                    x[d['inspection_type']] = {'numOccurences' : 1}
                }
            }
            else {
                if(x[d['inspection_type']]) {
                    x[d['inspection_type']]['numOccurences']++;
                }
                else {
                    x[d['inspection_type']] = {'numOccurences' : 1, 'numViolations' : 0}
                }
            }
        })
        var out = {}
        for(var violation in x) {
            if(!isNaN(x[violation]['numViolations'] / x[violation]['numOccurences']))
                out[violation] = x[violation]['numViolations'] / x[violation]['numOccurences']
        }
        console.log(out)
    })
})