var dashboardui = {

}


dashboardui.renderEventProcess = function() {
    // table_element = document.getElementById("listtable")
    // table_tbody_element = document.getElementById("listtable_tbody") 

    // get_post_list(1,'',table_tbody_element,true) 
    // next_prev_event();
}



dashboardui.skeletonMake = function() {
    var dashboard_area = document.createElement("div")
    dashboard_area.id = "dashboard-area"

    container.innerHTML += `${dashboard_area.outerHTML}` 
}

dashboardui.init = function() {
    console.log('dashboard-ui')
}


dashboardui.render = function() {
    dashboardui.skeletonMake();
    main.innerHtmlRender("./render/dashboard.html", "list-area", dashboardui.renderEventProcess)
    main.innerHtmlRender("./render/detail.html", "detail-area")
}

dashboardui.destory = function() {
    // var list_area = document.getElementById("list-area")
    // var detail_area = document.getElementById("detail-area")
    
    // list_area.remove()
    // detail_area.remove()
    router.destory = undefined
}

dashboardui.init();
