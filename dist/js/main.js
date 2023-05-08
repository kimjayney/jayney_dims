var main = {

}
main.errorReport = function (err) {
    console.log(err)
}

main.innerHtmlRender = function(location, target, callback=false) {
    $.get(location, function(res) {
        try {
            var element = document.getElementById(target)
            element.innerHTML = res
            callback()
        } catch(err) {
            errorReport(err)
        } finally {
            return true
        }
    })
}

// Load dynamically
main.cssLoader = function(url) {
    var link = document.createElement('link');
    link.rel = "stylesheet"
    link.href= url
    var element = document.getElementById("dynamically_load")
    element.href = url
}

main.jsLoader = function(url) {
    var element = document.getElementById("dynamically_load_js")
    element.setAttribute( 'href', url )
}

main.init = function() {
    var container_menu = document.getElementById("container-menu")
    
    var menu = document.createElement("div")
    menu.id="menu"
    container_menu.innerHTML = `${menu.outerHTML}`

    main.innerHtmlRender("./render/menu.html", "menu", router.init )    
}


main.init();
