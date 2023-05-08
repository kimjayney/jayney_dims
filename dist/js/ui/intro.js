var intro = {

}


intro.renderEventProcess = function() {
    // table_element = document.getElementById("listtable")
    // table_tbody_element = document.getElementById("listtable_tbody") 

    // get_post_list(1,'',table_tbody_element,true) 
    // next_prev_event();
}



intro.skeletonMake = function() {
    console.log('SkeletonMake')
    var intro = document.createElement("div")
    intro.id = "intro-area"
    container.innerHTML += `${intro.outerHTML}`  
}

intro.init = function() {
    console.log('intro-ui')
    intro.skeletonMake()
    intro.render()
    servicestatus.style="display:none"
}


intro.render = function() {
    intro.skeletonMake();
    main.innerHtmlRender("./render/dashboard.html", "list-area", intro.renderEventProcess)
    main.innerHtmlRender("./render/detail.html", "detail-area")
    main.innerHtmlRender("./render/intro.html", "intro-area", intro.renderEventProcess) 
    
}

intro.destory = function() {
    // var list_area = document.getElementById("list-area")
    // var detail_area = document.getElementById("detail-area")
    
    // list_area.remove()
    // detail_area.remove()
    router.destory = undefined
}

intro.init();
