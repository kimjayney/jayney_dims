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
// View 추가 수동
router.init = function() {
    console.log("Router initialized") 
    router.add("locationui")
    router.add("intro")
    router.add("mainpage")

    // Check if there's no hash or empty hash
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#mainpage';
        $.loadScript('mainpage.js', function(){
            console.log('[router] mainpage Loaded')
        });
        return;
    }

    var fragment = window.location.hash;
    if (fragment) {
        var route = fragment.split("#")[1].split("?")[0]
        $.loadScript( `${route}.js`  , function(){
            console.log(`[router] ${route} Loaded`)
        });
    }
}

router.destory = undefined