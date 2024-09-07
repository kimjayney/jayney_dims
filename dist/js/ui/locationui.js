var locationui = {};

var map;
var datepicker_from;
var datepicker_to;
var markers = [];
var globalInterval;

locationui.datepicker = function (obj) {
  $(obj).datepicker().datepicker("show");
};
function customOrder(a, b) {
  // order by id
  return a.id - b.id;
}
locationui.visualize = function (data) {
  var items = new vis.DataSet();
  var container = document.getElementById("visualization");
  var options = {
    order: customOrder,
    editable: true,
    zoomable: false,
    height: "400px",
  };
  container.innerHTML = "";
  var timeline = new vis.Timeline(container, items, options);

  items.clear();
  items.add(data);
  timeline.fit();
};

locationui.parametersetting = function () {
  if (location.hash.split("?").length > 1) {
    locationui.parameterRender();
  } else {
    locationui.cookiesetting();
  }
};
locationui.parameterRender = function () {
  const paramValues = location.hash.split("?")[1].split("&");
  let dateRangeValue = {};
  console.log("parameterRender");
  paramValues.forEach((item) => {
    const paramName = item.split("=")[0];
    const paramValue = item.split("=")[1];
    if (paramName == "deviceId") {
      device.value = paramValue;
    }
    if (paramName == "privateKey") {
      password.value = paramValue;
    }
    if (paramName == "deviceKey") {
      authorization.value = paramValue;
    }
    if (paramName == "live") {
      if (paramValue == "min10") {
        min10.click();
      } else if (paramValue == "hour1") {
        hour1.click();
      } else if (paramValue == "hour3") {
        hour3.click();
      } else if (paramValue == "hour6") {
        hour6.click();
      }
    }
    if (paramName == "startDate") {
      // value
      // 2023-08-20 07:00:00 - 2023-08-22 03:00:00
      dateRangeValue["startDate"] = decodeURI(paramValue);
    }
    if (paramName == "endDate") {
      // value
      // 2023-08-20 07:00:00 - 2023-08-22 03:00:00
      dateRangeValue["endDate"] = decodeURI(paramValue);
    }
  });

  console.log(dateRangeValue);

  // datetimes.value = `${dateRangeValue["startDate"]} - ${dateRangeValue["endDate"]}`
  if (dateRangeValue.hasOwnProperty("startDate")) {
    const dateValue = `${dateRangeValue["startDate"]} - ${dateRangeValue["endDate"]}`;
    locationui.drawLocationsBeforePreprocess(
      device.value,
      password.value,
      authorization.value,
      dateValue
    );
  } else {
  }
};
locationui.realtime = function () {
  globalInterval = setInterval(() => {
    locationui.drawLocations(
      device.value,
      5,
      password.value,
      authorization.value
    );
    console.log("Sync location ");
  }, 5000);
};

locationui.renderEventProcess = function () {
  // Render 후 후처리 해주는곳
  var tooltip_render = `<input type="text" onclick="javascript:locationui.datepicker(this); datepicker_from= this" class='datepicker_from'>
    <input onclick="javascript:locationui.datepicker(this); datepicker_to = this" type="text" class='datepicker_to'>
    <button class="btn btn-primary" type="submit">적용</button>`;
  console.log("RenderEventProcess()");
  locationui.initmap();

  $("#filter_toggle").attr("data-content", tooltip_render);
  $("#filter_toggle").popover({
    title: "날짜 선택",
    html: true,
    sanitize: false,
  });
  $("#filter_toggle [data-toggle=popover]").on("shown.bs.popover", function () {
    $(".datepicker_from").datepicker();
    $(".datepicker_to").datepicker();
  });
  locationui.retriveValue();
  locationui.servicestatus();
  locationui.datetimepicker();
  locationui.parametersetting();
};

locationui.directionRender = function (location, start_date, end_date) {
  // using filter (시작-끝 날짜 기준이 반드시 있어야함)
  // 처음 지점과 끝지점만 마커를 찍어준다.
  // 처음 지점과 끝 지점의 선을 그린다.
};

