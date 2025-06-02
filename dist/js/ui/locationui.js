var locationui = {};

var datepicker_from;
var datepicker_to;
var markers = [];
var markerClusterGroup;
var globalInterval;

locationui.datepicker = function (obj) {
  $(obj).datepicker().datepicker("show");
};
function customOrder(a, b) {
  // order by id
  return a.id - b.id;
}
locationui.visualize = function (data) {
  // var items = new vis.DataSet();
  // var container = document.getElementById("visualization");
  // var options = {
  //   order: customOrder,
  //   editable: true,
  //   zoomable: false,
  //   height: "400px",
  // };
  // container.innerHTML = "";
  // var timeline = new vis.Timeline(container, items, options);

  // items.clear();
  // items.add(data);
  // timeline.fit();
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
  let timezoneValue;
  
  // timezone 값을 먼저 처리
  paramValues.forEach((item) => {
    const [paramName, paramValue] = item.split("=");
    if (paramName === "timezone") {
      timezoneValue = paramValue;
      timezone.value = paramValue;
    }
  });

  // 나머지 파라미터 처리
  paramValues.forEach((item) => {
    const [paramName, paramValue] = item.split("=");
    if (paramName === "deviceId") {
      device.value = paramValue;
    }
    if (paramName === "privateKey") {
      password.value = paramValue;
    }
    if (paramName === "deviceKey") {
      authorization.value = paramValue;
    }
    if (paramName === "live") {
      if (paramValue === "min10") {
        min10.click();
      } else if (paramValue === "hour1") {
        hour1.click();
      } else if (paramValue === "hour3") {
        hour3.click();
      } else if (paramValue === "hour6") {
        hour6.click();
      }
    }
    if (paramName === "startDate") {
      dateRangeValue["startDate"] = decodeURI(paramValue);
    }
    if (paramName === "endDate") {
      dateRangeValue["endDate"] = decodeURI(paramValue);
    }
  });

  // timezone이 설정된 후에 drawLocationsBeforePreprocess 호출
  if (dateRangeValue.hasOwnProperty("startDate")) {
    // timezone이 완전히 설정될 때까지 잠시 대기
    setTimeout(() => {
      const dateValue = `${dateRangeValue["startDate"]} - ${dateRangeValue["endDate"]}`;
      locationui.drawLocationsBeforePreprocess(
        device.value,
        password.value,
        authorization.value,
        dateValue
      );
    }, 100);
  }
};
locationui.timezonesetting = function () {
  const timezones = [
    { label: "UTC-12:00", value: -12 },
    { label: "UTC-11:00", value: -11 },
    { label: "UTC-10:00", value: -10 },
    { label: "UTC-09:00", value: -9 },
    { label: "UTC-08:00", value: -8 },
    { label: "UTC-07:00", value: -7 },
    { label: "UTC-06:00", value: -6 },
    { label: "UTC-05:00", value: -5 },
    { label: "UTC-04:00", value: -4 }, // 워싱턴 D.C.
    { label: "UTC-03:00", value: -3 },
    { label: "UTC-02:00", value: -2 },
    { label: "UTC-01:00", value: -1 },
    { label: "UTC±00:00", value: 0 }, // UTC 기준
    { label: "UTC+01:00", value: 1 },
    { label: "UTC+02:00", value: 2 },
    { label: "UTC+03:00", value: 3 },
    { label: "UTC+04:00", value: 4 },
    { label: "UTC+05:00", value: 5 },
    { label: "UTC+06:00", value: 6 },
    { label: "UTC+07:00", value: 7 },
    { label: "UTC+08:00", value: 8 },
    { label: "UTC+09:00", value: 9 }, // 한국 표준시 (KST)
    { label: "UTC+10:00", value: 10 },
    { label: "UTC+11:00", value: 11 },
    { label: "UTC+12:00", value: 12 },
    { label: "UTC+13:00", value: 13 },
    { label: "UTC+14:00", value: 14 },
  ];

  // select 박스에 옵션 추가
  const timezoneSelect = document.getElementById("timezone");

  timezones.forEach((timezone) => {
    const option = document.createElement("option");
    option.value = timezone.value;
    option.textContent = timezone.label;
    timezoneSelect.appendChild(option);
  });

  // 선택한 타임존의 값 가져오기
  timezoneSelect.addEventListener("change", (event) => {
    const selectedTimezone = event.target.value;
    console.log("Selected Timezone UTC offset:", selectedTimezone);
  });
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

  let lastDecryptedData = null; // 마지막으로 복호화된 데이터 저장

  // Decrypt 버튼 이벤트 핸들러 추가
  document.getElementById('decrypt_btn').addEventListener('click', function() {
    const debugData = document.getElementById('debugmessage').innerText;
    try {
      const jsonData = JSON.parse(debugData);
      if (jsonData.data && Array.isArray(jsonData.data)) {
        const decryptedData = jsonData.data.map(item => {
          const decryptedLat = locationui.decrypt(item.lat, item.IV, password.value);
          const decryptedLng = locationui.decrypt(item.lng, item.IV, password.value);
          const adjustedTime = convertTimeByTimezone(item.created_at, timezone.value);
          return {
            lat: decryptedLat,
            lng: decryptedLng,
            created_at: item.created_at,
            timezone_time: adjustedTime,
            ip_addr: item.ip_addr
          };
        });
        
        lastDecryptedData = decryptedData; // 복호화된 데이터 저장
        
        document.getElementById('debugmessage_decrypt').innerHTML = 
          '<div style="white-space: pre-wrap;">' + 
          JSON.stringify(decryptedData, null, 2) +
          '</div>';
      }
    } catch (error) {
      document.getElementById('debugmessage_decrypt').innerHTML = 
        '<div class="text-danger">Error decrypting data: ' + error.message + '</div>';
    }
  });

  // Excel 내보내기 버튼 이벤트 핸들러 추가
  document.getElementById('export_excel').addEventListener('click', function() {
    if (!lastDecryptedData) {
      alert('Please decrypt the data first.');
      return;
    }

    // CSV 데이터 생성
    const csvContent = [
      // 헤더
      ['Latitude', 'Longitude', 'UTC Time', `Timezone(${timezone.value}) Time`, 'IP Address'].join(','),
      // 데이터 행
      ...lastDecryptedData.map(item => [
        item.lat,
        item.lng,
        item.created_at,
        item.timezone_time,
        item.ip_addr
      ].join(','))
    ].join('\n');

    // CSV 파일 다운로드
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // 현재 시간을 파일명에 포함
    const now = new Date();
    const fileName = `location_data_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

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
  locationui.timezonesetting();
};

locationui.directionRender = function (location, start_date, end_date) {
  // using filter (시작-끝 날짜 기준이 반드시 있어야함)
  // 처음 지점과 끝지점만 마커를 찍어준다.
  // 처음 지점과 끝 지점의 선을 그린다.
};

function convertTimeByTimezone(dateString, timezoneOffset) {
  // 문자열을 Date 객체로 변환 (ISO 포맷으로 변환)
  const utcDate = new Date(dateString.replace(" ", "T") + "Z");

  // UTC 시간에서 타임존 오프셋을 더해 시간을 변환
  const targetTime = new Date(
    utcDate.getTime() + timezoneOffset * 60 * 60 * 1000
  );

  // 변환된 시간을 "YYYY-MM-DD HH:mm:ss" 형식으로 변환
  const adjustedTimeString = targetTime
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  return adjustedTimeString;
}
locationui.skeletonMake = function () {
  console.log("SkeletonMake");
  var dashboard_area = document.createElement("div");
  dashboard_area.id = "location-area";
  container.innerHTML = `${dashboard_area.outerHTML}`;
};
function deleteMarkers() {
  if (markerClusterGroup) {
    markerClusterGroup.clearLayers();
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

  var visualizeData = [];
  var locationPoints = [];
  var same_created_at = [];

  for (var i = 0; i < data.length; i++) {
    var iv = data[i].IV;
    var lat = Number(locationui.decrypt(data[i].lat, iv, password));
    var lng = Number(locationui.decrypt(data[i].lng, iv, password));
    var timeSliced = data[i].created_at.slice(0, 16);
    
    // Get timezone adjusted time
    var adjustedTime = convertTimeByTimezone(data[i].created_at, timezone.value);
    // Extract time in HH:mm:ss format
    var timeOnly = adjustedTime.split(' ')[1];

    if (!same_created_at.includes(timeSliced)) {
      visualizeData.push({
        id: String(i),
        content: `${lat}, ${lng}`,
        start: data[i].created_at,
      });

      let marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style='background-color: white; padding: 3px; border: 1px solid #666; border-radius: 3px;'>${timeOnly}</div>`,
          iconSize: [50, 20],
          iconAnchor: [25, 10]
        })
      });
      
      marker.bindPopup(
        `ZTime: ${data[i].created_at}, TIMEZONE(${
          timezone.value
        }) => ${convertTimeByTimezone(
          data[i].created_at,
          timezone.value
        )}, IPAddr: ${data[i].ip_addr}, Lat: ${lat}, Lng: ${lng}`
      );

      // 마커 클릭 이벤트 추가
      marker.on('click', function(e) {
        // 모든 마커의 z-index를 기본값으로 재설정
        markers.forEach(m => {
          if (m._icon) {
            m._icon.style.zIndex = 100;  // 기본 z-index
          }
        });
        
        // 클릭된 마커의 z-index를 최상위로 설정
        if (this._icon) {
          this._icon.style.zIndex = 1000;  // 높은 z-index
        }
      });

      markerClusterGroup.addLayer(marker);
      markers.push(marker);

      // 화살표를 위한 위치 데이터 저장
      locationPoints.push({
        lat: lat,
        lng: lng,
        timestamp: data[i].created_at
      });
    }
    same_created_at.push(timeSliced);
  }

  // 화살표 그리기
  if (locationPoints.length >= 2) {
    // 기존 화살표 제거
    if (locationui.arrows) {
      locationui.arrows.forEach(arrow => map.removeLayer(arrow));
    }
    locationui.arrows = [];

    // 시간순 정렬
    locationPoints.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 연속된 두 위치 포인트 사이에 화살표 그리기
    for (let i = 0; i < locationPoints.length - 1; i++) {
      const start = locationPoints[i];
      const end = locationPoints[i + 1];
      
      // 라인 그리기
      const polyline = L.polyline([
        [start.lat, start.lng],
        [end.lat, end.lng]
      ], {
        color: 'blue',
        weight: 2
      }).addTo(map);

      // 화살표 데코레이터 추가
      const decorator = L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: '50%',
            repeat: 0,
            symbol: new L.Symbol.ArrowHead({
              pixelSize: 15,
              headAngle: 45,
              pathOptions: {
                color: 'blue',
                fillOpacity: 1,
                weight: 2
              }
            })
          }
        ]
      }).addTo(map);

      locationui.arrows.push(polyline);
      locationui.arrows.push(decorator);
    }
  }

  let targetZoomLevel = 17;
  map.setView([first_lat, first_lng], targetZoomLevel);
  console.log(visualizeData);
  locationui.visualize(visualizeData);
  loading.style = "display: none";
}

