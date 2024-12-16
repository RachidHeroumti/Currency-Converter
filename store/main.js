const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    if (!text || text[0] !== "1") {
      throw new Error("Unable to fetch the country");
    }
    const [id, code, nickName, name] = text.split(";");
    return { id: parseInt(id), code, nickName, name };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

const vm = new StoreinoApp({
  el: "#app_currencyconverter",
  data: {
    configData: __DATA__,
    SelectedCurrencies: [],
    ExchangeRate: 1,
  },

  mounted() {
    this.SelectedCurrencies = this.configData.SelectedCurrencies || [];
    console.log("🚀 ~ mounted ~  this.SelectedCurrencies:", this.SelectedCurrencies);

    this.checkUserCountry();
  },

  methods: {
    async checkUserCountry() {
      const priceElement = document.querySelector(".price");
      const currencyElement = document.querySelector(".currency");

      if (!priceElement || !currencyElement) {
        console.error("Price or currency element is missing in the DOM.");
        return;
      }

      const priceText = priceElement.innerText.trim();
      const currencyText = currencyElement.innerText.trim();

      const originalPrice = parseFloat(priceText);
      if (isNaN(originalPrice)) {
        console.error("Invalid price value detected.");
        return;
      }

      try {
        const userCountry = await fetchData("https://ip2c.org/s");
        console.log("🚀 ~ checkUserCountry ~ userCountry:", userCountry);

        const CurrentCountry = this.SelectedCurrencies.find(
          (item) => item.countryName === userCountry.name
        );

        if (CurrentCountry && originalPrice > 0) {
          //originalPrice*9.95;
          const convertedPrice = await this.getEXchangeRate(
            currencyText,
            CurrentCountry.currency,
            originalPrice
          );

          priceElement.innerText = convertedPrice.toFixed(2); 
          currencyElement.innerText = CurrentCountry.currency; 
        } else {
          console.error("User's country not found or the price is invalid.");
        }
      } catch (error) {
        console.error("An error occurred while fetching user country data:", error);
      }
    },

    async getEXchangeRate(from, to, amount) {
      const token = window.localStorage.getItem("x-auth-token");
      if (!token) {
        console.error("Authentication token is missing.");
        return amount;
      }
      try {
        console.log("Request Payload:", { from, to, amount });
console.log("Headers:", { "x-auth-token": token });
        const response = await fetch(
          "https://gateway.storeino.com/api/paypal/converts/exchange",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              accept: "application/json, text/plain, */*",
              "x-auth-token": `${token}`,
            },
            body: { from, to, amount }, 
          }
        );

        const data = await response.json();
        console.log("🚀 ~ getEXchangeRate ~ data:", data);

        if (response.ok && data.success) {
          this.ExchangeRate = data.result;
          return  data.result;
        } else {
          console.error("Failed to convert currency:", data.message || "Unknown error.");
          return 1;
        }
      } catch (error) {
        console.error("Currency conversion error:", error);
        return 1;
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
