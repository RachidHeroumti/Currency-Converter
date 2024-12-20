const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    if (!text || text[0] !== "1") {
      throw new Error("Invalid response format from server.");
    }
    const [id, code, nickName, name] = text.split(";");
    return { id: parseInt(id), code, nickName, name };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

(function (history) {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    window.dispatchEvent(new Event("pushstate"));
    return result;
  };

  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event("replacestate"));
    return result;
  };
})(window.history);

const vm = new StoreinoApp({
  el: "#app_currencyconverter",
  data: {
    configData: __DATA__,
    currentPath: window.location.pathname,
    SelectedCurrencies: [],
    ExchangeRate: 1,
    originalCurrency: "",
    newCurrency: "",
  },

  mounted() {
    this.SelectedCurrencies = this.configData.SelectedCurrencies || [];;
    this.ExchangeRate=this.getExchangeRateFromlocalstorage();
    this.getOriginalCurrency();
    this.initializeCurrencyConverter();
   // this.handleRouteChange();
    window.addEventListener("popstate", this.handleRouteChange);
    window.addEventListener("pushstate", this.handleRouteChange);
  },
  beforeDestroy() {
    window.removeEventListener("popstate", this.handleRouteChange);
    window.removeEventListener("pushstate", this.handleRouteChange);
  },
  watch: {
    $route() {
      console.log("🚀 ~ new route:", this.$route.path);
      setTimeout(() => {
        this.initializeCurrencyConverter();
      }, 500); 
    },
  },

  methods: {
    getExchangeRateFromlocalstorage() {
      const storedRate = localStorage.getItem('rate-exchange');
      if (storedRate) {
        const rateData = JSON.parse(storedRate);
        if (Date.now() < rateData.expiry) {
          return rateData.value;
        } else {
          localStorage.removeItem('rate-exchange'); 
        }
      }
      return 1; 
    },
    getCookie(name) {
      const cookieString = document.cookie;
      const cookies = cookieString.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
      }, {});
      return cookies[name] || "";
    },
    handleRouteChange() {
      console.log("🚀 ~ change ~ path:", this.currentPath);
      setTimeout(() => {
        this.initializeCurrencyConverter();
      }, 1000); 
    },
    async initializeCurrencyConverter() {
      try {
        const currentCountry = await this.getCurrentCountryInfo();
        if (currentCountry) {
          this.newCurrency = currentCountry.currency;
          if(this.ExchangeRate === 1){
            this.ExchangeRate = await this.getExchangeRate(currentCountry);
          }  
          this.ChangePrices();
          this.updateCurrencyDisplay();
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      }
    },
    async getCurrentCountryInfo() {
      try {
        // const cachedCountry = localStorage.getItem('current-country');
        // if (cachedCountry) {
        //   console.log("🚀 ~ getCurrentCountryInfo ~ Cached Country:", JSON.parse(cachedCountry));
        //   return JSON.parse(cachedCountry);
        // }
        const userCountry = await fetchData("https://ip2c.org/s");
        const currentCountry = this.SelectedCurrencies.find(
          (item) => item.countryName === userCountry.name
        );
        if (!currentCountry) {
          console.warn("Country not in select list");
          return null;
        }

        console.log("🚀 ~ getCurrentCountryInfo ~ Fetched Country:", currentCountry);
        localStorage.setItem('current-country', JSON.stringify(currentCountry));
        return currentCountry;
      } catch (error) {
        console.error("Failed to fetch user country info:", error);
        return null;
      }
    },    
    getOriginalCurrency() {
      this.originalCurrency = this.getCookie("CURRENT_CURRENCY");
      console.log("🚀 ~ getOriginalCurrency ~ this.originalCurrency:",this.originalCurrency);
    },
    updateCurrencyDisplay() {
      const currencyElements = document.querySelectorAll(".currency");
      if (currencyElements.length > 0) {
        currencyElements.forEach((currencyElement) => {
          currencyElement.innerText = this.newCurrency;
        });
      } else {
        console.error("Currency elements are missing in the DOM.");
      }
    },
    ChangePrices() {
      const priceElements = document.querySelectorAll(".price");
      priceElements.forEach((priceElement) => {
        const oldValue = parseFloat(priceElement.innerHTML);
        if (!isNaN(oldValue)) {
          this.updatePriceDisplay(oldValue, this.ExchangeRate, priceElement);
        } else {
          console.error("Invalid price value:", priceElement.innerHTML);
        }
      });
    },
    updatePriceDisplay(oldValue, rate, element) {
      if (element) {
        console.log("🚀 ~ updatePriceDisplay ~ element:", element)
        const convertedValue = Math.round(oldValue * rate * 100) / 100;;
        element.innerText = `${convertedValue.toFixed(2)}`;

      } else {
        console.error("element not found ");
      }
    },
    async getExchangeRate(currentCountry) {
      console.log(
        "🚀 ~ getExchangeRate ~ currentCountry:",
        currentCountry.currency
      );
      const origina_currency = this.originalCurrency;
      console.log("🚀 ~ getExchangeRate ~ origina_currency:", origina_currency);
 
      try {

        const getPrice = await StoreinoApp.$store.custom(
          'post', 
          'https://gateway.storeino.com', 
          'paypal/converts/exchange',{}, 
          {
            from: origina_currency,
            to: currentCountry.currency,
            amount: 10,
          }
        );
        console.log("🚀 ~ getExchangeRate ~ getPrice:", getPrice)
        const rateExchange = {
          value: getPrice.result,
          expiry: Date.now() + 60 * 60 * 1000, 
        };
        localStorage.setItem('rate-exchange', JSON.stringify(rateExchange));
        return  getPrice.result;  
      } catch (error) {
        console.error("Error during currency conversion:", error);
        return null;
      }
    },
    svg(name) {
      const icons = {
        edit: '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M80 0v-160h800V0H80Zm160-320h56l312-311-29-29-28-28-311 312v56Zm-80 80v-170l448-447q11-11 25.5-17t30.5-6q16 0 31 6t27 18l55 56q12 11 17.5 26t5.5 31q0 15-5.5 29.5T777-687L330-240H160Zm560-504-56-56 56 56ZM608-631l-29-29-28-28 57 57Z"/></svg>',
        delete:
          '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>',
        add: '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>',
        open: '<svg xmlns="http://www.w3.org/2000/svg"  height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="m280-400 200-200 200 200H280Z"/></svg>',
        close:
          '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M480-360 280-560h400L480-360Z"/></svg>',
        direction:
          '<svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/></svg>',
        search:
          '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA33F7"><path d="M628.46-200H184.62q-27.62 0-46.12-18.5Q120-237 120-264.62v-430.76q0-27.62 18.5-46.12Q157-760 184.62-760h590.76q27.62 0 46.12 18.5Q840-723 840-695.38v430.76q0 27.62-18.5 46.12Q803-200 775.38-200h-32.92L549.85-392.62q-18.7 16.31-41.27 24.47Q486-360 460-360q-58.08 0-99.04-40.96Q320-441.92 320-500q0-58.08 40.96-99.04Q401.92-640 460-640q58.08 0 99.04 40.96Q600-558.08 600-500q0 21.62-4.69 39.46-4.69 17.85-18.69 38.08L759.08-240h16.3q9.24 0 16.93-7.69 7.69-7.69 7.69-16.93v-430.76q0-9.24-7.69-16.93-7.69-7.69-16.93-7.69H184.62q-9.24 0-16.93 7.69-7.69 7.69-7.69 16.93v430.76q0 9.24 7.69 16.93 7.69 7.69 16.93 7.69h403.84l40 40ZM460-400q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29ZM160-240v-480 480Z"/></svg>',
      };
      return icons[name] || "";
    },
  },
});

