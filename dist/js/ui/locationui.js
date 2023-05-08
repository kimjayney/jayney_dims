var locationui = {

}

var map;
var datepicker_from;
var datepicker_to ; 


locationui.datepicker = function(obj) {
    $( obj ).datepicker().datepicker("show");
}

locationui.renderEventProcess = function() {
    var tooltip_render = `<input type="text" onclick="javascript:locationui.datepicker(this); datepicker_from= this" class='datepicker_from'>
    <input onclick="javascript:locationui.datepicker(this); datepicker_to = this" type="text" class='datepicker_to'>
    <button class="btn btn-primary" type="submit">적용</button>`
    console.log("RenderEventProcess()")
    locationui.initmap()
    
    $("#filter_toggle").attr("data-content", tooltip_render)
    $("#filter_toggle").popover({
        title: "날짜 선택",
        html:true,
        sanitize: false,
    });
    $("#filter_toggle [data-toggle=popover]").on('shown.bs.popover', function () {
        $(".datepicker_from").datepicker()
        $(".datepicker_to").datepicker()
    });
    locationui.retriveValue()
    
}


locationui.realtime = function(start_date="default"){
    // 실시간으로 위치를 받아와야 하며
    // 시작날짜가 없으면 default로 설정되며 오늘 날짜 기준으로 설정된다. 
    // 시작날짜가 있으면 시작날짜부터 지금 라이브 기준으로 위치 값을 가져오고,
    // 시작 날짜의 제일 첫번째가 첫 마커 지점이 되고,
    // while로 실시간 위치값을 
    //
}

locationui.directionRender = function(location, start_date, end_date) {  // using filter (시작-끝 날짜 기준이 반드시 있어야함)
 
    // 처음 지점과 끝지점만 마커를 찍어준다.
    // 처음 지점과 끝 지점의 선을 그린다.
}


locationui.skeletonMake = function() {
    console.log('SkeletonMake')
    var dashboard_area = document.createElement("div")
    dashboard_area.id = "location-area"
    container.innerHTML = `${dashboard_area.outerHTML}` 
    
}
function addMarkers(data, password) {
    
    // var map = new google.maps.Map(document.getElementById("map"), {
    //   zoom: 13,
    //   center: { lat: data[0].lat, lng: data[0].lng },
    // });

    for (var i = 0; i < data.length; i++) {
      var iv = data[i].IV
      var lat = Number(locationui.decrypt(data[i].lat, iv, password))
      var lng = Number(locationui.decrypt(data[i].lng, iv, password))
      console.log(iv, lat, lng, data[i].lat)
      var marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: data[i].created_at,
      });
    }
  }
window.initMap = function() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 35.845247 , lng: 125.1234685 },  
        zoom: 6
    });
};

locationui.initmap = function() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyD8SEKBpDIuPr_ut0eNjiQ_f7lNxSgJsLo&callback=initMap';
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}

locationui.decrypt = function(cipherText, iv, password) {
    var key = CryptoJS.enc.Utf8.parse(password);     // Use Utf8-Encoder. 
    var iv  = CryptoJS.enc.Utf8.parse(iv);                     // Use Utf8-Encoder
    var encryptedCP = cipherText
    var decryptedWA = CryptoJS.AES.decrypt(encryptedCP, key, { iv: iv});
    return decryptedWA.toString(CryptoJS.enc.Utf8); 
}
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) {
        return parts.pop().split(";").shift();
    }
}

function setCookie(name, value, expireDate) {
  var cookieString = name + "=" + value + ";";
  if (expireDate) {
    cookieString += "expires=" + expireDate.toUTCString() + ";";
  }
  document.cookie = cookieString;
}
locationui.drawLocations = async function(device, interval,password) {
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 14); // 14일 후
    setCookie("deviceId", device, expireDate);
    setCookie("devicePw", password, expireDate);
    var xmlhttp = new XMLHttpRequest();
    var url = `https://locationbackend.rainclab.workers.dev/api/view?device=${device}&timeInterval=${interval}`;
    xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        var data = JSON.parse(this.responseText);
        addMarkers(data, password);
        debugmessage.innerHTML = this.responseText
    }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();   
}
locationui.retriveValue = function() {
    const deviceId =getCookie("deviceId")
    const devicePw = getCookie("devicePw")
    
    document.getElementById("device").value  = deviceId
    document.getElementById("password").value  = devicePw  
}
locationui.init = function() {
    console.log('dashboard-ui init')
    locationui.skeletonMake()
    locationui.render()
    locationui.timeline() 
    locationui.cookiesetting() 
}

locationui.timeline = function() {
    
}

locationui.render = function() {
    console.log("Render()")
    main.innerHtmlRender("./render/locationui.html", "location-area", locationui.renderEventProcess) 
    
}

locationui.destory = function() {
    $("#filter_toggle").popover('hide')
    var myrender = document.getElementById("location-area")
    myrender.remove()
    router.destory = undefined
}
locationui.cookiesetting = function() { 
    document.cookie = "key=value; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
}

locationui.init();
router.destory = locationui.destory