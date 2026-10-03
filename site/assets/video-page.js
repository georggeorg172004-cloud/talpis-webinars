(function(){
  var body=document.body;
  var pageUrl=window.location.href;
  var ua=navigator.userAgent||"";
  var isInAppBrowser=
    /Telegram|TelegramBot/i.test(ua)||
    Boolean(window.TelegramWebviewProxy)||
    /VKAndroidApp|vkdesktop|VK\//i.test(ua)||
    /Instagram|FBAN|FBAV|FB_IAB/i.test(ua);
  var warning=document.getElementById("browserWarning");
  var playerWrap=document.getElementById("playerWrap");
  var openBrowser=document.getElementById("openBrowser");

  if(isInAppBrowser){
    warning.style.display="block";
    playerWrap.style.display="none";
    openBrowser.href=pageUrl;
    openBrowser.addEventListener("click",function(event){
      event.preventDefault();
      window.open(pageUrl,"_system");
    });
    return;
  }

  var video=document.getElementById("video");
  var loading=document.getElementById("loading");
  video.src=body.getAttribute("data-video-src");
  video.style.display="block";
  loading.style.display="none";

  video.addEventListener("contextmenu",function(event){event.preventDefault()});
  document.addEventListener("contextmenu",function(event){event.preventDefault()});
  document.addEventListener("dragstart",function(event){event.preventDefault()});
  document.addEventListener("keydown",function(event){
    var key=String(event.key||"").toLowerCase();
    if(
      (event.ctrlKey&&(key==="s"||key==="u"))||
      (event.ctrlKey&&event.shiftKey&&(key==="i"||key==="j"))||
      event.key==="F12"
    ){
      event.preventDefault();
    }
  });
})();
