/** @format */

// Objects and variables ***************************************

const LATEST_URL = "https://api.currentsapi.services/v1/latest-news?";
const SEARCH_URL = "https://api.currentsapi.services/v1/search?";
const CATEGORY_URL =
  "https://api.currentsapi.services/v1/available/categories?";
const LANGUAGE_URL = "https://api.currentsapi.services/v1/available/languages?";
const REGION_URL = "https://api.currentsapi.services/v1/available/regions?";
const KEY = "irEpCm6MXKy6RhBFWhNt8Hy28Rbdm6_k9lKjAM_gMFu4k9bc";
const LANGUAGE = "en";
const INITIAL_URL = LATEST_URL + "language=" + LANGUAGE + "&apiKey=" + KEY;
let theTimer;

/**
 * Sets and gets all the global variable that are stored in localStorage
 */
function initialGlobal() {
  let languagesArray = [];
  let categoriesArray = [];
  let regionsArray = [];
  let darkMode = false;

  return function languages(lang, cat, reg, dark) {
    if (lang || cat || reg || dark) {
      lang ? (languagesArray = lang) : "";
      cat ? (categoriesArray = cat) : "";
      reg ? (regionsArray = reg) : "";
      dark ? (darkMode = dark) : "";
      localStorage.setItem(
        "settings",
        JSON.stringify([
          languagesArray,
          categoriesArray,
          regionsArray,
          darkMode,
        ])
      );
    } else {
      return [languagesArray, categoriesArray, regionsArray, darkMode];
    }
  };
}

const storeToArray = initialGlobal();

/**
 * Keep track of the current page
 */
function pageKeeper() {
  let currentPage = 1;

  return function (page = currentPage) {
    currentPage = page;
    return currentPage;
  };
}

const currentPage = pageKeeper();

/**
 * It is a global storage of the search variables and at the same time it builds a search url
 * mode is crucial. set is used to initiate and to refresh. It's the default latest news
 * mod is a search query of any kind
 * get gets the last query (it's only a getter)
 */
function urlBuilder() {
  let baseurl = "";
  let finalurl = "";
  let searchString = "";

  let pageVar = 0;
  let languageVar = "";
  let categoryVar = "";
  let regionVar = "";
  let domainVar = "";
  let domainNotVar = "";
  let keywordsVar = "";
  let beginDateVar = "";
  let endDateVar = "";

  /**
   * Builds a url according to all the search criterias, including none.
   * @param {String} mode (set, mod, get)  (set a new one, modify the last, get the last)
   * @param {Number} page
   * @param {String} language
   * @param {String} category
   * @param {String} region
   * @param {String} domain
   * @param {String} domainNot
   * @param {String} keywords
   * @param {String} beginDate
   * @param {String} endDate
   */
  return function urlBuilderInner(
    mode,
    page = null,
    language = null,
    category = null,
    region = null,
    domain = null,
    domainNot = null,
    keywords = null,
    beginDate = null,
    endDate = null
  ) {
    if (mode === "get") {
      return finalurl;
    }

    if (mode === "mod") {
      page ? "" : (page = pageVar);
      language ? "" : (language = languageVar);
      category ? "" : (category = categoryVar);
      region ? "" : (region = regionVar);
      domain ? "" : (domain = domainVar);
      domainNot ? "" : (domainNot = domainNotVar);
      keywords ? "" : (keywords = keywordsVar);
      beginDate ? "" : (beginDate = beginDateVar);
      endDate ? "" : (endDate = endDateVar);

      console.log("timer just got cleared");
    }

    baseurl = SEARCH_URL + `apiKey=${KEY}`;

    page ? "" : (page = 1);
    language ? "" : (language = "en");

    let firstAdded = `&page_number=${page}&language=${language}`;
    searchString = `page= ${page}, language= ${language}`;
    pageVar = page;
    languageVar = language;
    let restAdded = "";

    categoryVar = category;
    if (category) {
      restAdded = `&category=${category}`;
      searchString = searchString + `, category= ${category}`;
    }
    regionVar = region;
    if (region) {
      restAdded = restAdded + `&country=${region}`;
      searchString = searchString + `, country= ${region}`;
    }
    domainVar = domain;
    if (domain) {
      restAdded = restAdded + `&domain=${domain}`;
      searchString = searchString + `, domain= ${domain}`;
    }
    domainNotVar = domainNot;
    if (domainNot) {
      restAdded = restAdded + `&domain_not=${domainNot}`;
      searchString = searchString + `, excluded domain= ${domainNot}`;
    }
    keywordsVar = keywords;
    if (keywords) {
      restAdded = restAdded + `&keywords=${keywords}`;
      searchString = searchString + `, keywords= ${keywords}`;
    }
    beginDateVar = beginDate;
    if (beginDate) {
      restAdded = restAdded + `&start_date=${beginDate}`;
      const [shortBeginDate] = beginDate.split("T");
      searchString = searchString + `, start date= ${shortBeginDate}`;
    }
    endDateVar = endDate;
    if (endDate) {
      restAdded = restAdded + `&end_date=${endDate}`;
      const [shortEndDate] = endDate.split("T");
      const [YY, MM, DD] = shortEndDate.split("-");
      const newShortEndDate = `${YY}-${MM}-${DD - 1}`;
      searchString = searchString + `, end date= ${newShortEndDate}`;
    }

    finalurl = baseurl + firstAdded + restAdded;
    $(".currentSearchBox").text(searchString);

    return finalurl;
    //return latestTest;
  };
}

