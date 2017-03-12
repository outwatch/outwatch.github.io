function checkLang() {
  var previousLang = getUrlParameter("lang")
  var currentLang = previousLang || "scala"
  if (!previousLang){
    document.location = document.URL + "?lang=" + currentLang
  }

  showOnly(currentLang)

}


function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var lookup = location.search || location.hash
    var results = regex.exec(lookup);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function showOnly(lang) {

  var langToHide = lang == "scala" ? "purescript" : "scala"

  var activeTabs = document.querySelectorAll(".lang-specific." + langToHide)
  for (var i = 0; i < activeTabs.length; ++i) {
    var item = activeTabs[i]
    if (item.tagName == 'SPAN' || item.tagName == "DIV"){
      item.hidden = true
    } else {
      item.classList.remove("active")
    }
  }
  var currentTabs = document.querySelectorAll(".lang-specific." + lang)
  for (var i = 0; i < currentTabs.length; ++i) {
    var item = currentTabs[i]
    if (item.tagName == 'SPAN' || item.tagName == "DIV"){
      item.hidden = false
    } else {
      item.className += ' active'
    }
  }

}


function switchLang(langName) {
  var previousLang = getUrlParameter("lang")
  if (previousLang != langName){
    var newLocation = document.URL.replace(previousLang, langName)
    window.history.pushState({path:newLocation},'',newLocation);
  }

  showOnly(langName)
}
