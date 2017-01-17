//Google Analytics

//test
console.log(new Fingerprint().get())

if (window.location.host != 'base-a34ndju.c9users.io') {
    if(new Fingerprint().get() != 2379720647) {
        console.log('sent');
        (function(i,s,o,g,r,a,m){
            i['GoogleAnalyticsObject']=r;
            i[r]=i[r] || function() {
                (i[r].q=i[r].q||[]).push(arguments)}, i[r].l=1*new Date();
                a=s.createElement(o),m=s.getElementsByTagName(o)[0];
                a.async=1;
                a.src=g;
                m.parentNode.insertBefore(a,m)
            }
        )
        (window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        
        ga('create', 'UA-77388290-1', 'auto');
        ga('require', 'ec');
        ga('send', 'pageview');
    }
    else
        console.log('not sent');
}
else
    console.log('not sent');
    