locationui.initmap = function () {
  let mapOptions = {
    center: [37.5, 127.6],
    zoom: 10,
    zoomControl: false,
  };
  map = new L.map("map", mapOptions);
  let layer = new L.TileLayer(
    "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  map.addLayer(layer);

  // Initialize marker cluster group
  markerClusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,  // 스파이더 형태 비활성화
    showCoverageOnHover: true,
    zoomToBoundsOnClick: false,  // 클릭 시 줌 동작 비활성화
    disableClusteringAtZoom: 19,  // 매우 가까이 줌인했을 때는 클러스터링 비활성화
    maxClusterRadius: 40  // 클러스터 크기 조절 (기본값: 80)
  });

  // 클러스터 클릭 이벤트 핸들러 추가
  markerClusterGroup.on('clusterclick', function(e) {
    var cluster = e.layer;
    var markers = cluster.getAllChildMarkers();
    var currentZoom = map.getZoom();
    
    // 현재 클러스터의 모든 마커를 제거
    markers.forEach(function(marker) {
      markerClusterGroup.removeLayer(marker);
    });

    // 각 마커를 정확한 위치에 다시 추가
    markers.forEach(function(marker) {
      marker.addTo(map);  // 맵에 직접 추가하여 클러스터링 없이 표시
    });

    // 현재 확장된 클러스터 정보 저장
    if (!map.expandedClusters) {
      map.expandedClusters = [];
    }
    map.expandedClusters.push({
      zoom: currentZoom,
      markers: markers
    });
  });

  // 줌 변경 이벤트 핸들러 추가
  map.on('zoomend', function() {
    var currentZoom = map.getZoom();
    
    // 확장된 클러스터가 있고, 줌 아웃했을 때
    if (map.expandedClusters && map.expandedClusters.length > 0) {
      map.expandedClusters.forEach(function(cluster) {
        if (currentZoom < cluster.zoom) {
          // 개별 마커들을 지도에서 제거
          cluster.markers.forEach(function(marker) {
            map.removeLayer(marker);
          });
          
          // 마커들을 다시 클러스터 그룹에 추가
          cluster.markers.forEach(function(marker) {
            markerClusterGroup.addLayer(marker);
          });
        }
      });
      
      // 처리된 클러스터 정보 초기화
      map.expandedClusters = [];
    }
  });

  map.addLayer(markerClusterGroup);
  console.log("initmap");
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
locationui.removeTimerInterval = function () {
  const myPromise = new Promise((resolve, reject) => {
    try {
      if (globalInterval != undefined) {
        clearInterval(globalInterval);
        resolve();
      }
    } catch (err) {
      reject();
    }
  });
  myPromise
    .then(() => {
      globalInterval = undefined;
      console.log("clearInterval Success");
    })
    .catch((err) => {
      console.log("clearInterval Err", err);
    });
};
locationui.servicestatus = function () {
  servicestatus.style = "display: list-item";
  
  document.getElementById("statusbar").innerHTML = `<a class="nav-link disabled" id="servicestatus" ><div class="spinner-border spinner-border-sm" role="status">
            <span class="sr-only">Loading...</span>
          </div>Service healthcheck..</a>`
  console.log("TEST")
  
  // 언어 확인
  const isKorean = locationui.isKoreanLanguage();
  const messageKey = isKorean ? 'message_ko_KR' : 'message_en_US';

  fetch("https://jayneycoffee.api.location.rainclab.net/api/healthcheck")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success == true) {
        servicestatus.innerHTML = `Service: Active, message: ${data[messageKey]}`;
      }
      if (data.success == true && data.status == true) {
        servicestatus.innerHTML = `Service: Active, Location DB: Active, message: ${data[messageKey]}`;
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
  try {
    var dateObject = {
      startDate: decodeURIComponent(dateInfo.split(" - ")[0]),
      endDate: decodeURIComponent(dateInfo.split(" - ")[1])
    };

    if (!moment(dateObject.startDate).isValid() || !moment(dateObject.endDate).isValid()) {
      alert('유효하지 않은 날짜입니다.');
      return;
    }

    rangeText.innerHTML = `TIME : (${timezone.value}): ${dateObject.startDate} ~ ${dateObject.endDate}`;
    
    // Set the start date and time
    var startDate = moment(dateObject.startDate);
    var endDate = moment(dateObject.endDate);
    
    $(function () {
      var daterangepicker = $("#datetimes").data("daterangepicker");
      if (daterangepicker) {
        // Set the daterangepicker's start and end dates
        daterangepicker.setStartDate(startDate);
        daterangepicker.setEndDate(endDate);
      }
    });

    locationui.drawLocations(device, dateObject, password, authorization);
  } catch (error) {
    console.error('Error processing dates:', error);
    alert('날짜 처리 중 오류가 발생했습니다.');
  }
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
  expireDate.setDate(expireDate.getDate() + 14);
  setCookie("deviceId", device, expireDate);
  setCookie("devicePw", password, expireDate);
  setCookie("deviceAuth", authorization, expireDate);
  var xmlhttp = new XMLHttpRequest();

  // 언어 확인
  const isKorean = locationui.isKoreanLanguage();
  const messageKey = isKorean ? 'message_ko_KR' : 'message_en_US';

  var url;
  if (typeof date == "object") {
    console.log(date.startDate);
    url = `https://jayneycoffee.api.location.rainclab.net/api/view?device=${device}&startDate=${date.startDate}&endDate=${date.endDate}&authorization=${authorization}&timezone=${timezone.value}`;
    document.getElementById("datetimes").setAttribute("fromurl", "true");
  } else {
    rangeText.innerHTML = `${date}분 전 위치 기준`;
    url = `https://jayneycoffee.api.location.rainclab.net/api/view?device=${device}&timeInterval=${date}&authorization=${authorization}&timezone=${timezone.value}`;
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
            alert(data[messageKey]);
            loading.style = "display: none";
          }
        } else {
          loading.style = "display: none";
          if (date !== 5) {
            alert(isKorean ? "위치정보가 수집되지 않았어요. 수집기를 켜시면 수집됩니다." : "No location data collected. Please turn on the collector.");
          }
        }
      } else {
        alert(data[messageKey]);
      }
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
  if (date !== 5) {
    locationui.removeTimerInterval();
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
    // URL에서 날짜 파라미터 확인
    let initialStartDate = moment().startOf("hour");
    let initialEndDate = moment().startOf("hour").add(32, "hour");
    
    // URL에서 파라미터 파싱
    try {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      // timezone 파싱
      if (params.has('timezone')) {
        const tzValue = parseInt(params.get('timezone'));
        if (!isNaN(tzValue) && tzValue >= -12 && tzValue <= 14) {
          document.getElementById('timezone').value = tzValue;
        }
      }
      
      if (params.has('startDate') && params.has('endDate')) {
        const decodedStartDate = decodeURIComponent(params.get('startDate'));
        const decodedEndDate = decodeURIComponent(params.get('endDate'));
        
        // 유효한 날짜인지 확인
        const tempStartDate = moment(decodedStartDate);
        const tempEndDate = moment(decodedEndDate);
        
        if (tempStartDate.isValid() && tempEndDate.isValid()) {
          initialStartDate = tempStartDate;
          initialEndDate = tempEndDate;
        }
      }
    } catch (error) {
      console.error('Parameter parsing error:', error);
    }

    $('input[name="datetimes"]')
      .daterangepicker({
        timePicker: true,
        startDate: initialStartDate,
        endDate: initialEndDate,
        locale: {
          format: "Y-MM-DD HH:mm:ss"
        }
      })
      .on("apply.daterangepicker", function (e, picker) {
        if (!picker.startDate.isValid() || !picker.endDate.isValid()) {
          alert('유효하지 않은 날짜입니다. 다시 선택해주세요.');
          return;
        }

        // 날짜 선택 시 URL 업데이트
        const startDate = picker.startDate.format("YYYY-MM-DD HH:mm:ss");
        const endDate = picker.endDate.format("YYYY-MM-DD HH:mm:ss");
        
        updateURLParameters(startDate, endDate);

        locationui.drawLocationsBeforePreprocess(
          device.value,
          password.value,
          authorization.value,
          `${startDate} - ${endDate}`
        );
      });

    // timezone select 이벤트 핸들러 추가
    document.getElementById('timezone').addEventListener('change', function(e) {
      updateURLParameters();
    });
  });
};