const urlBuilderConst = urlBuilder();

//Bootstrap ***************************************

/**
 * Populates the initial screen with the latest news. It creates all the html elements (cards)
 * and populates them.
 */
async function buildNewsCards(url) {
  const { news, page } = await fetchUrl(url);
  news.forEach(function ({
    author,
    category,
    description,
    image,
    language,
    published,
    title,
    url,
  }) {
    const [httpPart, , domain] = url.split("/");
    const fullDomain = httpPart + "//" + domain;
    const [, secondPart] = domain.split("www.");
    const shortDomain = secondPart === undefined ? domain : secondPart;
    const date = momentConverter(published);
    const htmlElement = $(`
                <div class="mainCard">
				<p class='cardTitle'><a href='#' target='_blank'>${title}</a></p>
				<p class='date'>${date.format("MM/DD/YY @ HH:mm")}</p>
				<p class='author'>By: ${author}</p>
				
				<p class='domain'>Source: <a href='${fullDomain}' target='_blank'>${shortDomain}</a></p>
				
				<div class='cardCategories'>
					<p class='cardCategoryTitle'>Categories:&nbsp; </p>
				</div>
				<p class='language'>Language: ${language}</p>
                <p class='description'>${description}</p>
                ${
                  image === "None"
                    ? ""
                    : `
                <div class='imageFrame'>
                <a href='#'>
                <img class='smallImage' src='${image}'/>
                </a>
				</div>`
                }
				
			</div>
    `);

    if (category) {
      category.forEach(function (item, index) {
        const categoryHtml = $(`
            <p class='cardCategory' value=${item}><a href='#'>${
          index > 0 ? ", " + item : item
        }</a></p>
            `);
        htmlElement.find(".cardCategories").append(categoryHtml);
      });
    }
    htmlElement.find(".cardTitle").data("siteUrl", url);
    htmlElement.find(".smallImage").data("imageUrl", image);
    $("main").append(htmlElement);
  });
  darkModeFunc(storeToArray()[3]);
}

/**
 * Fetch categories and populate category drop down menu
 */
async function getDropDownData() {
  //local storage
  if (localStorage.getItem("settings")) {
    const [lang, cat, reg, dark] = JSON.parse(localStorage.getItem("settings"));
    storeToArray(lang, cat, reg, dark);
  } else {
    let { categories } = await fetchUrl(CATEGORY_URL + "apiKey=" + KEY);
    const categoryArray = categories;
    categoryArray.sort();

    const { languages } = await fetchUrl(LANGUAGE_URL + "apiKey=" + KEY);
    const languagesArray = Object.entries(languages);
    languagesArray.sort();

    const { regions } = await fetchUrl(REGION_URL + "apiKey=" + KEY);
    regionObject = regions;
    const regionArray = Object.entries(regionObject);
    regionArray.sort();

    storeToArray(languagesArray, categoryArray, regionArray);
  }
  fillDropDownMenus();
}

