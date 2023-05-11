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


function getParam(paramName) {
    // URI에서 Fragment 식별자 이후의 값을 추출합니다.
    var uri = window.location.hash.substring(1);
  
    // 추출한 값을 & 문자를 기준으로 나눕니다.
    var params = uri.split('&');
  
    // 파라미터를 저장할 객체를 생성합니다.
    var paramObj = {};
  
    // 각 파라미터의 이름과 값을 객체에 저장합니다.
    for (var i = 0; i < params.length; i++) {
      var param = params[i].split('=');
  
      // 파라미터 이름에서 Fragment 식별자 이전의 값을 추출합니다.
      var paramName = param[0].split('?')[1];
  
      // 객체에 파라미터 이름과 값을 저장합니다.
      paramObj[paramName] = param[1];
    }
  
    // 주어진 paramName에 해당하는 파라미터 값을 반환합니다.
    return paramObj[paramName];
  }
  
  

  
function updateUrlParameter(param, value, force) {
    const regExp = new RegExp(param + "(.+?)(&|$)", "g");
    const newUrl = window.location.href.replace(regExp, param + "=" + value + "$2");
    var link = document.location.href.split('/');
    var pathname = window.location.pathname // local not working, dev test need
    var search = window.location.search.replace(`lang=ko`,"").replace(`lang=en`,'').replace("?","") 
    window.history.pushState("", "", `${pathname}?lang=${value}${search}`);

}



main.init();
