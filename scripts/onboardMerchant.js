$(document).ready(function() {
    Stripe.setPublishableKey('pk_test_jAVS48PvngBx113XHJVMqlyK');
    
    Stripe.card.createToken({
        number: '4242424242424242',
        cvc: '358',
        exp_month: '02',
        exp_year: '2019'
    }, function(err, response) {
        console.log(response)
        $('#creditCard').val(response.id)
    });
    
})