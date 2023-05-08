
function resize(obj) {
    obj.style.height = "1px";
    obj.style.height = (12+obj.scrollHeight)+"px";
}
var current_page = 1;
var max_page = 0;

var table_element; 
var table_tbody_element;

var indexui = {

}

function get_post_list(page=1, query='', element, redraw=false) {
    $.get(`http://192.168.0.12:6177/post/list/${page}?query=${query}`, function(res) { 
        max_page = res.total_page;
        let data = res.data
        var html_render = '' 
        $("#current-page").html(`${current_page}/${max_page}`)
        data.forEach(function(item) {
            html_render += `
                <tr role="row" class="odd">
                    <td class="sorting_1">${item[0]}</td>
                    <td>${item[1]}</td>
                    <td>${item[2]}</td>
                </tr>
                `;
        }); 
        if (redraw) {
            element.innerHTML = html_render
        } else {
            element.innerHTML += html_render
        }
        window.document.removeEventListener("click",clickDetail)
        table_list_event();
    })
}
function next_prev_event() {
    var prev_btn = document.getElementById("prev_controller")
    var next_btn = document.getElementById("next_controller")
    var refresh = document.getElementById("refresh")
    
    prev_btn.addEventListener("click", function() { 
        if (current_page > 1) {
            current_page -= 1 
        } 
        get_post_list(page=current_page, query='', table_tbody_element, redraw=true)
    })
    next_btn.addEventListener("click", function() {
        if (current_page <= max_page) {
            current_page += 1 
        } 
        get_post_list(page=current_page, query='', table_tbody_element, redraw=true)
    })
    refresh.addEventListener("click",function() {
        get_post_list(1,'',table_tbody_element,true)
    })   
}

function tableResponseDetailProcess(res) {
    let author = res.detail[0].author
    let detail = res.detail[0].detail
    let created_date = res.detail[0].created_date;
    let element = document.getElementById("resText")
    let detail_element = document.getElementById("detail_info")
    let media_list = []
    let data_type = res.detail[0].data_type;
    
    if (res.detail[0].media_list == null || res.detail[0].media_list == "") {
        $(".detail-medialist").html("No Image available")
    } else { 
        $(".detail-medialist").html("")
        media_list = res.detail[0].media_list.split(',')
        
        media_list.forEach(item => { 
            var extension = item.split(".")[1]
            if (extension == "mp4" || extension == "webm")  {
                $(".detail-medialist").append(`<video controls="" muted="" loop="" src="${CDN_URL + item}"/>`)
            } else {
                $(".detail-medialist").append(`<img src="${CDN_URL + item}"/>`)
            }
            
        }); 
    }
    
    detail_element.innerHTML = `<p>Source : ${author}</p>
                                <p>created_date : ${created_date}</p>
    `
    element.innerHTML = detail
    resize(element)
    $("#detail_overlay").attr("style","display:none")
    
}

function clickDetail() {
    var id = $(this)[0].cells[0].innerHTML
    $.get("http://192.168.0.12:6177/api/v1/post/detail?id=" + id, tableResponseDetailProcess);
}

function table_list_event() {
    // table list event
    var list = document.getElementById("listtable").getElementsByTagName("tr")
    list.forEach(function(e) {
        e.removeEventListener("click",clickDetail)
        e.addEventListener("click", clickDetail)
    })
}

function renderEventProcess() {
    table_element = document.getElementById("listtable")
    table_tbody_element = document.getElementById("listtable_tbody") 

    get_post_list(1,'',table_tbody_element,true) 
    next_prev_event();
}



indexui.skeletonMake = function() {
    var list_area = document.createElement("div")
    list_area.id = "list-area"
    var detail_area = document.createElement("div")
    detail_area.id = "detail-area"

    container.innerHTML += `${list_area.outerHTML}${detail_area.outerHTML}`  
    
}

indexui.destory = function() {
    var list_area = document.getElementById("list-area")
    var detail_area = document.getElementById("detail-area")
    
    list_area.remove()
    detail_area.remove()
    router.destory = undefined
}

indexui.render = function() {
    indexui.skeletonMake();
    main.innerHtmlRender("./render/list.html", "list-area", renderEventProcess)
    main.innerHtmlRender("./render/detail.html", "detail-area")
}

indexui.init = function()  {
    indexui.render();
}

indexui.init();
router.destory = indexui.destory