locationui.skeletonMake = function () {
  console.log("SkeletonMake");
  var dashboard_area = document.createElement("div");
  dashboard_area.id = "location-area";
  container.innerHTML = `${dashboard_area.outerHTML}`;
};
function deleteMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

function manualMarkers(lat, lng) {
  markers.push(
    new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: map,
      title: "",
    })
  );
}

function addMarkers(data, password) {
  var first_lat = Number(locationui.decrypt(data[0].lat, data[0].IV, password));
  var first_lng = Number(locationui.decrypt(data[0].lng, data[0].IV, password));
  console.log(first_lat, first_lng);
  if (first_lat == Number(0) || first_lng == Number(0)) {
    alert(
      "(password) 개인 키 오류입니다. 핸드폰에서 패스워드가 일치하는지 확인해 주세요. (32자리)"
    );
    loading.style = "display: none";
    return;
  }

  map.setCenter({ lat: first_lat, lng: first_lng }); // 예시 좌표
  map.setZoom(17); // 예시 줌 레벨
  var visualizeData = [];
  var same_created_at = [];

  for (var i = 0; i < data.length; i++) {
    var iv = data[i].IV;
    var lat = Number(locationui.decrypt(data[i].lat, iv, password));
    var lng = Number(locationui.decrypt(data[i].lng, iv, password));
    var timeSliced = data[i].created_at.slice(0, 16);
    //   console.log(timeSliced)
    if (same_created_at.includes(timeSliced)) {
      // console.log(`Skip ${data[i].created_at}`)
    } else {
      // km수가 1km좀 더 된다 하면 제외하는 코드 필요 lat lng 기반으로
      visualizeData.push({
        id: String(i),
        content: `${lat}, ${lng}`,
        start: data[i].created_at,
      });
      markers.push(
        new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: map,
          title: data[i].created_at,
        })
      );
    }
    same_created_at.push(timeSliced);
  }
  console.log(visualizeData);
  locationui.visualize(visualizeData);
  loading.style = "display: none";
}
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.845247, lng: 125.1234685 },
    zoom: 6,
  });
};

locationui.initmap = function () {
  var script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyD8SEKBpDIuPr_ut0eNjiQ_f7lNxSgJsLo&callback=initMap";
  script.defer = true;
  script.async = true;
  document.head.appendChild(script);
};

locationui.decrypt = function (cipherText, iv, password) {
  var key = CryptoJS.enc.Utf8.parse(password); // Use Utf8-Encoder.
  var iv = CryptoJS.enc.Utf8.parse(iv); // Use Utf8-Encoder
  var encryptedCP = cipherText;
  var decryptedWA = CryptoJS.AES.decrypt(encryptedCP, key, { iv: iv });
  return decryptedWA.toString(CryptoJS.enc.Utf8);
};
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