/**
 * Uses the arrays with the drop down menu elements to create the DOM elements
 * It also activates dark mode according to settings
 */
function fillDropDownMenus() {
  //category
  storeToArray()[1].forEach(function (item) {
    const categoryHtml = $(`
		<option value='${item}'>${item}</option>
	`);
    $("#selectCategory").append(categoryHtml);
  });

  //languages
  storeToArray()[0].forEach(function ([language, value]) {
    const languageHtml = $(`
		<option value='${value}' ${
      value === "en" ? "selected" : ""
    }>${language}</option>
	`);
    $("#selectLanguage").append(languageHtml);
  });

  //regions
  storeToArray()[2].forEach(function ([country, value]) {
    const regionHtml = $(`
		<option value='${value}'>${country}</option>
	`);
    $("#selectRegion").append(regionHtml);
  });

  if (storeToArray()[3]) {
    darkModeFunc(true);
  } else {
    darkModeFunc(false);
  }
}

function bootstrap() {
  buildNewsCards(urlBuilderConst("set"));
  getDropDownData();
  beginTimer();
}

bootstrap();

//Functions ***************************************

/**
 * Handles the fetching of any url
 * @param {String} url
 */
async function fetchUrl(url) {
  onLoadStart();
  try {
    const fetchResult = await fetch(url);
    const data = await fetchResult.json();
    return data;
  } catch (error) {
    console.error("Fetch error: " + error.message);
    //return null;
  } finally {
    onLoadEnd();
  }
}

/**
 * Shows a loading message while fetching is being resolved
 */
function onLoadStart() {
  $(".loading").css("display", "block");
}

/**
 * Stops the loading message when fetching is resolved
 */
function onLoadEnd() {
  $(".loading").css("display", "none");
}

function beginTimer() {
  theTimer = setInterval(callLatest, 300000);
}

function callLatest() {
  resetSearch();
  buildNewsCards(urlBuilderConst("set"));
}

/**
 * Converts the date sent by the api into a moment date
 * @param {api Date} someDate
 */
function momentConverter(someDate) {
  const [rawDate, fullTime] = someDate.split(" ");
  const [hour, minutes, seconds] = fullTime.split(":");
  const date = new moment(rawDate);
  const systemDate = new Date(rawDate);
  const offset = systemDate.getTimezoneOffset();
  date.hour(hour - offset / 60);
  date.minutes(minutes);
  date.seconds(seconds);

  return date;
}

/**
 * Resets all the search variable to their initial state. Sets the stage for a new
 * latest news or other search.
 */
function resetSearch() {
  $(".mainCard").remove();
  currentPage(1);
  $("#previous").addClass("inactive");
}

//Listeners ***************************************

//Listen for the image click
$("main").on("click", ".smallImage", function (event) {
  event.preventDefault();
  $(".photoOutter").css("display", "block");
  $(".bigPhoto").attr("src", $(this).data("imageUrl"));
});

//Listen for closing x button on image frame
$(".photoInner img").on("click", function (event) {
  event.preventDefault();
  $(".photoOutter").css("display", "none");
});

//Listen to title click
$("main").on("click", ".cardTitle", async function (event) {
  event.preventDefault();
  const url = $(this).data("siteUrl");

  window.open(url);
});

//Listen to closing x button on detailed article frame
$(".detailedCardInner img").on("click", function (event) {
  event.preventDefault();
  $(".detailedCardOutter").css("display", "none");
});

//Listen to search button
$(".searchButton").on("click", function (event) {
  search();
});
$("#keywords").on("keyup", function (event) {
  if (event.keyCode === 13) {
    search();
  }
});
$("#enterDomain").on("keyup", function (event) {
  if (event.keyCode === 13) {
    search();
  }
});

/**
 * Gets called from the search button or from enter in either one of the search fields.
 * It builds the corresponding search url and uses it to fill the canvas with new cards.
 */
