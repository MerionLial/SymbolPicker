/**
 * Class representing a SymbolPicker.
 *
 * Consists of an emoji-picker like UI for selecting a png icon, a button to open it and a preview area where the
 * picked icon is displayed and can be grabbed from.
 */
class SymbolPicker {

  /**
   * Create a new SymbolPicker.
   * @param {string} elementId        - The id of the element to which the picker is attached.
   * @param {string} symbolFilePath   - The path of the symbol files.
   * @param {string} [seedSymbol='']  - [optional] The name of the symbol that should be pre-selected.
   */
  constructor(elementId, symbolFilePath, options = {}) {
    this.uniqueID = '_' + Math.random().toString(36).substr(2, 9);
    this.elementId = elementId;
    this.symbolFilePath = symbolFilePath;
    this.categories = [];
    this.symbols = {};
    this.options = {
      seedSymbol: '',
      apiURL: '',
      urlParams: {
        request_type: 'get_symbols',
        type: 'markers'
      },
      ...options
    };
    this.uiReady = this.initializeUI();
    console.log("picker constructed: "+this.uniqueID);
  }

  /**
   * Initialize the UI by loading the symbols, creating the UI elements and attaching event listeners.
   * @returns {Promise<void>}
   */
  async initializeUI() {
    //check if the seedSymbol set contains a folder name
    if(this.options.seedSymbol.includes('/')){
      const parts = this.options.seedSymbol.split('/');   //if so, we split the string a the /
      this.currentCategory = parts[parts.length - 2];             //and use the last folder before the filename as category
      this.currentSymbol = parts[parts.length - 1];
    }else {
      this.currentCategory = '';
      this.currentSymbol = this.options.seedSymbol;
    }
    await this.loadSymbols();                                     //we need to wait for the symbols to arrive
    await this.createUI();                                        //then wait for all the DOM elements to be created
    this.attachEvents();                                          //and finally we can attach all the event listeners
  }

  /**
   * Show the symbol picker.
   */
  show() {
    this.pickerUI.style.display='block';
  }

  /**
   * Hide the symbol picker.
   */
  hide(){
    this.pickerUI.style.display='none';
  }

