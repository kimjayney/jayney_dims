var mainpage = {};

mainpage.renderEventProcess = function() {
    console.log('Main page render event process');
    // Add any additional initialization here
};

mainpage.skeletonMake = function() {
    console.log('Creating main page skeleton');
    var mainArea = document.createElement("div");
    mainArea.id = "main-area";
    container.innerHTML = `${mainArea.outerHTML}`;
};

mainpage.render = function() {
    console.log('Rendering main page');
    main.innerHtmlRender("./render/mainpage.html", "main-area", mainpage.renderEventProcess);
};

mainpage.destory = function() {
    var mainArea = document.getElementById("main-area");
    if (mainArea) {
        mainArea.remove();
    }
    router.destory = undefined;
};

mainpage.init = function() {
    console.log('Initializing main page');
    mainpage.skeletonMake();
    mainpage.render();
};

mainpage.init();
router.destory = mainpage.destory;