function search() {
  const keywordsFromInput = $("#keywords").val()
    ? $("#keywords").val()
    : undefined;
  $("#keywords").val("");
  let keywords = undefined;
  if (keywordsFromInput) {
    keywords = keywordsFromInput.split(" ")[0];
  }
  const category =
    $("#selectCategory").val() === "all"
      ? undefined
      : $("#selectCategory").val();
  const language = $("#selectLanguage").val();
  const region =
    $("#selectRegion").val() === "all" ? undefined : $("#selectRegion").val();
  const startDate = $("#from").val()
    ? new moment.utc($("#from").val())
    : undefined;
  const systemDate = new Date(Date.now());
  const offset = systemDate.getTimezoneOffset();
  startDate ? startDate.hours(0 + offset / 60) : "";

  const endDate = $("#to").val() ? new moment.utc($("#to").val()) : undefined;
  endDate ? endDate.hours(24 + offset / 60) : "";

  let domain = undefined;
  let domainNot = undefined;
  if ($("#enterDomain").val()) {
    if ($("#domainInclude").is(":checked")) {
      domain = $("#enterDomain").val();
    } else {
      domainNot = $("#enterDomain").val();
    }
    $("#enterDomain").val("");
  }

  resetSearch();
  clearInterval(theTimer);
  buildNewsCards(
    urlBuilderConst(
      "set",
      1,
      language,
      category,
      region,
      domain,
      domainNot,
      keywords,
      startDate ? startDate.format() : startDate,
      endDate ? endDate.format() : endDate
    )
  );
}

//Listen to previous page button
$("#previous").on("click", function (event) {
  if (currentPage() === 2) {
    $("#previous").addClass("inactive");
  }
  if (currentPage() > 1) {
    $(".mainCard").remove();

    let actualPage = currentPage();
    currentPage(actualPage - 1);

    buildNewsCards(urlBuilderConst("mod", currentPage()));
  }
});

//Listen to refresh button
$("#refresh").on("click", function (event) {
  resetSearch();
  beginTimer();
  buildNewsCards(urlBuilderConst("set", 1));
});

//Listen to next page button
$("#next").on("click", function (event) {
  $(".mainCard").remove();
  $("#previous").removeClass("inactive");
  let actualPage = currentPage();
  currentPage(actualPage + 1);

  buildNewsCards(urlBuilderConst("mod", currentPage()));
});

//Listen to direct category clicking
$("main").on("click", ".cardCategory", function (event) {
  event.preventDefault();
  $(".mainCard").remove();
  const category = $(this).attr("value");
  console.log(category);
  buildNewsCards(urlBuilderConst("set", 1, undefined, category));
});

//Listen to dark mode button
$("#dark").on("click", function () {
  if ($(this).text() === "Dark Mode") {
    darkModeFunc(true);
  } else {
    darkModeFunc(false);
  }
});

/**
 * Turns dark mode on and off
 * @param {Boolean} dark
 */
function darkModeFunc(dark) {
  const mode = $("#dark");
  if (dark) {
    mode.text("Light Mode");
    $("main").css("background-color", "black").css("color", "white");
    $(".mainCard").css("background-color", "rgb(41, 40, 40)");
    $(".photoOutter").css("background-color", "rgb(41, 40, 40)");
    $(".domain a").css("color", "white");
    $(".cardCategory a").css("color", "white");
  } else {
    mode.text("Dark Mode");
    $("main").css("background-color", "#d2d8d7").css("color", "black");
    $(".mainCard").css("background-color", "white");
    $(".photoOutter").css("background-color", "white");
    $("a").css("color", "blue");
  }
  storeToArray(undefined, undefined, undefined, dark);
}

//Listen to side panel button to show or hide side panel
$("#sideBar").on("click", function (event) {
  const a = $("aside");
  if ($("aside").hasClass("hide")) {
    a.removeClass("hide animate__backOutRight");
    a.addClass("animate__backInRight");
    $("body").css("grid-template-columns", "auto auto");
  } else {
    a.addClass("animate__backOutRight");
    a.removeClass("animate__backInRight");
    $("body").css("grid-template-columns", "auto");
    setTimeout(hideIt, 800);
    function hideIt() {
      a.addClass("hide");
    }
  }
});