  /**
   * Load symbol images from the provided symbolFilePath.
   * @returns {Promise<void>}
   */
  async loadSymbols() {
    try {
      const params = new URLSearchParams(window.location.search);
      const userid = decodeURIComponent(params.get('creator')?.replace(/\+/g, ' ') || '');
      const apiURL = new URL(this.options.apiURL, window.location.origin);
      const apiParams = new URLSearchParams(this.options.urlParams);
      apiURL.search = apiParams;
      const response = await fetch(apiURL);
      const data = await response.json();
      for (let [id, filename] of Object.entries(data)) {
        const parts = filename.split('/');
        const name = parts[parts.length - 1];
        const category = parts[parts.length - 2];
        if (!this.categories.includes(category)) {
          this.categories.push(category);
          this.symbols[category] = [];
        }
        this.symbols[category].push(name);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Create the UI components.
   * @returns {Promise<void>}
   */
  async createUI() {
    // Create the symbol picker UI
    const pickerUI = document.createElement('div');
    pickerUI.classList.add('symbol-picker');
    pickerUI.id="pickerUI"+this.uniqueID;

    // Create the category tabs
    const tabsUI = document.createElement('div');
    tabsUI.classList.add('tabs');
    for (let category of this.categories) {
      const tabUI = document.createElement('button');
      tabUI.classList.add('tab');
      tabUI.id = "tab-"+category; // use the category as the id
      tabUI.textContent = category;
      tabsUI.appendChild(tabUI);
    }
    pickerUI.appendChild(tabsUI);

    // Create the symbol grid
    const symbolsUI = document.createElement('div');
    symbolsUI.classList.add('symbols');
    for (let category of this.categories) {
      const symbolsInCategory = this.symbols[category];
      let categoryUI = document.createElement('div');
      categoryUI.id = "symbol-picker-category-"+category;
      categoryUI.classList.add('symbol-picker-category');
      for (let symbol of symbolsInCategory) {
        const symbolUI = document.createElement('img');
        symbolUI.classList.add('symbol-picker-symbol');
        symbolUI.src = `${this.symbolFilePath}/${category}/${symbol}`;
        symbolUI.alt = symbol;
        categoryUI.appendChild(symbolUI);
      }
      symbolsUI.appendChild(categoryUI);
    }
    pickerUI.appendChild(symbolsUI);
    this.pickerUI=pickerUI;

    // Create the symbol picker preview
    const pickerPreview = document.createElement('div');
    pickerPreview.id="pickerPreview"+this.uniqueID;
    pickerPreview.classList.add('symbol-picker-preview');
    let src = '';
    if (this.currentSymbol !== '') src = this.symbolFilePath+'/'+this.currentSymbol;
    pickerPreview.innerHTML = '<img id="symbol-picker-preview-image" src="'+src+'" alt="'+this.currentSymbol+'">';
    this.currentSymbol = '';  // reset current symbol
    this.pickerPreview = pickerPreview;

    // Create the symbol picker button
    const pickerButton = document.createElement('button');
    pickerButton.id='pickerButton'+this.uniqueID;
    pickerButton.classList.add('symbol-picker-button');
    pickerButton.textContent="Change Symbol";
    this.pickerButton=pickerButton;

    this.currentCategory = this.categories[0];
    // Append the pickerUI to the given element
    let element = document.getElementById(this.elementId);
    element.append(pickerPreview);
    element.append(pickerUI);
    element.append(pickerButton);
    this.highlightSelected();
  }

  /**
   * Attach event listeners to UI elements.
   */
  attachEvents() {
    const elementUI = document.getElementById(this.elementId);
    const pickerButton = elementUI.querySelector('.symbol-picker-button');
    const pickerUI = document.querySelector('.symbol-picker');
    const tabsUI = pickerUI.querySelector('.tabs');
    const symbolsUI = pickerUI.querySelector('.symbols');

    tabsUI.addEventListener('click', event => {
      const tabElement = event.target.closest('.tab');
      if (tabElement || event.target.classList.contains('tab')) {
        this.currentCategory = event.target.id.replace("tab-", "");
        this.currentSymbol = this.symbols[this.currentCategory][0];
        this.highlightSelected();
      }
    });

    symbolsUI.addEventListener('click', event => {
      if (event.target.tagName.toLowerCase() === 'img') {
        this.currentSymbol = event.target.alt;
        this.highlightSelected();
        this.hide();
      }
    });

    pickerButton.addEventListener('click', event => {
        this.show();
    });

  }

  /**
   * Highlight the selected symbol and category.
   */
  highlightSelected() {
    const pickerUI = document.querySelector('.symbol-picker');
    const tabsUI = pickerUI.querySelector('.tabs');
    const symbolsUI = pickerUI.querySelector('.symbols');

    // Highlight the selected category and symbol
    for (let tabUI of tabsUI.children) {
      if (tabUI.id === "tab-"+this.currentCategory) {
        tabUI.classList.add('selected');
      } else {
        tabUI.classList.remove('selected');
      }
    }

    // Hide all categories
    for (let categoryUI of symbolsUI.children) {
      categoryUI.style.display = 'none';
    }

    // Show the selected category
    const selectedCategoryUI = document.getElementById('symbol-picker-category-' + this.currentCategory);
    if (selectedCategoryUI) {
      selectedCategoryUI.style.display = 'block';
      if (this.symbols[this.currentCategory].includes(this.currentSymbol)) {
        for (let symbolUI of selectedCategoryUI.children) {
          if (symbolUI.alt === this.currentSymbol) {
            symbolUI.classList.add('selected');
          } else {
            symbolUI.classList.remove('selected');
          }
        }
      }
    }

    // Update the preview
    if (this.currentSymbol !== '') {
      console.log(this.currentSymbol);
      let previewImage = document.getElementById('symbol-picker-preview-image');
      if (previewImage) {
        previewImage.src = `${this.symbolFilePath}/${this.currentCategory}/${this.currentSymbol}`;
        previewImage.alt = this.currentSymbol;
      }else{
        previewImage = document.createElement('img');
        previewImage.src = '';

      }
    }
  }

  /**
   * Set the icon for a folder.
   * @param {string} folder - The name of the folder.
   * @param {string} icon   - The icon for the folder.
   * @returns {Promise<void>}
   */
  async setFolderIcon(folder, icon) {
    await this.uiReady;
    const pickerUI = document.querySelector('.symbol-picker');
    const tabsUI = pickerUI.querySelector('.tabs');
    const tabButton = Array.from(tabsUI.children).find(tab => tab.id === "tab-"+folder);

    if (icon.startsWith('fa-')) { // Handle Font Awesome icons
      tabButton.textContent = ''; // Clear text content
      const iconElement = document.createElement('i');
      iconElement.classList.add('fa', icon);
      iconElement.id=folder;
      tabButton.appendChild(iconElement);
    } else if (icon.startsWith('img:')) { // Handle image icons
      tabButton.textContent = ''; // Clear text content
      const iconUrl = icon.slice(4); // Get URL part
      const iconElement = document.createElement('img');
      iconElement.src = iconUrl;
      iconElement.classList.add('icon');
      tabButton.appendChild(iconElement);
    } else { // Handle Unicode or other text-based icons
      tabButton.textContent = icon;
    }
  }

  /**
   * Set the order of the tabs.
   * @param {Array<string>} orderArray - An array containing the names of the tabs in the preferred order.
   * @returns {Promise<void>}
   */
  async setTabOrder(orderArray) {
    await this.uiReady;
    const pickerUI = document.querySelector('.symbol-picker');
    const tabsUI = pickerUI.querySelector('.tabs');
    const tabs = Array.from(tabsUI.children);
    const orderedTabs = orderArray.map(category => tabs.find(tab => tab.id === "tab-"+category));
    tabsUI.innerHTML = '';
    for (let tab of orderedTabs) {
      tabsUI.appendChild(tab);
    }
    // Update selected tab in UI so that the first tab is selected
    if (orderArray.length > 0)this.currentCategory = orderArray[0];
    this.highlightSelected()
  }

  /**
   * Destroy the symbol picker.
   */
  destroy() {
    console.log("picker destroyed: "+this.uniqueID);
    const pickerUI = document.querySelector('.symbol-picker');
    const pickerButton = document.querySelector('.symbol-picker-button');
    const pickerPreview = document.querySelector('.symbol-picker-preview');
    if (pickerUI) pickerUI.parentNode.removeChild(pickerUI);
    if (pickerButton) pickerButton.parentNode.removeChild(pickerButton);
    if (pickerPreview) pickerPreview.parentNode.removeChild(pickerPreview);
  }

}