locationui.servicestatus = function () {
  servicestatus.style = "display: list-item";
  fetch("https://jayneycoffee.api.location.rainclab.net/api/healthcheck")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success == true) {
        servicestatus.innerHTML = `Service: Active, message: ${data.message_ko_KR}`;
      }
      if (data.success == true && data.status == true) {
        servicestatus.innerHTML = `Service: Active, Location DB: Active, message: ${data.message_ko_KR}`;
      }
    })
    .catch((error) => console.error(error));
};
locationui.drawLocationsBeforePreprocess = function (
  device,
  password,
  authorization,
  dateInfo
) {
  var dateObject = {
    startDate: dateInfo.split(" - ")[0],
    endDate: dateInfo.split(" - ")[1],
  };

  rangeText.innerHTML = `현재 보이고 있는 시간기준(I TIME, Asia/Seoul): ${dateObject.startDate} ~ ${dateObject.endDate}`;
  // Set the start date and time
  var startDate = moment(dateObject.startDate);
  var endDate = moment(dateObject.endDate);
  $(function () {
    var daterangepicker = $("#datetimes").data("daterangepicker");
    // Set the daterangepicker's start and end dates
    daterangepicker.setStartDate(startDate);
    daterangepicker.setEndDate(endDate);
  });

  locationui.drawLocations(device, dateObject, password, authorization);
};
locationui.drawLocations = async function (
  device,
  date,
  password,
  authorization
) {
  loading.style = "display: inline-block";
  deleteMarkers();
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 14); // 14일 후
  setCookie("deviceId", device, expireDate);
  setCookie("devicePw", password, expireDate);
  setCookie("deviceAuth", authorization, expireDate);
  var xmlhttp = new XMLHttpRequest();

  var url;
  if (typeof date == "object") {
    console.log(date.startDate);
    url = `https://jayneycoffee.api.location.rainclab.net/api/view?device=${device}&startDate=${date.startDate}&endDate=${date.endDate}&authorization=${authorization}`;
    document.getElementById("datetimes").setAttribute("fromurl", "true");
  } else {
    rangeText.innerHTML = `${date}분 전 위치 기준`;
    url = `https://jayneycoffee.api.location.rainclab.net/api/view?device=${device}&timeInterval=${date}&authorization=${authorization}`;
  }
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(this.responseText);
      if (data.status == true) {
        if (data.data.length > 0) {
          if (data.status == true) {
            addMarkers(data.data, password);
            debugmessage.innerHTML = this.responseText;
          } else {
            alert(data.message_ko_KR);
            loading.style = "display: none";
          }
        } else {
          loading.style = "display: none";
          alert("위치정보가 수집되지 않았어요. 수집기를 켜시면 수집됩니다.");
        }
      } else {
        alert(data.message_ko_KR);
      }
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
  if (!date === 5) {
    clearInterval(globalInterval);
    console.log("ClearInterval");
  }
};
locationui.retriveValue = function () {
  const deviceId = getCookie("deviceId");
  const devicePw = getCookie("devicePw");
  const authorization = getCookie("deviceAuth");

  document.getElementById("device").value = deviceId;
  document.getElementById("password").value = devicePw;
  document.getElementById("authorization").value = authorization;
};

locationui.datetimepicker = function () {
  $(function () {
    $('input[name="datetimes"]')
      .daterangepicker({
        timePicker: true,
        startDate: moment().startOf("hour"),
        endDate: moment().startOf("hour").add(32, "hour"),
        locale: {
          format: "Y-MM-DD HH:mm:ss",
        },
      })
      .on("apply.daterangepicker", function (e) {
        locationui.drawLocationsBeforePreprocess(
          device.value,
          password.value,
          authorization.value,
          this.value
        );
      });
  });
};
locationui.share = function () {
  let dateValue = "";
  if (document.getElementById("datetimes").getAttribute("fromurl") == "true") {
    var daterangepicker = $("#datetimes").data("daterangepicker");

    // Get the start date
    var startDate = daterangepicker.startDate.format("YYYY-MM-DD HH:mm:ss");
    var endDate = daterangepicker.endDate.format("YYYY-MM-DD HH:mm:ss");
    dateValue = `&startDate=${encodeURI(startDate)}&endDate=${encodeURI(
      endDate
    )}`;
  }
  const parameter = `deviceId=${encodeURI(device.value)}&deviceKey=${
    authorization.value
  }&privateKey=${password.value}${dateValue}`;
  const URL = `https://jayneycoffee.location.rainclab.net/#locationui?${parameter}`;
  window.navigator.clipboard.writeText(URL).then(() => {
    // 복사가 완료되면 이 부분이 호출된다.
    alert("복사 완료!");
  });
};
locationui.render = function () {
  console.log("Render()");
  main.innerHtmlRender(
    "./render/locationui.html",
    "location-area",
    locationui.renderEventProcess
  );
};

locationui.destory = function () {
  $("#filter_toggle").popover("hide");
  var myrender = document.getElementById("location-area");
  myrender.remove();
  router.destory = undefined;
};
locationui.cookiesetting = function () {
  document.cookie = "key=value; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
};

locationui.init = function () {
  console.log("dashboard-ui init");
  locationui.skeletonMake();
  locationui.render();
};

locationui.init();
router.destory = locationui.destory;