// URL 파라미터 업데이트 함수
function updateURLParameters(startDate = null, endDate = null) {
  let currentUrl = new URL(window.location.href);
  let hash = currentUrl.hash.split('?');
  let baseHash = hash[0];
  let params = new URLSearchParams(hash[1] || '');

  // timezone 파라미터 업데이트
  params.set('timezone', document.getElementById('timezone').value);
  
  // 날짜 파라미터가 제공된 경우에만 업데이트
  if (startDate && endDate) {
    params.set('startDate', encodeURI(startDate));
    params.set('endDate', encodeURI(endDate));
  }
  
  window.location.hash = `${baseHash}?${params.toString()}`;
}
locationui.share = function () {
  let dateValue = "";
  if (document.getElementById("datetimes").getAttribute("fromurl") == "true") {
    var daterangepicker = $("#datetimes").data("daterangepicker");

    // Get the start date
    var startDate = daterangepicker.startDate.format("YYYY-MM-DD HH:mm:ss");
    var endDate = daterangepicker.endDate.format("YYYY-MM-DD HH:mm:ss");
    dateValue = `&startDate=${encodeURI(startDate)}&endDate=${encodeURI(endDate)}`;
  }
  const parameter = `deviceId=${encodeURI(device.value)}&deviceKey=${authorization.value}&privateKey=${password.value}&timezone=${timezone.value}${dateValue}`;
  const URL = `https://jayneycoffee.location.rainclab.net/#locationui?${parameter}`;
  window.navigator.clipboard.writeText(URL).then(() => {
    alert("Completed.");
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

locationui.drawArrows = function(locations) {
    // 기존 화살표들 제거
    if (locationui.arrows) {
        locationui.arrows.forEach(arrow => map.removeLayer(arrow));
    }
    locationui.arrows = [];

    // 위치들을 시간순으로 정렬
    locations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // 연속된 두 위치 포인트 사이에 화살표 그리기
    for (let i = 0; i < locations.length - 1; i++) {
        const start = locations[i];
        const end = locations[i + 1];
        
        // 라인 그리기
        const polyline = L.polyline([
            [start.lat, start.lng],
            [end.lat, end.lng]
        ], {
            color: 'blue',
            weight: 2
        }).addTo(map);

        // 화살표 데코레이터 추가
        const decorator = L.polylineDecorator(polyline, {
            patterns: [
                {
                    offset: '50%',
                    repeat: 0,
                    symbol: new L.Symbol.ArrowHead({
                        pixelSize: 15,
                        headAngle: 45,
                        pathOptions: {
                            color: 'blue',
                            fillOpacity: 1,
                            weight: 2
                        }
                    })
                }
            ]
        }).addTo(map);

        locationui.arrows.push(polyline);
        locationui.arrows.push(decorator);
    }
};

// 기존 마커 추가 함수 수정
locationui.addMarker = function(lat, lng, timestamp) {
    var marker = L.marker([lat, lng]).addTo(map);
    if (!locationui.markers) {
        locationui.markers = [];
    }
    locationui.markers.push({
        marker: marker,
        lat: lat,
        lng: lng,
        timestamp: timestamp
    });

    // 마커가 2개 이상이면 화살표 그리기
    if (locationui.markers.length >= 2) {
        locationui.drawArrows(locationui.markers);
    }
};

// timezone 파싱 함수 추가
locationui.getValidTimezone = function(timezoneStr) {
  if (!timezoneStr) return 9; // 빈 문자열이면 기본값 9
  const tzValue = parseInt(timezoneStr);
  return (!isNaN(tzValue) && tzValue >= -12 && tzValue <= 14) ? tzValue : 9;
};

// 언어 확인 함수 추가
locationui.isKoreanLanguage = function() {
  // 1. navigator.languages 배열 확인 (가장 선호하는 언어들의 전체 목록)
  if (navigator.languages && navigator.languages.length) {
    const preferredLanguages = navigator.languages.map(lang => lang.toLowerCase());
    // 한국어가 포함되어 있는지 확인
    return preferredLanguages.some(lang => lang.startsWith('ko'));
  }
  
  // 2. navigator.language 확인 (주 언어)
  if (navigator.language) {
    return navigator.language.toLowerCase().startsWith('ko');
  }
  
  // 3. navigator.userLanguage 확인 (IE 지원)
  if (navigator.userLanguage) {
    return navigator.userLanguage.toLowerCase().startsWith('ko');
  }
  
  // 4. navigator.browserLanguage 확인 (오래된 브라우저 지원)
  if (navigator.browserLanguage) {
    return navigator.browserLanguage.toLowerCase().startsWith('ko');
  }
  
  return false; // 기본값은 영어
};
