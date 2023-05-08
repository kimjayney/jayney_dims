var router = {

}

jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: 'dist/js/ui/' + url,
        dataType: 'script',
        success: callback,
        async: true
    });
}

router.add = function(route) {
    var element = document.getElementById(route)
    element.addEventListener("click", function() {
        if (router.destory == undefined) {

        } else {
            console.log('destory')
            router.destory()
        }
        
        $.loadScript( `${route}.js`  , function(){
            console.log(`[router] ${route} Loaded`)
        });
    })
}

router.init = function() {
    console.log("Router initialized") 
    router.add("locationui")

}

router.destory = undefined