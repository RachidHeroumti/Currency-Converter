var vm = new StoreinoApp({
  el: "#app_currencyconverter",
  data: {
    data: __DATA__,
    query: "",
    errorhint: {
      place: "default",
      text: "error!",
    },
    searchData: [],
    selectedList: [],
    backgroundColor: "#ffffff",
    contentColor: "#000000",
    showAdvance: false,
    configData: [],
  },
  watch: {
    query(value) {
      // Debounce the search to improve performance
      this.debouncedGetCurrency(value);
    },
    selectedList(newList) {
      console.log("Updated selected list:", newList);
      // Update data.SelectedCurrencies to match selectedList
      this.$set(this.data, "SelectedCurrencies", [...newList]);
    },
  },
  mounted() {
    // Initialize selectedList with preselected currencies
    this.selectedList = [...this.data.SelectedCurrencies];
  },
  methods: {
    // Debounce implementation for search
    debounce(func, wait) {
      let timeout;
      return function (...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    // Initialize debounced search function
    debouncedGetCurrency: null,
    getCurrency(value) {
      try {
        const lowerCaseQuery = value.toLowerCase();
        this.searchData = this.data.AllCountries.filter((country) =>
          country.countryName.toLowerCase().startsWith(lowerCaseQuery)
        );
        console.log("Search results:", this.searchData);
      } catch (error) {
        console.error("Error in getCurrency:", error);
        this.errorhint.text = "Search failed. Please try again.";
      }
    },
    AddCurrencyToList(item) {
      // Prevent duplicate entries
      if (!this.selectedList.some((selected) => selected.countryName === item.countryName)) {
        this.selectedList.push(item);
      }
    },
    RemoveFromList(item) {
      // Remove the item from selectedList
      this.selectedList = this.selectedList.filter(
        (country) => country.countryName !== item.countryName
      );
    },
    SelectAllCurrencies(event) {
      if (event.target.checked) {
        // Select all countries
        this.selectedList = [...this.data.AllCountries];
      } else {
        // Deselect all countries
        this.selectedList = [];
      }
    },
    svg(name) {
      const icons = {
        edit: '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M80 0v-160h800V0H80Zm160-320h56l312-311-29-29-28-28-311 312v56Zm-80 80v-170l448-447q11-11 25.5-17t30.5-6q16 0 31 6t27 18l55 56q12 11 17.5 26t5.5 31q0 15-5.5 29.5T777-687L330-240H160Zm560-504-56-56 56 56ZM608-631l-29-29-28-28 57 57Z"/></svg>',
        delete:
          '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>',
        add: '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#ffffff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>',
        open: '<svg xmlns="http://www.w3.org/2000/svg"  height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="m280-400 200-200 200 200H280Z"/></svg>',
        close:
          '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M480-360 280-560h400L480-360Z"/></svg>',
        styles:
          '<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#5f6368"><path d="M340-540H200q-33 0-56.5-23.5T120-620v-140q0-33 23.5-56.5T200-840h140q33 0 56.5 23.5T420-760v140q0 33-23.5 56.5T340-540Zm-140-80h140v-140H200v140Zm140 500H200q-33 0-56.5-23.5T120-200v-140q0-33 23.5-56.5T200-420h140q33 0 56.5 23.5T420-340v140q0 33-23.5 56.5T340-120Zm-140-80h140v-140H200v140Zm560-340H620q-33 0-56.5-23.5T540-620v-140q0-33 23.5-56.5T620-840h140q33 0 56.5 23.5T840-760v140q0 33-23.5 56.5T760-540Zm-140-80h140v-140H620v140Zm140 500H620q-33 0-56.5-23.5T540-200v-140q0-33 23.5-56.5T620-420h140q33 0 56.5 23.5T840-340v140q0 33-23.5 56.5T760-120Zm-140-80h140v-140H620v140ZM340-620Zm0 280Zm280-280Zm0 280Z"/></svg>',
        cancel:
          '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>',
        done: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#314D1C"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q65 0 123 19t107 53l-58 59q-38-24-81-37.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-18-2-36t-6-35l65-65q11 32 17 66t6 70q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-56-216L254-466l56-56 114 114 400-401 56 56-456 457Z"/></svg>',
        drag: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#AB4459"><path d="M200-380v-40h560v40H200Zm0-160v-40h560v40H200Z"/></svg>',
        settings:
          '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="##434343"><path d="m387.69-100-15.23-121.85q-16.07-5.38-32.96-15.07-16.88-9.7-30.19-20.77L196.46-210l-92.3-160 97.61-73.77q-1.38-8.92-1.96-17.92-.58-9-.58-17.93 0-8.53.58-17.34t1.96-19.27L104.16-590l92.3-159.23 112.46 47.31q14.47-11.46 30.89-20.96t32.27-15.27L387.69-860h184.62l15.23 122.23q18 6.54 32.57 15.27 14.58 8.73 29.43 20.58l114-47.31L855.84-590l-99.15 74.92q2.15 9.69 2.35 18.12.19 8.42.19 16.96 0 8.15-.39 16.58-.38 8.42-2.76 19.27L854.46-370l-92.31 160-112.61-48.08q-14.85 11.85-30.31 20.96-15.46 9.12-31.69 14.89L572.31-100H387.69ZM440-160h78.62L533-267.15q30.62-8 55.96-22.73 25.35-14.74 48.89-37.89L737.23-286l39.39-68-86.77-65.38q5-15.54 6.8-30.47 1.81-14.92 1.81-30.15 0-15.62-1.81-30.15-1.8-14.54-6.8-29.7L777.38-606 738-674l-100.54 42.38q-20.08-21.46-48.11-37.92-28.04-16.46-56.73-23.31L520-800h-79.38l-13.24 106.77q-30.61 7.23-56.53 22.15-25.93 14.93-49.47 38.46L222-674l-39.38 68L269-541.62q-5 14.24-7 29.62t-2 32.38q0 15.62 2 30.62 2 15 6.62 29.62l-86 65.38L222-286l99-42q22.77 23.38 48.69 38.31 25.93 14.92 57.31 22.92L440-160Zm40.46-200q49.92 0 84.96-35.04 35.04-35.04 35.04-84.96 0-49.92-35.04-84.96Q530.38-600 480.46-600q-50.54 0-85.27 35.04T360.46-480q0 49.92 34.73 84.96Q429.92-360 480.46-360ZM480-480Z"/></svg>',
        search:
          '<svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#960d3b"><path d="M629.23-180H172.31Q142-180 121-201q-21-21-21-51.31v-455.38Q100-738 121-759q21-21 51.31-21h615.38Q818-780 839-759q21 21 21 51.31v455.38Q860-222 839-201q-21 21-51.31 21h-44.46L552.92-370.31q-19.84 15.15-43.38 22.73Q486-340 460-340q-66.54 0-113.27-46.73Q300-433.46 300-500q0-66.54 46.73-113.27Q393.46-660 460-660q66.54 0 113.27 46.73Q620-566.54 620-500q0 24.31-5.85 45.23-5.84 20.92-19.84 41.54L767.54-240h20.15q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H172.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v455.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h396.92l60 60ZM460-400q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29ZM160-240v-480 480Z"/></svg>',
          unchecked : '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#960d3b"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/></svg>',
          checked:'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#960d3b"><path d="m424-325.85 268.92-268.92-42.15-42.15L424-410.15l-114-114L267.85-482 424-325.85ZM212.31-140Q182-140 161-161q-21-21-21-51.31v-535.38Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM200-760v560-560Z"/></svg>',
       up:'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m357-384 123-123 123 123 57-56-180-180-180 180 57 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
       down:'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m480-340 180-180-57-56-123 123-123-123-57 56 180 180Zm0 260q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>'
        };
      return icons[name] || "";
    },
  },
  created() {
    // Assign debounced method during initialization
    this.debouncedGetCurrency = this.debounce(this.getCurrency, 300);
  },
});
