$(document).ready(function() {
    
    $('#upload').click(function() {
        $('#upload').css({'background':'#499E34', 'border-bottom':'1px white'})
        $('#upload #tri').css('visibility', 'visible')
        $('#upload p').css('color','white')
        
        $('#purchase').css({'background':'white', 'border-bottom':'1px solid #D6D6D6'})
        $('#purchase #tri').css('visibility', 'hidden')
        $('#purchase p').css('color','black')
        
        $('.mydata').css('display','block')
        $('.store').css('display','none')
    })
    
    $('#purchase').click(function() {
        $('#purchase').css({'background':'#499E34', 'border-bottom':'1px white'})
        $('#purchase #tri').css('visibility', 'visible')
        $('#purchase p').css('color','white')
        
        $('#upload').css({'background':'white', 'border-bottom':'1px solid #D6D6D6'})
        $('#upload #tri').css('visibility', 'hidden')
        $('#upload p').css('color','black')
        
        $('.mydata').css('display','none')
        $('.store').css('display','block')
    })
    
    $('#user').click(function() {
        console.log($('#dropdown').css('visibility'))
        if($('#dropdown').css('visibility') == 'hidden') {
            $('#dropdown').css({'visibility':'visible', 'top': '60px'})
        }
        else if($('#dropdown').css('visibility') == 'visible') {
            $('#dropdown').css({'visibility':'hidden', 'top': '-500px'})
        }
    })
    
    var inputs = document.querySelectorAll( '.inputFile' );
    Array.prototype.forEach.call( inputs, function( input ) 
    {
    	var label	 = input.nextElementSibling;
    	var labelVal = label.innerHTML;
    
    	input.addEventListener( 'change', function( e )
    	{
    		var fileName = '';
    		if( this.files && this.files.length > 1 )
    			fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
    		else
    			fileName = e.target.value.split( '\\' ).pop();
    
    		if( fileName )
    			label.innerHTML = fileName;
    		else
    			label.innerHTML = labelVal;
    	});
    }); //change "Upload a file" text 
    

})